import { Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';

export default function ExchangeRulesTab({ value, marketAssets, dirty, onChange, onSave, onReset }) {
  const hasError = Number(value.minAmount) < 0 || Number(value.maxAmount) <= Number(value.minAmount);

  function updateAssetFee(symbol, nextValue) {
    onChange({
      ...value,
      assetFees: {
        ...value.assetFees,
        [symbol]: Number(nextValue || 0),
      },
    });
  }

  function updateFixedRate(symbol, nextValue) {
    onChange({
      ...value,
      fixedRates: {
        ...value.fixedRates,
        [symbol]: Number(nextValue || 0),
      },
    });
  }

  function updatePair(symbol, enabled) {
    onChange({
      ...value,
      enabledPairs: {
        ...value.enabledPairs,
        [symbol]: enabled,
      },
    });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Règles" title="Règles globales de l’exchange" description="Contrôle le niveau de frais, les limites de transaction et le mode taux fixe.">
        <div className="field-grid field-grid--2">
          <Field label="Frais globaux (%)">
            <input type="number" min="0" step="0.1" value={value.globalFeePercent} onChange={(event) => onChange({ ...value, globalFeePercent: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Montant minimum (€)">
            <input type="number" min="0" step="1" value={value.minAmount} onChange={(event) => onChange({ ...value, minAmount: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Montant maximum (€)" error={hasError ? 'Le maximum doit être supérieur au minimum.' : ''}>
            <input type="number" min="0" step="1" value={value.maxAmount} onChange={(event) => onChange({ ...value, maxAmount: Number(event.target.value || 0) })} />
          </Field>
          <ToggleRow
            label="Activer le mode taux fixe"
            description="Quand il est actif, l’Exchange affiche les taux fixes ci-dessous au lieu des prix mock du marché."
            checked={value.manualRateMode}
            onChange={(checked) => onChange({ ...value, manualRateMode: checked })}
          />
          <Field className="field--full" label="Message d’avertissement du formulaire Exchange">
            <textarea value={value.warningMessage} onChange={(event) => onChange({ ...value, warningMessage: event.target.value })} rows="3" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Overrides" title="Overrides crypto par crypto" description="Ajuste les frais, les paires actives et les taux fixes pour chaque crypto affichée.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crypto</th>
                <th>Paire active</th>
                <th>Frais (%)</th>
                <th>Taux fixe (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {marketAssets.map((asset) => (
                <tr key={asset.symbol}>
                  <td>
                    <strong>{asset.symbol}</strong>
                    <span>{asset.name}</span>
                  </td>
                  <td>
                    <ToggleRow label={asset.symbol} checked={Boolean(value.enabledPairs[asset.symbol])} onChange={(checked) => updatePair(asset.symbol, checked)} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={value.assetFees[asset.symbol] ?? value.globalFeePercent}
                      onChange={(event) => updateAssetFee(asset.symbol, event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={!value.manualRateMode}
                      value={value.fixedRates[asset.symbol] ?? asset.price}
                      onChange={(event) => updateFixedRate(asset.symbol, event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} disabled={hasError} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
