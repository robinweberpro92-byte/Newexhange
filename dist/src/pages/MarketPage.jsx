import Card from '../components/Card';
import MarketTable from '../components/MarketTable';
import { useApp } from '../context/AppContext';

export default function MarketPage() {
  const { config } = useApp();

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">Market</span>
        <h1>Vue marché inspirée exchange</h1>
        <p>
          {config.market.livePricingEnabled
            ? 'Le toggle live est actif côté interface, mais tu peux encore brancher ton API plus tard.'
            : 'Les données sont mockées pour garder un build simple et stable sur Vercel.'}
        </p>
      </div>

      <Card className="page-banner">
        <p>{config.exchange.warningMessage}</p>
      </Card>

      <MarketTable />
    </section>
  );
}
