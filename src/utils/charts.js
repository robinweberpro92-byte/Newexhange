export function makePath(points, width = 160, height = 56, padding = 4) {
  if (!points?.length) return '';

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (points.length - 1 || 1);
      const y = height - padding - ((point - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}
