import { Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';
import { isEmail } from '../../../utils/storage';

const METHOD_LABELS = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'USDT',
  LTC: 'Litecoin',
  BNB: 'BNB',
  XRP: 'XRP',
};

export default function PaymentsTab({ value, marketAssets = [], dirty, onChange, onSave, onReset }) {
  const hasError = !isEmail(value.paypalEmail);
  const methodSymbols = Array.from(new Set([
    ...Object.keys(value.methods || {}),
    ...marketAssets.map((asset) => asset.symbol),
  ]));

  function updateMethod(symbol, patch) {
    onChange({
      ...value,
      methods: {
        ...value.methods,
        [symbol]: {
          ...value.methods[symbol],
          ...patch,
        },
      },
    });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Paiements" title="Compte PayPal principal" description="Ces informations sont reprises dans l’Exchange et le Dashboard.">
        <div className="field-grid field-grid--2">
          <Field label="Email PayPal" error={hasError ? 'Adresse email invalide.' : ''}>
            <input value={value.paypalEmail} onChange={(event) => onChange({ ...value, paypalEmail: event.target.value })} />
          </Field>
          <Field label="Nom du compte affiché">
            <input value={value.paypalDisplayName} onChange={(event) => onChange({ ...value, paypalDisplayName: event.target.value })} />
          </Field>
          <Field className="field--full" label="Message après paiement">
            <textarea value={value.postPaymentMessage} onChange={(event) => onChange({ ...value, postPaymentMessage: event.target.value })} rows="3" />
          </Field>
          <Field label="Délai de confirmation affiché">
            <input value={value.confirmationDelay} onChange={(event) => onChange({ ...value, confirmationDelay: event.target.value })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Wallets" title="Moyens de paiement visibles dans l’exchange" description="Active ou masque chaque réseau/crypto et configure son adresse de réception.">
        <div className="admin-stack">
          {methodSymbols.map((symbol) => {
            const method = value.methods[symbol] || { enabled: false, address: '', networkLabel: symbol, network: 'TRC20' };
            return (
            <div className="admin-inline-card" key={symbol}>
              <div className="admin-inline-card__head">
                <div>
                  <strong>{METHOD_LABELS[symbol] || symbol}</strong>
                  <p className="muted">Active ou désactive cette méthode dans l’interface Exchange.</p>
                </div>
                <ToggleRow label={symbol} checked={method.enabled} onChange={(checked) => updateMethod(symbol, { enabled: checked })} />
              </div>
              <div className="field-grid field-grid--3">
                <Field label="Adresse">
                  <input value={method.address} onChange={(event) => updateMethod(symbol, { address: event.target.value })} />
                </Field>
                <Field label="Label réseau">
                  <input value={method.networkLabel} onChange={(event) => updateMethod(symbol, { networkLabel: event.target.value })} />
                </Field>
                {symbol === 'USDT' ? (
                  <Field label="Réseau USDT">
                    <select value={method.network || 'TRC20'} onChange={(event) => updateMethod(symbol, { network: event.target.value })}>
                      <option value="TRC20">TRC20</option>
                      <option value="ERC20">ERC20</option>
                    </select>
                  </Field>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} disabled={hasError} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
