import { useMemo, useState } from 'react';
import { ArrayPreview, EmptyState, Field, SaveBar, SectionCard, ToggleRow } from '../AdminPrimitives';
import { makeId, toArrayFromCsv } from '../../../utils/storage';

function sortAssets(assets) {
  return [...assets].sort((left, right) => Number(left.position || 0) - Number(right.position || 0));
}

export default function MarketTab({ value, dirty, onChange, onSave, onReset }) {
  const [newAsset, setNewAsset] = useState({
    name: '',
    symbol: '',
    iconUrl: '',
    price: 0,
    change24h: 0,
    position: value.assets.length + 1,
  });

  const assets = useMemo(() => sortAssets(value.assets), [value.assets]);

  function updateAsset(symbol, patch) {
    onChange({
      ...value,
      assets: value.assets.map((asset) => (asset.symbol === symbol ? { ...asset, ...patch } : asset)),
    });
  }

  function deleteAsset(symbol) {
    onChange({
      ...value,
      assets: value.assets.filter((asset) => asset.symbol !== symbol),
    });
  }

  function addAsset() {
    if (!newAsset.name.trim() || !newAsset.symbol.trim()) return;
    onChange({
      ...value,
      assets: [
        ...value.assets,
        {
          id: makeId('ASSET'),
          symbol: newAsset.symbol.toUpperCase(),
          name: newAsset.name.trim(),
          iconUrl: newAsset.iconUrl,
          price: Number(newAsset.price || 0),
          change24h: Number(newAsset.change24h || 0),
          volume: 1000000,
          marketCap: 50000000,
          series: [22, 24, 21, 26, 28, 29, 30],
          enabledInMarket: true,
          enabledInExchange: true,
          position: Number(newAsset.position || value.assets.length + 1),
        },
      ],
    });
    setNewAsset({ name: '', symbol: '', iconUrl: '', price: 0, change24h: 0, position: value.assets.length + 2 });
  }

  return (
    <div className="admin-stack">
      <SectionCard eyebrow="Marché" title="Prix live et cryptos visibles" description="Prépare le terrain pour un futur branchement API tout en gardant des mocks éditables.">
        <ToggleRow
          label="Mode prix live"
          description="Prévu pour un branchement API futur. Désactivé par défaut pour garder un front statique stable."
          checked={value.livePricingEnabled}
          onChange={(checked) => onChange({ ...value, livePricingEnabled: checked })}
        />
      </SectionCard>

      <SectionCard eyebrow="Ajout" title="Ajouter une crypto" description="Nom, symbole, icône et prix de départ modifiables immédiatement.">
        <div className="field-grid field-grid--3">
          <Field label="Nom">
            <input value={newAsset.name} onChange={(event) => setNewAsset((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Symbole">
            <input value={newAsset.symbol} onChange={(event) => setNewAsset((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Icône URL">
            <input value={newAsset.iconUrl} onChange={(event) => setNewAsset((current) => ({ ...current, iconUrl: event.target.value }))} placeholder="https://..." />
          </Field>
          <Field label="Prix mock">
            <input type="number" min="0" step="0.01" value={newAsset.price} onChange={(event) => setNewAsset((current) => ({ ...current, price: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Variation 24h (%)">
            <input type="number" step="0.01" value={newAsset.change24h} onChange={(event) => setNewAsset((current) => ({ ...current, change24h: Number(event.target.value || 0) }))} />
          </Field>
          <Field label="Position">
            <input type="number" min="1" step="1" value={newAsset.position} onChange={(event) => setNewAsset((current) => ({ ...current, position: Number(event.target.value || 1) }))} />
          </Field>
          <div className="field field--action">
            <span className="field__label">Action</span>
            <button className="button button--primary" type="button" onClick={addAsset}>
              Ajouter la crypto
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Assets" title="Liste des cryptos affichées" description="Active ou masque chaque crypto dans le Market et l’Exchange. Les positions déterminent l’ordre d’affichage.">
        {!assets.length ? (
          <EmptyState title="Aucune crypto" description="Ajoute au moins une crypto pour alimenter le Market et l’Exchange." />
        ) : (
          <div className="admin-stack">
            {assets.map((asset) => (
              <div key={asset.symbol} className="admin-inline-card">
                <div className="admin-inline-card__head">
                  <div className="asset-row">
                    {asset.iconUrl ? <img src={asset.iconUrl} alt={asset.symbol} className="asset-row__icon" /> : <div className="asset-row__fallback">{asset.symbol.slice(0, 2)}</div>}
                    <div>
                      <strong>{asset.name}</strong>
                      <p className="muted">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="inline-actions">
                    <ToggleRow label="Market" checked={asset.enabledInMarket} onChange={(checked) => updateAsset(asset.symbol, { enabledInMarket: checked })} />
                    <ToggleRow label="Exchange" checked={asset.enabledInExchange} onChange={(checked) => updateAsset(asset.symbol, { enabledInExchange: checked })} />
                    <button className="button button--ghost button--sm" type="button" onClick={() => deleteAsset(asset.symbol)}>
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="field-grid field-grid--4">
                  <Field label="Nom">
                    <input value={asset.name} onChange={(event) => updateAsset(asset.symbol, { name: event.target.value })} />
                  </Field>
                  <Field label="Symbole" hint="Pour éviter de casser les liens avec Paiements et Règles, change le symbole en supprimant puis recréant la crypto.">
                    <input value={asset.symbol} readOnly />
                  </Field>
                  <Field label="Icône URL">
                    <input value={asset.iconUrl} onChange={(event) => updateAsset(asset.symbol, { iconUrl: event.target.value })} />
                  </Field>
                  <Field label="Position">
                    <input type="number" min="1" value={asset.position} onChange={(event) => updateAsset(asset.symbol, { position: Number(event.target.value || 1) })} />
                  </Field>
                  <Field label="Prix mock">
                    <input type="number" min="0" step="0.01" value={asset.price} onChange={(event) => updateAsset(asset.symbol, { price: Number(event.target.value || 0) })} />
                  </Field>
                  <Field label="Variation 24h (%)">
                    <input type="number" step="0.01" value={asset.change24h} onChange={(event) => updateAsset(asset.symbol, { change24h: Number(event.target.value || 0) })} />
                  </Field>
                  <Field label="Volume mock">
                    <input type="number" min="0" step="1" value={asset.volume} onChange={(event) => updateAsset(asset.symbol, { volume: Number(event.target.value || 0) })} />
                  </Field>
                  <Field label="Market cap mock">
                    <input type="number" min="0" step="1" value={asset.marketCap} onChange={(event) => updateAsset(asset.symbol, { marketCap: Number(event.target.value || 0) })} />
                  </Field>
                  <Field className="field--full" label="Série graphique (nombres séparés par des virgules)">
                    <input value={asset.series.join(', ')} onChange={(event) => updateAsset(asset.symbol, { series: toArrayFromCsv(event.target.value) })} />
                  </Field>
                </div>
                <ArrayPreview items={asset.series} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SaveBar dirty={dirty} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
