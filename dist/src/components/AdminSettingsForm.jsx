import { useState } from 'react';
import Card from './Card';
import { useApp } from '../context/AppContext';

export default function AdminSettingsForm() {
  const { config, updateConfig, resetConfig } = useApp();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  function setField(section, key, value) {
    setSaved(false);
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function save() {
    updateConfig(form);
    setSaved(true);
  }

  return (
    <div className="admin-grid">
      <Card>
        <div className="section-row">
          <div>
            <p className="eyebrow">Branding</p>
            <h3>Identité du site</h3>
          </div>
        </div>
        <div className="form-grid">
          <label>
            <span>Nom de marque</span>
            <input value={form.brand.name} onChange={(e) => setField('brand', 'name', e.target.value)} />
          </label>
          <label>
            <span>Tagline</span>
            <input value={form.brand.tagline} onChange={(e) => setField('brand', 'tagline', e.target.value)} />
          </label>
          <label>
            <span>Email support</span>
            <input value={form.brand.supportEmail} onChange={(e) => setField('brand', 'supportEmail', e.target.value)} />
          </label>
          <label>
            <span>Couleur accent</span>
            <input type="color" value={form.brand.accent} onChange={(e) => setField('brand', 'accent', e.target.value)} />
          </label>
        </div>
      </Card>

      <Card>
        <div className="section-row">
          <div>
            <p className="eyebrow">Paiement</p>
            <h3>Compte PayPal et frais</h3>
          </div>
        </div>
        <div className="form-grid">
          <label>
            <span>Email PayPal</span>
            <input value={form.payments.paypalEmail} onChange={(e) => setField('payments', 'paypalEmail', e.target.value)} />
          </label>
          <label>
            <span>Nom affiché</span>
            <input value={form.payments.paypalDisplayName} onChange={(e) => setField('payments', 'paypalDisplayName', e.target.value)} />
          </label>
          <label>
            <span>Frais (%)</span>
            <input type="number" step="0.1" value={form.payments.feePercent} onChange={(e) => setField('payments', 'feePercent', Number(e.target.value))} />
          </label>
          <label>
            <span>Minimum (€)</span>
            <input type="number" value={form.payments.minAmount} onChange={(e) => setField('payments', 'minAmount', Number(e.target.value))} />
          </label>
        </div>
      </Card>

      <Card>
        <div className="section-row">
          <div>
            <p className="eyebrow">Wallets</p>
            <h3>Adresses de réception</h3>
          </div>
        </div>
        <div className="form-grid">
          {Object.entries(form.wallets).map(([symbol, address]) => (
            <label key={symbol}>
              <span>{symbol}</span>
              <input value={address} onChange={(e) => setField('wallets', symbol, e.target.value)} />
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <div className="section-row">
          <div>
            <p className="eyebrow">Actions</p>
            <h3>Admin local</h3>
          </div>
        </div>
        <div className="admin-actions">
          <button className="button button--primary" onClick={save}>
            Sauvegarder
          </button>
          <button className="button button--ghost" onClick={resetConfig}>
            Reset config
          </button>
        </div>
        <p className="muted">
          {saved
            ? 'Configuration sauvegardée dans localStorage.'
            : 'Les changements sont persistés localement pour que tu puisses tester vite.'}
        </p>
      </Card>
    </div>
  );
}
