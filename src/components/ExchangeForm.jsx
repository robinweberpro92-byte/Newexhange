import { useEffect, useMemo, useState } from 'react';
import Card from './Card';
import Badge from './Badge';
import { euro } from '../utils/format';
import { useApp } from '../context/AppContext';
import { isEmail } from '../utils/storage';

function getExchangeAssets(config) {
  return [...config.market.assets]
    .filter((asset) => asset.enabledInExchange && config.exchange.enabledPairs[asset.symbol] && config.payments.methods[asset.symbol]?.enabled)
    .sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
}

export default function ExchangeForm({ compact = false }) {
  const { config, createMockTransaction, auth } = useApp();
  const assets = useMemo(() => getExchangeAssets(config), [config]);
  const [asset, setAsset] = useState(assets[0]?.symbol || 'BTC');
  const [quantity, setQuantity] = useState(0.01);
  const [walletAddress, setWalletAddress] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(auth.email || config.payments.paypalEmail);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (assets.length && !assets.find((item) => item.symbol === asset)) {
      setAsset(assets[0].symbol);
    }
  }, [asset, assets]);

  const selected = assets.find((coin) => coin.symbol === asset) || assets[0];
  const selectedRate = config.exchange.manualRateMode ? config.exchange.fixedRates[selected?.symbol] : selected?.price;
  const feePercent = config.exchange.assetFees[selected?.symbol] ?? config.exchange.globalFeePercent;
  const gross = Number(quantity || 0) * Number(selectedRate || 0);
  const fee = gross * (Number(feePercent || 0) / 100);
  const received = Math.max(0, gross - fee);
  const minReached = received >= config.exchange.minAmount;
  const maxAllowed = received <= config.exchange.maxAmount;
  const formValid = Boolean(selected) && isEmail(paypalEmail) && walletAddress.trim() && quantity > 0 && minReached && maxAllowed;

  function handleSubmit(event) {
    event.preventDefault();
    if (!formValid) {
      setMessage('Complète les champs requis et vérifie les limites de transaction.');
      return;
    }

    createMockTransaction({
      assetSymbol: selected.symbol,
      amountFiat: received,
      quantity,
      payoutEmail: paypalEmail,
    });
    setMessage(`${config.payments.postPaymentMessage} • ${config.content.exchange.confirmationMessage}`);
  }

  if (!assets.length) {
    return (
      <Card className="exchange-card">
        <p className="eyebrow">Exchange indisponible</p>
        <h3>Aucune paire active</h3>
        <p className="muted">Active au moins une crypto dans les onglets Paiements, Marché et Règles d’échange.</p>
      </Card>
    );
  }

  return (
    <Card className="exchange-card">
      <div className="exchange-card__head">
        <div>
          <p className="eyebrow">Exchange instantané</p>
          <h3>{compact ? 'Carte d’échange' : 'Convertis crypto → PayPal'}</h3>
        </div>
        <Badge tone={minReached && maxAllowed ? 'success' : 'warning'}>Frais {feePercent}%</Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="exchange-grid">
          <label>
            <span>Crypto sélectionnée</span>
            <select value={asset} onChange={(event) => setAsset(event.target.value)}>
              {assets.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.symbol} — {coin.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Quantité crypto</span>
            <input type="number" min="0" step="0.0001" value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 0))} />
          </label>

          <label>
            <span>Adresse wallet {asset}</span>
            <input value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} placeholder={`Adresse de dépôt ${asset}`} />
          </label>

          <label>
            <span>Email PayPal</span>
            <input value={paypalEmail} onChange={(event) => setPaypalEmail(event.target.value)} placeholder="paypal@exemple.com" />
          </label>
        </div>

        <div className="exchange-warning">
          <p>{config.exchange.warningMessage}</p>
        </div>

        <div className="quote-box">
          <div>
            <span>Référence {config.exchange.manualRateMode ? 'fixe' : 'marché'}</span>
            <strong>
              {selected.symbol} • {euro(selectedRate)}
            </strong>
          </div>
          <div>
            <span>Frais</span>
            <strong>{euro(fee)}</strong>
          </div>
          <div>
            <span>Tu reçois</span>
            <strong>{euro(received)}</strong>
          </div>
        </div>

        <div className="exchange-meta">
          <span>Min. {euro(config.exchange.minAmount)}</span>
          <span>Max. {euro(config.exchange.maxAmount)}</span>
          <span>Délai {config.payments.confirmationDelay}</span>
        </div>

        {message ? <p className="exchange-message">{message}</p> : null}

        <button className="button button--primary button--full" type="submit">
          Créer une transaction démo
        </button>
      </form>
    </Card>
  );
}
