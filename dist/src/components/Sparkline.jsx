import { makePath } from '../utils/charts';

export default function Sparkline({ points, positive = true, height = 56 }) {
  const path = makePath(points, 160, height, 6);
  return (
    <svg className={`sparkline ${positive ? 'sparkline--up' : 'sparkline--down'}`} viewBox={`0 0 160 ${height}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
