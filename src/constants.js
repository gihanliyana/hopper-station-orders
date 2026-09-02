// Shared staff password for the /admin (order desk) and /handover
// (pickup counter) dashboards. Override with VITE_ADMIN_PASSWORD in your
// .env file or Vercel project settings.
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'hoppers@123';

export const STATUS = {
  QUEUED: 'queued', // customer entered their token, name and phone
  ACCEPTED: 'accepted', // order desk accepted it, sent to kitchen
  PREPARING: 'preparing', // kitchen is actively making it
  DONE: 'done', // ready, waiting at the pickup counter
  COMPLETED: 'completed', // handed to the customer
};

export const STATUS_LABELS = {
  [STATUS.QUEUED]: 'In line',
  [STATUS.ACCEPTED]: 'Order accepted',
  [STATUS.PREPARING]: 'On the pan',
  [STATUS.DONE]: 'Ready for pickup',
  [STATUS.COMPLETED]: 'Picked up',
};

export const SPICE_LEVEL = {
  SPICY: 'spicy',
  MILD: 'mild',
};

export const SPICE_LABELS = {
  [SPICE_LEVEL.SPICY]: 'Spicy — Lunu miris',
  [SPICE_LEVEL.MILD]: 'Mild — Seeni sambol',
};

export const DIET = {
  VEGETARIAN: 'vegetarian',
  EGG: 'egg',
};

export const DIET_LABELS = {
  [DIET.VEGETARIAN]: 'Vegetarian',
  [DIET.EGG]: 'Egg',
};
