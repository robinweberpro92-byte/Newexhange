import { ArrayPreview, Field, SaveBar, SectionCard, StatCard } from '../AdminPrimitives';
import { euro } from '../../../utils/format';
import { defaultConfig } from '../../../config/defaultConfig';
import { toArrayFromCsv } from '../../../utils/storage';

export default function AnalyticsTab({ value, transactions, exchangeConfig, dirty, onChange, onSave, onReset }) {
  const estimatedRevenue = Number(value.volumeTotal || 0) * (Number(exchangeConfig.globalFeePercent || 0) / 100);

  function updateDistribution(index, nextValue) {
    const assetDistribution = value.assetDistribution.map((item, currentIndex) =>
      currentIndex === index ? { ...item, volume: Number(nextValue || 0) } : item,
    );
    onChange({ ...value, assetDistribution });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <StatCard label="Volume total" value={euro(value.volumeTotal)} helper="Mock modifiable" />
        <StatCard label="Transactions" value={String(value.totalTransactions)} helper={`${transactions.length} lignes stockées`} tone="info" />
        <StatCard label="Utilisateurs actifs" value={String(value.activeUsers)} helper="KPI mock" tone="success" />
        <StatCard label="Revenus estimés" value={euro(estimatedRevenue)} helper={`Frais ${exchangeConfig.globalFeePercent}%`} tone="warning" />
      </div>

      <SectionCard eyebrow="KPI" title="Synthèse des performances" description="Ces chiffres sont utilisés pour habiller le dashboard et la home.">
        <div className="field-grid field-grid--4">
          <Field label="Volume total (€)">
            <input type="number" min="0" step="1" value={value.volumeTotal} onChange={(event) => onChange({ ...value, volumeTotal: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Nombre total de transactions">
            <input type="number" min="0" step="1" value={value.totalTransactions} onChange={(event) => onChange({ ...value, totalTransactions: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Utilisateurs actifs">
            <input type="number" min="0" step="1" value={value.activeUsers} onChange={(event) => onChange({ ...value, activeUsers: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Transaction moyenne (€)">
            <input type="number" min="0" step="0.01" value={value.averageTransaction} onChange={(event) => onChange({ ...value, averageTransaction: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Heure de pointe simulée">
            <input value={value.peakHour} onChange={(event) => onChange({ ...value, peakHour: event.target.value })} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Courbes" title="Volumes sur 7 et 30 jours" description="Renseigne des suites numériques séparées par des virgules pour alimenter les graphiques mock.">
        <div className="field-grid field-grid--2">
          <Field className="field--full" label="Volume 7 jours">
            <textarea rows="3" value={value.dailyVolume7.join(', ')} onChange={(event) => onChange({ ...value, dailyVolume7: toArrayFromCsv(event.target.value) })} />
          </Field>
          <Field className="field--full" label="Volume 30 jours">
            <textarea rows="4" value={value.dailyVolume30.join(', ')} onChange={(event) => onChange({ ...value, dailyVolume30: toArrayFromCsv(event.target.value) })} />
          </Field>
        </div>
        <div className="chart-preview-grid">
          <div className="chart-preview">
            <span>7 jours</span>
            <ArrayPreview items={value.dailyVolume7} />
          </div>
          <div className="chart-preview">
            <span>30 jours</span>
            <ArrayPreview items={value.dailyVolume30} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Répartition"
        title="Cryptos les plus échangées"
        description="Utilisé pour le graphique donut/barres simulé du dashboard."
        actions={
          <button className="button button--ghost button--sm" type="button" onClick={() => onChange({ ...defaultConfig.analytics })}>
            Reset stats mock
          </button>
        }
      >
        <div className="field-grid field-grid--4">
          {value.assetDistribution.map((item, index) => (
            <Field key={`${item.symbol}-${index}`} label={item.symbol}>
              <input type="number" min="0" step="1" value={item.volume} onChange={(event) => updateDistribution(index, event.target.value)} />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SaveBar dirty={dirty} onSave={() => onSave()} onReset={onReset} />
    </div>
  );
}
