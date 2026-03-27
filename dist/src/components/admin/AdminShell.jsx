import Badge from '../Badge';
import { ADMIN_TABS } from './adminTabs';

export function AdminShell({ activeTab, setActiveTab, dirtyMap, unsavedCount, headerActions, children }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <p className="eyebrow">Admin panel</p>
          <h2>Pilotage complet</h2>
          <p className="muted">10 onglets organisés pour piloter le front fintech sans backend obligatoire.</p>
        </div>
        <div className="admin-sidebar__list">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-tab-button ${activeTab === tab.key ? 'admin-tab-button--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <div>
                <strong>{tab.label}</strong>
                <span>{tab.description}</span>
              </div>
              <div className="admin-tab-button__meta">
                {tab.sensitive ? <Badge tone="danger">PIN</Badge> : null}
                {dirtyMap[tab.key] ? <Badge tone="warning">modifié</Badge> : null}
              </div>
            </button>
          ))}
        </div>
        <div className="admin-sidebar__bottom">
          <Badge tone={unsavedCount ? 'warning' : 'success'}>
            {unsavedCount ? `${unsavedCount} onglet(s) en attente` : 'Aucune modification en attente'}
          </Badge>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-main__header">
          <div>
            <p className="eyebrow">Configuration</p>
            <h1>{ADMIN_TABS.find((tab) => tab.key === activeTab)?.label || 'Admin'}</h1>
          </div>
          <div className="admin-main__actions">{headerActions}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SensitiveGate({ label, onSubmit, error }) {
  return (
    <div className="sensitive-gate">
      <p className="eyebrow">PIN requis</p>
      <h2>Onglet sensible</h2>
      <p className="muted">Cet onglet protège des paramètres critiques. Entre le code PIN secondaire pour continuer.</p>
      <form className="field-grid" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">Code PIN</span>
          <input name="pin" type="password" inputMode="numeric" autoComplete="one-time-code" />
        </label>
        {error ? <p className="field__error field__error--inline">{error}</p> : null}
        <button className="button button--primary" type="submit">
          Déverrouiller l’onglet {label}
        </button>
      </form>
    </div>
  );
}
