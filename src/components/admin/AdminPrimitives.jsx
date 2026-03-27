import Badge from '../Badge';

export function SectionCard({ eyebrow, title, description, children, actions, className = '' }) {
  return (
    <section className={`admin-card ${className}`.trim()}>
      <div className="admin-card__head">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h3>{title}</h3>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        {actions ? <div className="admin-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      {children}
      {hint ? <small className="field__hint">{hint}</small> : null}
      {error ? <small className="field__error">{error}</small> : null}
    </label>
  );
}

export function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className={`toggle-row ${disabled ? 'toggle-row--disabled' : ''}`}>
      <div>
        <strong>{label}</strong>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <button
        className={`toggle ${checked ? 'toggle--active' : ''}`}
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span />
      </button>
    </div>
  );
}

export function SaveBar({ dirty, onSave, onReset, disabled = false, saveLabel = 'Sauvegarder', resetLabel = 'Réinitialiser' }) {
  return (
    <div className="save-bar">
      <div className="save-bar__status">
        <Badge tone={dirty ? 'warning' : 'success'}>{dirty ? 'Modifications non sauvegardées' : 'Synchronisé'}</Badge>
      </div>
      <div className="save-bar__actions">
        <button className="button button--ghost" type="button" onClick={onReset}>
          {resetLabel}
        </button>
        <button className="button button--primary" type="button" disabled={disabled} onClick={onSave}>
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, helper, tone = 'info' }) {
  return (
    <div className="metric-card">
      <Badge tone={tone}>{label}</Badge>
      <strong>{value}</strong>
      {helper ? <span>{helper}</span> : null}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export function ArrayPreview({ items }) {
  if (!items?.length) return <div className="mini-bars mini-bars--empty" />;
  const max = Math.max(...items, 1);
  return (
    <div className="mini-bars">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} style={{ height: `${Math.max(10, (item / max) * 100)}%` }} />
      ))}
    </div>
  );
}
