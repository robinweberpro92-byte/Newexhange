import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastStack from './ToastStack';
import { useApp } from '../context/AppContext';

function matchesNotification(item, pathname) {
  if (!item.enabled) return false;
  if (item.target === 'all') return true;
  return item.target === pathname;
}

export default function Layout() {
  const location = useLocation();
  const shownNotificationsRef = useRef(new Set());
  const { config, auth, ready, toasts, dismissToast, showToast } = useApp();

  useEffect(() => {
    if (!ready) return;
    const activeNotifications = config.notifications.items.filter((item) => matchesNotification(item, location.pathname));
    activeNotifications.forEach((item) => {
      const key = `${location.pathname}-${item.id}`;
      const isDashboardDisabled = location.pathname === '/dashboard' && !config.notifications.dashboardEnabled;
      if (isDashboardDisabled || shownNotificationsRef.current.has(key)) return;
      shownNotificationsRef.current.add(key);
      showToast(item.message, item.type, item.durationMs);
    });
  }, [config.notifications, location.pathname, ready, showToast]);

  const maintenanceEnabled =
    config.security.maintenanceMode &&
    !auth.loggedIn &&
    location.pathname !== '/admin' &&
    location.pathname !== '/login';

  return (
    <div className="app-shell">
      {config.content.announcement.enabled ? (
        <div className={`announcement announcement--${config.content.announcement.tone}`}>
          <div className="container">
            <span>{config.content.announcement.text}</span>
          </div>
        </div>
      ) : null}
      <Navbar />
      <main>
        {maintenanceEnabled ? (
          <section className="container section maintenance-screen">
            <p className="eyebrow">Maintenance</p>
            <h1>{config.security.maintenanceTitle}</h1>
            <p>{config.security.maintenanceMessage}</p>
          </section>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
