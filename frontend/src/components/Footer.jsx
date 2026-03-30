import React from 'react';
import { Instagram, Twitter, MessageCircle, Mail } from 'lucide-react';

const DEFAULT_INSTAGRAM = 'https://www.instagram.com/thelioneyotshirts/';

export default function Footer({ siteSettings, whatsappNumber }) {
  const phone = (whatsappNumber || '9557843135').replace(/\D/g, '');
  const waUrl = `https://wa.me/${phone}`;
  const instaUrl = siteSettings?.instagram_url || DEFAULT_INSTAGRAM;

  return (
    <footer
      id="about"
      data-testid="footer"
      style={{
        background: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '80px 48px 40px',
      }}
    >
      {/* Top section */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: '20px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#ffffff',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 24,
                height: 24,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                flexShrink: 0,
              }}
            />
            THE LIONEYO
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              lineHeight: '1.7',
              fontFamily: 'Manrope, sans-serif',
              maxWidth: '240px',
            }}
          >
            Premium luxury streetwear crafted for those who refuse to blend in.
            200 GSM. Bio-washed. Built different.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {[
              { icon: <Instagram size={16} />, href: instaUrl, label: 'Instagram' },
              { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
              { icon: <MessageCircle size={16} />, href: waUrl, label: 'WhatsApp' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                style={{
                  width: 36,
                  height: 36,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
            }}
          >
            Quick Links
          </h4>
          {[
            { label: 'Home', href: '#home' },
            { label: 'Streetwear Collection', href: '#streetwear' },
            { label: 'IIT Collection', href: '#iit' },
            { label: 'Admin Panel', href: '/admin' },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontFamily: 'Manrope, sans-serif',
                textDecoration: 'none',
                padding: '6px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#fff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
            }}
          >
            Contact
          </h4>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              textDecoration: 'none',
              marginBottom: '12px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#25d366')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <MessageCircle size={15} />
            WhatsApp: {whatsappNumber}
          </a>
          {siteSettings?.upi_id && (
            <div
              style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '13px',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              UPI: {siteSettings.upi_id}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div>
          <h4
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
            }}
          >
            Our Promise
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['200 GSM Premium Fabric', 'Bio-Wash Finish', 'Breathable & Durable', '4-6 Days Delivery'].map(
              (t) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      background: '#2563eb',
                      flexShrink: 0,
                      boxShadow: '0 0 6px rgba(37,99,235,0.8)',
                    }}
                  />
                  {t}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '12px',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          © 2025 THE LIONEYO. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Use', 'Refund Policy'].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: '12px',
                fontFamily: 'Manrope, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.25)')}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
