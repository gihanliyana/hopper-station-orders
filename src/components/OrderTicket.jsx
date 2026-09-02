import { STATUS, SPICE_LABELS, DIET_LABELS } from '../constants';

const ACCENTS = {
  [STATUS.QUEUED]: 'border-chili/40 bg-chili/5',
  [STATUS.ACCEPTED]: 'border-turmeric/50 bg-turmeric/10',
  [STATUS.PREPARING]: 'border-clay/50 bg-clay/10',
  [STATUS.DONE]: 'border-curry/50 bg-curry/10',
};

// showDetails controls the staff-only info row (phone, spice level, diet).
// The public stall display passes showDetails={false} so customers only
// ever see a token number and a name.
export default function OrderTicket({ order, actionLabel, onAction, showDetails = true }) {
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

        {showDetails && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="text-xs text-brown-900/50">{order.phone}</span>
            {order.spiceLevel && <Tag>{SPICE_LABELS[order.spiceLevel]}</Tag>}
            {order.diet && <Tag>{DIET_LABELS[order.diet]}</Tag>}
          </div>
        )}
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

function Tag({ children }) {
  return (
    <span className="text-[11px] leading-none px-1.5 py-1 rounded border border-brown-900/15 text-brown-900/60">
      {children}
    </span>
  );
}
