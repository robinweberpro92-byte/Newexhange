export function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function loadJson(key, fallback) {
  if (typeof window === 'undefined') return cloneValue(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : cloneValue(fallback);
  } catch {
    return cloneValue(fallback);
  }
}

export function saveJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function makeId(prefix = 'ID') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isLikelyUrl(value) {
  const input = String(value || '').trim();
  if (!input) return false;
  if (input.startsWith('/')) return true;
  if (input.startsWith('data:image/')) return true;
  return /^https?:\/\//i.test(input);
}

export function toPositiveNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function toArrayFromCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export function toCsvString(rows) {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const serialize = (cell) => {
    const stringValue = String(cell ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => serialize(row[header])).join(',')),
  ].join('\n');
}

export function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
