import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useRouter } from '../context/RouterContext';
import { fmtMoney } from '../utils/format';
import { taptic } from '../bridge/vkApi';
import { Confetti } from '../components/Confetti';
import { Button } from '../components/ui';
import { Icon } from '../components/icons';

export function SuccessScreen({ id }: { id: number }) {
  const { state } = useStore();
  const router = useRouter();
  const order = state.orders.find(o => o.id === id);

  useEffect(() => {
    taptic('success');
  }, []);

  if (!order) {
    return (
      <div className="success">
        <div className="success__t">Заказ оформлен</div>
        <div className="success__btns">
          <Button block onClick={() => router.reset()}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="success">
      <Confetti />
      <div className="success__check">
        <Icon name="check" size={44} />
      </div>
      <div className="success__t">Заказ #{order.id} в работе</div>
      <div className="success__d">Склад уже собирает ваш заряд. Курьер будет ориентировочно через 40–60 минут.</div>
      <div className="success__amount">
        {fmtMoney(order.total)} · VK Pay · {order.slot}
      </div>
      <div className="success__btns">
        <Button block onClick={() => router.replace('order', { id: String(order.id) })}>
          Отслеживать заказ
        </Button>
        <Button variant="ghost" block onClick={() => router.reset()}>
          На главную
        </Button>
      </div>
    </div>
  );
}
