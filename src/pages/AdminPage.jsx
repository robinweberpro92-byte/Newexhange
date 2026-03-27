import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandingTab from '../components/admin/tabs/BrandingTab';
import PaymentsTab from '../components/admin/tabs/PaymentsTab';
import ExchangeRulesTab from '../components/admin/tabs/ExchangeRulesTab';
import UsersTab from '../components/admin/tabs/UsersTab';
import TransactionsTab from '../components/admin/tabs/TransactionsTab';
import ContentTab from '../components/admin/tabs/ContentTab';
import MarketTab from '../components/admin/tabs/MarketTab';
import SecurityTab from '../components/admin/tabs/SecurityTab';
import NotificationsTab from '../components/admin/tabs/NotificationsTab';
import AnalyticsTab from '../components/admin/tabs/AnalyticsTab';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { defaultConfig } from '../config/defaultConfig';
import { ADMIN_TABS } from '../components/admin/adminTabs';
import { AdminShell, SensitiveGate } from '../components/admin/AdminShell';
import { cloneValue, loadJson, saveJson } from '../utils/storage';

const DRAFT_KEY = 'novabridge-admin-draft-v2';

const TAB_COMPONENTS = {
  branding: BrandingTab,
  payments: PaymentsTab,
  exchange: ExchangeRulesTab,
  users: UsersTab,
  transactions: TransactionsTab,
  content: ContentTab,
  market: MarketTab,
  security: SecurityTab,
  notifications: NotificationsTab,
  analytics: AnalyticsTab,
};

export default function AdminPage() {
  const { auth, config, ready, replaceSection, resetConfig, showToast, verifyPin } = useApp();
  const [activeTab, setActiveTab] = useState('branding');
  const [draft, setDraft] = useState(config);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (!ready) return;
    const storedDraft = loadJson(DRAFT_KEY, config);
    setDraft(storedDraft);
  }, [config, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJson(DRAFT_KEY, draft);
  }, [draft, ready]);

  if (!ready) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Chargement…</h1>
          <p className="muted">Récupération de la configuration locale et de la session admin.</p>
        </Card>
      </section>
    );
  }

  if (!auth.loggedIn) {
    return (
      <section className="container section centered-page">
        <Card className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Session requise</h1>
          <p className="muted">Connecte-toi avec le compte admin local pour ouvrir le panel de pilotage complet.</p>
          <Link to="/login" className="button button--primary">
            Aller au login
          </Link>
        </Card>
      </section>
    );
  }

  const dirtyMap = Object.fromEntries(
    ADMIN_TABS.map((tab) => [tab.key, JSON.stringify(draft[tab.key]) !== JSON.stringify(config[tab.key])]),
  );
  const unsavedCount = Object.values(dirtyMap).filter(Boolean).length;
  const activeDefinition = ADMIN_TABS.find((tab) => tab.key === activeTab);
  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const isSensitive = activeDefinition?.sensitive && config.security.admin.pinEnabled && !auth.pinVerified;

  async function saveSection(sectionKey, nextSection) {
    const sectionValue = nextSection ?? draft[sectionKey];
    if (nextSection) {
      setDraft((current) => ({ ...current, [sectionKey]: cloneValue(nextSection) }));
    }
    replaceSection(sectionKey, sectionValue);
    showToast(`${activeDefinition?.label || sectionKey} sauvegardé.`, 'success');
  }

  function resetSection(sectionKey) {
    setDraft((current) => ({ ...current, [sectionKey]: cloneValue(defaultConfig[sectionKey]) }));
    showToast(`Section ${activeDefinition?.label || sectionKey} réinitialisée localement.`, 'warning');
  }

  function resetAllSettings() {
    resetConfig();
    setDraft(cloneValue(defaultConfig));
    saveJson(DRAFT_KEY, defaultConfig);
    showToast('Tous les paramètres ont été remis aux valeurs par défaut.', 'warning', 3600);
  }

  async function handlePinSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pin = String(formData.get('pin') || '');
    const result = await verifyPin(pin);
    if (!result.ok) {
      setPinError(result.message);
      return;
    }
    setPinError('');
    showToast('Onglet sensible déverrouillé.', 'success');
  }

  return (
    <section className="container section page-intro admin-page">
      <AdminShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dirtyMap={dirtyMap}
        unsavedCount={unsavedCount}
        headerActions={
          <>
            <button className="button button--ghost" type="button" onClick={() => setDraft(cloneValue(config))}>
              Recharger depuis localStorage
            </button>
            <button className="button button--danger" type="button" onClick={resetAllSettings}>
              Réinitialiser les paramètres
            </button>
          </>
        }
      >
        {isSensitive ? (
          <SensitiveGate label={activeDefinition?.label} onSubmit={handlePinSubmit} error={pinError} />
        ) : (
          <ActiveComponent
            value={draft[activeTab]}
            marketAssets={draft.market.assets}
            transactions={draft.transactions}
            users={draft.users}
            exchangeConfig={draft.exchange}
            dirty={dirtyMap[activeTab]}
            onChange={(nextSection) => setDraft((current) => ({ ...current, [activeTab]: cloneValue(nextSection) }))}
            onSave={(nextSection) => saveSection(activeTab, nextSection)}
            onReset={() => resetSection(activeTab)}
          />
        )}
      </AdminShell>
    </section>
  );
}
