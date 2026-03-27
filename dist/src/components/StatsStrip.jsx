import Card from './Card';
import { useApp } from '../context/AppContext';
import { euro } from '../utils/format';

export default function StatsStrip() {
  const { config } = useApp();

  const stats = [
    { label: 'Volume total mock', value: euro(config.analytics.volumeTotal) },
    { label: 'Frais globaux', value: `${config.exchange.globalFeePercent}%` },
    { label: 'Délai de confirmation', value: config.payments.confirmationDelay },
    { label: 'Support', value: config.branding.supportEmail },
  ];

  return (
    <div className="stats-strip">
      {stats.map((item) => (
        <Card key={item.label} className="stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </Card>
      ))}
    </div>
  );
}
