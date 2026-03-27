import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultConfig } from '../config/defaultConfig';
import { euro } from '../utils/format';
import { sha256 } from '../utils/hash';
import { cloneValue, isEmail, loadJson, makeId, saveJson } from '../utils/storage';

const CONFIG_KEY = 'novabridge-config-v2';
const AUTH_KEY = 'novabridge-auth-v2';

const initialAuth = {
  loggedIn: false,
  role: 'guest',
  email: '',
  pinVerified: false,
};

const AppContext = createContext(null);

function updateFavicon(href) {
  if (typeof document === 'undefined' || !href) return;
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState(defaultConfig);
  const [auth, setAuth] = useState(initialAuth);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setConfig(loadJson(CONFIG_KEY, defaultConfig));
    setAuth(loadJson(AUTH_KEY, initialAuth));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveJson(CONFIG_KEY, config);
  }, [config, ready]);

  useEffect(() => {
    if (!ready) return;
    saveJson(AUTH_KEY, auth);
  }, [auth, ready]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = config.branding.themeMode || 'dark';
    document.documentElement.style.setProperty('--accent', config.branding.primaryColor);
    document.documentElement.style.setProperty('--accent-2', config.branding.secondaryColor);
    document.title = config.branding.siteName;
    updateFavicon(config.branding.faviconUrl || config.branding.logoDataUrl || config.branding.logoUrl || '/logo-mark.svg');
  }, [config.branding, ready]);

  function showToast(message, tone = 'success', durationMs = 2600) {
    const id = makeId('TOAST');
    setToasts((current) => [...current, { id, message, tone }]);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, durationMs);
    }
    return id;
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function replaceSection(sectionKey, value) {
    setConfig((current) => ({
      ...current,
      [sectionKey]: cloneValue(value),
    }));
  }

  function resetConfig() {
    setConfig(cloneValue(defaultConfig));
  }

  async function login(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const expectedEmail = String(config.security.admin.username || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return { ok: false, message: config.content.login.errorMessage };
    }

    const passwordHash = await sha256(password);
    const isAdmin = normalizedEmail === expectedEmail && passwordHash === config.security.admin.passwordHash;

    if (!isAdmin) {
      return { ok: false, message: config.content.login.errorMessage };
    }

    const loginEntry = {
      id: makeId('LOGIN'),
      email: normalizedEmail,
      at: new Date().toISOString(),
    };

    setConfig((current) => ({
      ...current,
      security: {
        ...current.security,
        adminLoginHistory: [loginEntry, ...current.security.adminLoginHistory].slice(0, 20),
      },
    }));

    setAuth({
      loggedIn: true,
      role: 'admin',
      email: normalizedEmail,
      pinVerified: !config.security.admin.pinEnabled,
    });

    return { ok: true };
  }

  async function verifyPin(pin) {
    if (!config.security.admin.pinEnabled) {
      setAuth((current) => ({ ...current, pinVerified: true }));
      return { ok: true };
    }

    const pinHash = await sha256(pin);
    if (pinHash !== config.security.admin.pinHash) {
      return { ok: false, message: 'PIN invalide.' };
    }

    setAuth((current) => ({ ...current, pinVerified: true }));
    return { ok: true };
  }

  function logout() {
    setAuth(initialAuth);
  }

  function createMockTransaction({ assetSymbol, amountFiat, quantity, payoutEmail }) {
    const asset = config.market.assets.find((item) => item.symbol === assetSymbol);
    const normalizedAmount = Number(amountFiat || 0);
    const transaction = {
      id: makeId('TX'),
      userId: auth.loggedIn ? auth.email : 'guest',
      userName: auth.loggedIn ? auth.email : 'Visiteur',
      userEmail: isEmail(payoutEmail) ? payoutEmail : config.payments.paypalEmail,
      type: 'Crypto → PayPal',
      amount: normalizedAmount,
      crypto: assetSymbol,
      quantity: Number(quantity || 0),
      payoutMethod: 'PayPal',
      status: 'En attente',
      date: new Date().toISOString(),
    };

    setConfig((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
      analytics: {
        ...current.analytics,
        volumeTotal: Number(current.analytics.volumeTotal || 0) + normalizedAmount,
        totalTransactions: Number(current.analytics.totalTransactions || 0) + 1,
        averageTransaction:
          Number(current.analytics.totalTransactions || 0) + 1 > 0
            ? (Number(current.analytics.volumeTotal || 0) + normalizedAmount) /
              (Number(current.analytics.totalTransactions || 0) + 1)
            : normalizedAmount,
        assetDistribution: current.analytics.assetDistribution.map((row) =>
          row.symbol === assetSymbol ? { ...row, volume: Number(row.volume || 0) + 1 } : row,
        ),
      },
    }));

    showToast(
      `${config.content.exchange.confirmationMessage} • ${asset?.symbol || assetSymbol} • ${euro(normalizedAmount)}`,
      'success',
      4200,
    );

    return transaction;
  }

  const value = useMemo(
    () => ({
      ready,
      config,
      setConfig,
      replaceSection,
      resetConfig,
      auth,
      login,
      verifyPin,
      logout,
      showToast,
      dismissToast,
      toasts,
      createMockTransaction,
    }),
    [auth, config, ready, toasts],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
