-- =========================================================
-- ZeSt Supabase schema — выполнить целиком в SQL Editor
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text default '',
  name text default '',
  phone text default '',
  bonus_balance integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  name text not null,
  brand text default '',
  category text not null default 'energy',
  volume numeric not null default 0.5,
  price integer not null default 0,
  flavors text[] default '{}',
  caffeine integer default 0,
  kcal integer default 0,
  protein numeric default 0,
  fat numeric default 0,
  carbs numeric default 0,
  composition text default '',
  description text default '',
  badge text,
  limited boolean not null default false,
  rating numeric not null default 4.6,
  active boolean not null default true,
  sort integer not null default 0,
  can_body text default '#FF6A00',
  can_label text default '#FFFFFF',
  can_accent text default '#F05A00',
  can_big text default 'Z',
  can_small text default 'ZeSt'
);

create table public.promos (
  code text primary key,
  type text not null default 'percent',
  value integer not null default 0,
  description text default '',
  min_subtotal integer,
  club_only boolean not null default false,
  first_order_only boolean not null default false,
  needs_unlock boolean not null default false,
  active boolean not null default true
);

create table public.banners (
  id text primary key,
  kicker text default '',
  title text not null,
  text text default '',
  cta text default 'Открыть',
  cls text default 'banner--red',
  action_type text default 'none',
  action_id text,
  action_category text,
  action_badge text,
  active boolean not null default true
);

create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id),
  status text not null default 'accepted',
  subtotal integer not null default 0,
  delivery integer not null default 0,
  discount integer not null default 0,
  bonus_used integer not null default 0,
  bonus_earned integer not null default 0,
  total integer not null default 0,
  address text not null default '',
  slot text default '',
  phone text default '',
  comment text default '',
  rated boolean not null default false,
  history jsonb not null default '[]',
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id text default '',
  name text default '',
  qty integer not null default 1,
  unit_price integer not null default 0
);

create table public.bonus_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id),
  amount integer not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan text not null default 'month',
  until timestamptz not null,
  paused boolean not null default false
);

-- =========================================================
-- Хелпер админа
-- =========================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- =========================================================
-- Профиль при регистрации + приветственные 300 бонусов
-- =========================================================

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, bonus_balance)
  values (new.id, coalesce(new.email, ''), split_part(coalesce(new.email, 'friend@zest.ru'), '@', 1), 300);
  insert into public.bonus_transactions (user_id, amount, reason)
  values (new.id, 300, 'Приветственный бонус');
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- Защита служебных полей профиля от правки самим юзером
-- =========================================================

create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.bonus_balance is distinct from old.bonus_balance
     or new.is_admin is distinct from old.is_admin then
    if not public.is_admin() then
      raise exception 'bonus_balance and is_admin are protected';
    end if;
  end if;
  return new;
end $$;

create trigger trg_protect_profile
before update on public.profiles
for each row execute function public.protect_profile();

-- =========================================================
-- Заказы: история статусов + кэшбэк при «Доставлен»
-- =========================================================

