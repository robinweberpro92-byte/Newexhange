import Card from './Card';
import Sparkline from './Sparkline';
import Badge from './Badge';
import { useApp } from '../context/AppContext';
import { compact, euro, pct } from '../utils/format';

function getVisibleAssets(config) {
  return [...config.market.assets]
    .filter((asset) => asset.enabledInMarket)
    .sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
}

export default function MarketTable({ limit }) {
  const { config } = useApp();
  const rows = typeof limit === 'number' ? getVisibleAssets(config).slice(0, limit) : getVisibleAssets(config);

  return (
    <Card>
      <div className="section-row">
        <div>
          <p className="eyebrow">Market</p>
          <h3>Prix et tendances</h3>
          <p className="muted">
            {config.market.livePricingEnabled ? 'Mode live prévu pour future API.' : 'Mode mock local actif.'}
          </p>
        </div>
        <Badge tone={config.market.livePricingEnabled ? 'success' : 'warning'}>
          {config.market.livePricingEnabled ? 'Live prêt à brancher' : 'Mock local'}
        </Badge>
      </div>

      <div className="table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Prix</th>
              <th>24h</th>
              <th>Volume</th>
              <th>Market cap</th>
              <th>Tendance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coin) => (
              <tr key={coin.symbol}>
                <td>
                  <div className="coin-cell">
                    {coin.iconUrl ? <img src={coin.iconUrl} alt={coin.symbol} className="coin-pill coin-pill--image" /> : <span className="coin-pill">{coin.symbol}</span>}
                    <div>
                      <strong>{coin.name}</strong>
                      <span>{coin.symbol}</span>
                    </div>
                  </div>
                </td>
                <td>{euro(coin.price)}</td>
                <td className={coin.change24h >= 0 ? 'text-success' : 'text-danger'}>{pct(coin.change24h)}</td>
                <td>{compact(coin.volume)}</td>
                <td>{compact(coin.marketCap)}</td>
                <td>
                  <Sparkline points={coin.series} positive={coin.change24h >= 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
