export const ADMIN_TABS = [
  { key: 'branding', label: 'Branding & identité', description: 'Nom, logo, couleurs, footer', sensitive: false },
  { key: 'payments', label: 'Paiements & comptes', description: 'PayPal, wallets et délais', sensitive: true },
  { key: 'exchange', label: 'Frais & règles', description: 'Frais, limites, paires', sensitive: true },
  { key: 'users', label: 'Utilisateurs', description: 'Gestion mock locale', sensitive: false },
  { key: 'transactions', label: 'Transactions', description: 'Suivi et export CSV', sensitive: false },
  { key: 'content', label: 'Contenu & textes', description: 'Textes éditables du site', sensitive: false },
  { key: 'market', label: 'Marché & cryptos', description: 'Assets affichés et prix mock', sensitive: false },
  { key: 'security', label: 'Sécurité & accès', description: 'Login, PIN, maintenance', sensitive: true },
  { key: 'notifications', label: 'Notifications', description: 'Toasts et messages globaux', sensitive: true },
  { key: 'analytics', label: 'Analytics & stats', description: 'KPI mock et graphiques', sensitive: true },
];
