import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'admin@thelioneyo.com';
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'Lioneyo@123';
const SESSION_KEY = 'lioneyo_admin_session';
const SESSION_TTL = 48 * 60 * 60 * 1000; // 48 hours

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(atob(raw));
        if (session?.email && Date.now() - session.ts < SESSION_TTL) {
          setIsAuthenticated(true);
          setAdminEmail(session.email);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setChecking(false);
  }, []);

  const handleLogin = (email) => {
    const session = { email, ts: Date.now() };
    localStorage.setItem(SESSION_KEY, btoa(JSON.stringify(session)));
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setAdminEmail('');
  };

  if (checking) {
    return (
      <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} adminEmail={ADMIN_EMAIL} adminPassword={ADMIN_PASSWORD} />;
  }

  return <AdminDashboard adminEmail={adminEmail} onLogout={handleLogout} />;
}

