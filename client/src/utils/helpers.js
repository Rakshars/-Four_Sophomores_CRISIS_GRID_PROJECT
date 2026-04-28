export const PRIORITY_COLORS = {
  CRITICAL: '#ff3030',
  HIGH:     '#ff8c00',
  MEDIUM:   '#ffd600',
};

export const TYPE_COLORS = {
  medical: '#4fc3f7',
  food:    '#00e676',
  rescue:  '#ff8c00',
};

export const TYPE_ICONS = {
  medical: '🏥',
  food:    '🍞',
  rescue:  '🚁',
};

export const STATUS_COLORS = {
  pending:     '#7a8099',
  'awaiting-approval': '#ff8c00',
  assigned:    '#4fc3f7',
  'in-progress': '#00e676',
  completed:   '#444',
};

export function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatEta(mins) {
  if (mins === null || mins === undefined) return '—';
  if (mins === 0) return 'Arrived';
  return `${mins} min${mins !== 1 ? 's' : ''}`;
}

export function getArrivalTime(mins) {
  if (mins === null || mins === undefined) return '';
  const arrivalTime = new Date(Date.now() + mins * 60000);
  return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getTrackingStatus(mins, progress) {
  if (mins === null || mins === undefined) return 'Dispatching...';
  if (mins === 0 || progress >= 1) return 'On Site';
  if (mins <= 2) return 'Arriving almost immediately';
  if (mins <= 5) return 'Arriving soon';
  if (progress > 0.05) return 'On the way';
  return 'Driver assigned & moving';
}
