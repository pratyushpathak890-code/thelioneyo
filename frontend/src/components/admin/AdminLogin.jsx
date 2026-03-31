import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function AdminLogin({ onLogin, adminEmail, adminPassword }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    if (form.email === adminEmail && form.password === adminPassword) {
      onLogin(form.email);
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        background: '#050505',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      data-testid="admin-login-page"
    >
      {/* Background glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '48px 40px',
          position: 'relative',
        }}
        data-testid="admin-login-form"
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              background: 'rgba(37,99,235,0.1)',
              border: '1px solid rgba(37,99,235,0.3)',
              marginBottom: '20px',
            }}
          >
            <Lock size={22} color="#3b82f6" />
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: '20px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: '6px',
            }}
          >
            THE LIONEYO
          </div>
          <div className="section-label">Admin Panel</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Email
            </label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@thelioneyo.com"
              required
              autoComplete="email"
              data-testid="admin-email-input"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
                data-testid="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              data-testid="login-error"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'Manrope, sans-serif',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            disabled={loading}
            data-testid="admin-login-btn"
          >
            {loading ? 'Signing in...' : (
              <><Zap size={14} /> Sign In</>
            )}
          </button>
        </form>

        <p
          style={{
            marginTop: '28px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '12px',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          THE LIONEYO Admin — Authorized Access Only
        </p>
      </div>
    </div>
  );
}