create or replace function public.order_history_init() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.history := jsonb_build_array(jsonb_build_object('status', 'accepted', 't', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
  return new;
end $$;

create trigger trg_order_history_init
before insert on public.orders
for each row execute function public.order_history_init();

create or replace function public.order_status_changed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    new.history := coalesce(old.history, '[]'::jsonb) || jsonb_build_object(
      'status', new.status,
      't', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );
    if new.status = 'delivered' then
      new.delivered_at := now();
      update public.profiles set bonus_balance = bonus_balance + new.bonus_earned
        where id = new.user_id;
      insert into public.bonus_transactions (user_id, amount, reason)
        values (new.user_id, new.bonus_earned, 'Кэшбэк: заказ #' || new.id);
    end if;
  end if;
  return new;
end $$;

create trigger trg_order_status
before update on public.orders
for each row execute function public.order_status_changed();

-- =========================================================
-- RPC: оформление заказа (транзакция + списание бонусов)
-- =========================================================

create or replace function public.place_order(payload jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_id bigint;
  v_bonus_used int := coalesce((payload->>'bonusUsed')::int, 0);
  v_balance int := 0;
  v_total int := coalesce((payload->>'total')::int, 0);
  v_items jsonb := coalesce(payload->'items', '[]'::jsonb);
begin
  if uid is null then raise exception 'auth required'; end if;
  if v_total <= 0 then raise exception 'invalid total'; end if;

  select bonus_balance into v_balance from public.profiles where id = uid for update;
  if v_bonus_used > 0 then
    if v_bonus_used > v_balance then raise exception 'insufficient bonuses'; end if;
    if v_bonus_used > floor(v_total * 0.5) then raise exception 'bonus limit is 50% of total'; end if;
  end if;

  insert into public.orders (
    user_id, status, subtotal, delivery, discount, bonus_used, bonus_earned, total,
    address, slot, phone, comment
  ) values (
    uid, 'accepted',
    coalesce((payload->>'subtotal')::int, 0),
    coalesce((payload->>'delivery')::int, 0),
    coalesce((payload->>'discount')::int, 0),
    v_bonus_used,
    0,
    v_total,
    coalesce(payload->>'address', ''),
    coalesce(payload->>'slot', ''),
    coalesce(payload->>'phone', ''),
    coalesce(payload->>'comment', '')
  ) returning id into v_id;

  if v_bonus_used > 0 then
    update public.profiles set bonus_balance = bonus_balance - v_bonus_used where id = uid;
    insert into public.bonus_transactions (user_id, amount, reason)
      values (uid, -v_bonus_used, 'Оплата бонусами: заказ #' || v_id);
  end if;

  insert into public.order_items (order_id, product_id, name, qty, unit_price)
  select v_id,
         coalesce(item->>'productId', ''),
         coalesce(item->>'name', ''),
         coalesce((item->>'qty')::int, 1),
         coalesce((item->>'unitPrice')::int, 0)
  from jsonb_array_elements(v_items) as item;

  return v_id;
end $$;

-- =========================================================
-- RPC: оценка заказа (+50 разово)
-- =========================================================

create or replace function public.rate_order(p_order_id bigint) returns integer
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_user uuid;
  v_rated boolean;
begin
  if uid is null then raise exception 'auth required'; end if;
  select user_id, rated into v_user, v_rated from public.orders where id = p_order_id;
  if v_user is distinct from uid then raise exception 'not your order'; end if;
  if v_rated then return 0; end if;
  update public.orders set rated = true where id = p_order_id;
  update public.profiles set bonus_balance = bonus_balance + 50 where id = uid;
  insert into public.bonus_transactions (user_id, amount, reason)
    values (uid, 50, 'Отзыв: заказ #' || p_order_id);
  return 50;
end $$;

-- =========================================================
-- RPC: подписка ZeSt Club
-- =========================================================

create or replace function public.club_subscribe(p_plan text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_until timestamptz;
  v_days int := case when p_plan = 'year' then 365 else 30 end;
begin
  if uid is null then raise exception 'auth required'; end if;
  select until into v_until from public.subscriptions where user_id = uid;
  v_until := greatest(coalesce(v_until, now()), now()) + make_interval(days => v_days);
  insert into public.subscriptions (user_id, plan, until, paused)
    values (uid, p_plan, v_until, false)
    on conflict (user_id) do update set plan = p_plan, until = v_until, paused = false;
  return v_until;
end $$;

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.promos enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.bonus_transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "products public read" on public.products for select using (active or public.is_admin());
create policy "products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "promos public read" on public.promos for select using (active or public.is_admin());
create policy "promos admin write" on public.promos for all
  using (public.is_admin()) with check (public.is_admin());

create policy "banners public read" on public.banners for select using (active or public.is_admin());
create policy "banners admin write" on public.banners for all
  using (public.is_admin()) with check (public.is_admin());

create policy "orders read own or admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders insert own" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders update admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "items read own or admin" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
create policy "items insert own" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "bonus read own or admin" on public.bonus_transactions
  for select using (auth.uid() = user_id or public.is_admin());

create policy "subs read own or admin" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

-- =========================================================
-- Realtime для заказов
-- =========================================================

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then
  null;
end $$;
