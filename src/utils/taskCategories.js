export const TASK_CATEGORIES = [
  { id: 'garden',      label: 'Garden',       icon: 'leaf',       color: '#5B8A3C' },
  { id: 'animals',     label: 'Animals',      icon: 'paw',        color: '#8D6E63' },
  { id: 'bees',        label: 'Bees',         icon: 'bug',        color: '#F5A623' },
  { id: 'maintenance', label: 'Maintenance',  icon: 'construct',  color: '#607D8B' },
  { id: 'food',        label: 'Food & Preserve', icon: 'nutrition', color: '#E57373' },
  { id: 'general',     label: 'General',      icon: 'home',       color: '#26A69A' },
];

export const PRIORITY_COLORS = {
  high: '#C0392B',
  medium: '#F39C12',
  low: '#5B8A3C',
};

export const RECURRING_OPTIONS = [
  { id: 'none',    label: 'No Repeat' },
  { id: 'daily',   label: 'Daily' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly' },
];

export function nextRecurringDate(dueDateISO, recurring) {
  if (!dueDateISO || recurring === 'none') return null;
  const d = new Date(dueDateISO);
  switch (recurring) {
    case 'daily':   d.setDate(d.getDate() + 1); break;
    case 'weekly':  d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly':  d.setFullYear(d.getFullYear() + 1); break;
    default: return null;
  }
  return d.toISOString();
}
