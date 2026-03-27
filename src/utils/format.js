export function euro(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: safeValue >= 100 ? 0 : 2,
  }).format(safeValue);
}

export function compact(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safeValue);
}

export function pct(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sign = safeValue > 0 ? '+' : '';
  return `${sign}${safeValue.toFixed(2)}%`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatInputDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function routeLabel(pathname) {
  const labels = {
    all: 'Toutes les pages',
    '/': 'Accueil',
    '/exchange': 'Exchange',
    '/market': 'Market',
    '/dashboard': 'Dashboard',
    '/transactions': 'Transactions',
    '/login': 'Login',
  };
  return labels[pathname] || pathname;
}

export function statusTone(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('confirm')) return 'success';
  if (value.includes('attente') || value.includes('cours')) return 'warning';
  if (value.includes('suspend') || value.includes('rejet')) return 'danger';
  if (value.includes('vérifi') || value.includes('verifi')) return 'info';
  return 'neutral';
}
