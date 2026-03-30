import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lioneyo_admin_token');
    if (!token) { setChecking(false); return; }
    fetch(`${BACKEND_URL}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setIsAuthenticated(true);
          setAdminEmail(data.email);
        } else {
          localStorage.removeItem('lioneyo_admin_token');
        }
      })
      .catch(() => localStorage.removeItem('lioneyo_admin_token'))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (token, email) => {
    localStorage.setItem('lioneyo_admin_token', token);
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('lioneyo_admin_token');
    setIsAuthenticated(false);
    setAdminEmail('');
  };

  if (checking) {
    return (
      <div
        style={{
          background: '#050505',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '2px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard adminEmail={adminEmail} onLogout={handleLogout} />;
}
