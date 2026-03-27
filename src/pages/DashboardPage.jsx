import Card from '../components/Card';
import MarketTable from '../components/MarketTable';
import Sparkline from '../components/Sparkline';
import { useApp } from '../context/AppContext';
import { compact, euro, formatDateTime } from '../utils/format';

export default function DashboardPage() {
  const { config, auth } = useApp();
  const topAsset = [...config.market.assets].sort((left, right) => Number(right.price || 0) - Number(left.price || 0))[0];
  const recentTransactions = config.transactions.slice(0, 4);
  const totalBalance = recentTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">Dashboard</span>
        <h1>Vue opérateur / utilisateur</h1>
        <p>{config.content.dashboard.welcomeMessage}</p>
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card dashboard-card--hero">
          <div className="section-row">
            <div>
              <p className="eyebrow">Solde estimé</p>
              <h2>{euro(totalBalance || config.analytics.averageTransaction)}</h2>
            </div>
            <span className="pill">{auth.loggedIn ? 'Admin connecté' : 'Visiteur'}</span>
          </div>
          <Sparkline points={config.analytics.dailyVolume7} positive height={92} />
        </Card>

        <Card className="dashboard-card">
          <p className="eyebrow">PayPal actif</p>
          <h3>{config.payments.paypalEmail}</h3>
          <p className="muted">{config.payments.paypalDisplayName}</p>
        </Card>

        <Card className="dashboard-card">
          <p className="eyebrow">Volume total</p>
          <h3>{euro(config.analytics.volumeTotal)}</h3>
          <p className="muted">Revenu estimé {euro(config.analytics.volumeTotal * (config.exchange.globalFeePercent / 100))}</p>
        </Card>

        <Card className="dashboard-card">
          <p className="eyebrow">Top asset</p>
          <h3>{topAsset?.symbol || '—'}</h3>
          <p className="muted">{topAsset ? euro(topAsset.price) : 'Aucune crypto active'}</p>
        </Card>
      </div>

      <div className="two-col section">
        <Card>
          <div className="section-row">
            <div>
              <p className="eyebrow">Activité récente</p>
              <h3>Dernières opérations</h3>
            </div>
          </div>
          <div className="activity-list">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="activity-row">
                <div>
                  <strong>{transaction.id}</strong>
                  <span>{transaction.userName}</span>
                </div>
                <div>
                  <strong>{euro(transaction.amount)}</strong>
                  <span>{formatDateTime(transaction.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="section-row">
            <div>
              <p className="eyebrow">KPI</p>
              <h3>Répartition simulée</h3>
            </div>
          </div>
          <div className="stack-bars">
            {config.analytics.assetDistribution.map((item) => (
              <div key={item.symbol}>
                <span>{item.symbol}</span>
                <b style={{ width: `${Math.max(10, item.volume)}%` }} />
                <small>{compact(item.volume)}</small>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <MarketTable limit={4} />
    </section>
  );
}
