import { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { authSendOtp, authVerifyOtp } from '../api/supabase';
import { StackScreen } from '../components/StackScreen';
import { Button } from '../components/ui';
import { Logo } from '../components/Logo';

export function AuthScreen() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast('Введите корректный email');
      return;
    }
    setBusy(true);
    try {
      await authSendOtp(email.trim());
      setSent(true);
      toast('Код отправлен на почту');
    } catch (e: any) {
      toast(e?.message ?? 'Не удалось отправить код');
    }
    setBusy(false);
  };

  const verify = async () => {
    if (code.replace(/\D/g, '').length < 6) {
      toast('Введите 6-значный код из письма');
      return;
    }
    setBusy(true);
    try {
      await authVerifyOtp(email.trim(), code.replace(/\D/g, ''));
      toast('Вы вошли в ZeSt');
      router.back();
    } catch (e: any) {
      toast(e?.message ?? 'Неверный или просроченный код');
    }
    setBusy(false);
  };

  return (
    <StackScreen title="Вход">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0 8px' }}>
        <Logo size={72} />
      </div>
      <h1 className="pd__name" style={{ textAlign: 'center', fontSize: 20 }}>
        Вход в ZeSt
      </h1>
      <p className="muted" style={{ textAlign: 'center', fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>
        Один аккаунт — бонусы, заказы и Club на всех устройствах. Пароль не нужен: вход по коду из письма.
      </p>

      {!sent ? (
        <>
          <input
            className="input"
            style={{ marginTop: 18 }}
            placeholder="Электронная почта"
            inputMode="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div style={{ marginTop: 12 }}>
            <Button block disabled={busy} onClick={send}>
              {busy ? 'Отправляем...' : 'Получить код'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="ok" style={{ marginTop: 18, fontWeight: 700, fontSize: 13.5, textAlign: 'center' }}>
            Код отправлен на {email}
          </div>
          <input
            className="input"
            style={{ marginTop: 12, textAlign: 'center', letterSpacing: 8, fontSize: 18 }}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <div style={{ marginTop: 12 }}>
            <Button block disabled={busy} onClick={verify}>
              {busy ? 'Проверяем...' : 'Войти'}
            </Button>
          </div>
          <button className="section__link" style={{ marginTop: 10, textAlign: 'center' }} onClick={() => setSent(false)}>
            Отправить код ещё раз
          </button>
        </>
      )}

      <div className="muted" style={{ fontSize: 11.5, marginTop: 18, textAlign: 'center', lineHeight: 1.5 }}>
        Регистрация автоматическая: первого входа создаёт аккаунт и начисляет 300 приветственных бонусов.
      </div>
    </StackScreen>
  );
}
