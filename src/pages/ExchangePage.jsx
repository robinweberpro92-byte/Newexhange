import Card from '../components/Card';
import ExchangeForm from '../components/ExchangeForm';
import { useApp } from '../context/AppContext';

export default function ExchangePage() {
  const { config } = useApp();

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">Exchange</span>
        <h1>Créer une conversion démo</h1>
        <p>{config.content.exchange.intro}</p>
      </div>

      <div className="two-col">
        <ExchangeForm />
        <Card>
          <p className="eyebrow">Informations</p>
          <h3>Rappel des règles</h3>
          <ul className="bullet-list">
            <li>{config.content.exchange.warning}</li>
            <li>Frais globaux : {config.exchange.globalFeePercent}%</li>
            <li>Délai de confirmation : {config.payments.confirmationDelay}</li>
            <li>Message après paiement : {config.payments.postPaymentMessage}</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
