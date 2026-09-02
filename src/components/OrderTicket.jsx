import { STATUS } from '../constants';

const ACCENTS = {
  [STATUS.QUEUED]: 'border-chili/40 bg-chili/5',
  [STATUS.ACCEPTED]: 'border-turmeric/50 bg-turmeric/10',
  [STATUS.PREPARING]: 'border-clay/50 bg-clay/10',
  [STATUS.DONE]: 'border-curry/50 bg-curry/10',
};

export default function OrderTicket({ order, actionLabel, onAction }) {
  return (
    <div
      className={`rounded-xl border-2 px-4 py-3 flex items-center justify-between gap-3 ${
        ACCENTS[order.status] || 'border-brown-900/10'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl text-brown-900">#{order.token}</span>
          <span className="text-brown-900/80 truncate">{order.name}</span>
        </div>
        <p className="text-xs text-brown-900/50 mt-0.5">{order.phone}</p>
      </div>

      {actionLabel && (
        <button
          onClick={() => onAction(order)}
          className="shrink-0 rounded-lg bg-brown-900 text-cream text-sm px-3 py-2 hover:bg-brown-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
