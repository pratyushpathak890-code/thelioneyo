import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Lock } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Streetwear', href: '#streetwear' },
  { label: 'IIT Collection', href: '#iit' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      data-testid="navbar"
      style={{
        padding: '0 32px',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        data-testid="navbar-logo"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 900,
          fontSize: '18px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#ffffff',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            flexShrink: 0,
          }}
        />
        THE LIONEYO
      </Link>

      {/* Desktop links */}
      <div
        className="hidden md:flex"
        style={{ alignItems: 'center', gap: '32px' }}
        data-testid="desktop-nav"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#fff')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          to="/admin"
          data-testid="admin-link"
          title="Admin Panel"
          style={{
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            transition: 'all 0.2s',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#2563eb';
            e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <Lock size={14} />
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          data-testid="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          data-testid="mobile-menu"
          style={{
            position: 'absolute',
            top: 70,
            left: 0,
            right: 0,
            background: 'rgba(5,5,5,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '16px 32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 200,
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            style={{
              color: '#2563eb',
              fontSize: '13px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Lock size={12} /> Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}
