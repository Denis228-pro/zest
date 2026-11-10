import { STATUS_FLOW, STATUS_META } from '../context/StoreContext';
import type { Order } from '../context/StoreContext';
import { fmtTime } from '../utils/format';
import { Icon } from './icons';

export function OrderTimeline({ order }: { order: Order }) {
  const idx = STATUS_FLOW.indexOf(order.status);
  return (
    <div className="tl">
      {STATUS_FLOW.map((s, i) => {
        const meta = STATUS_META[s];
        const done = i < idx;
        const active = i === idx;
        const future = i > idx;
        const t = order.statusAt[s];
        return (
          <div
            key={s}
            className={`tl__row ${done ? 'tl__row--done' : ''} ${active ? 'tl__row--active' : ''} ${future ? 'tl__row--future' : ''}`}
          >
            <div className="tl__rail">
              <span className="tl__dot">{done ? <Icon name="check" size={10} /> : null}</span>
              {i < STATUS_FLOW.length - 1 ? <span className="tl__line" /> : null}
            </div>
            <div className="tl__body">
              <div className="tl__title">
                {meta.title}
                {t ? <span className="tl__time">{fmtTime(t)}</span> : null}
              </div>
              <div className="tl__desc">{meta.desc}</div>
            </div>
          </div>
        );
      })}
      {order.status === 'transit' ? (
        <div className="tl__courier">
          <div className="tl__track">
            <span className="tl__scoot">
              <Icon name="bolt" size={16} />
            </span>
          </div>
          Курьер Игорь · красный скутер · примерно 15 минут
        </div>
      ) : null}
    </div>
  );
}
