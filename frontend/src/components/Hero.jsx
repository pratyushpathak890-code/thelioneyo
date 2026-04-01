import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown, Zap } from 'lucide-react';

const FALLBACK_HERO = {
  hero_heading: 'IGNITE YOUR STYLE',
  hero_subtext: 'Premium streetwear engineered for the bold generation. Limited drops. Unlimited attitude.',
  hero_image:
    'https://static.prod-images.emergentagent.com/jobs/c98df7ef-72fb-4caf-a40d-69e90c497b95/images/329c0d52e4af4d7a1042bd63436e4ce3ad3bf99ddf16211b744b4e7d85f60dcc.png',
};

export default function Hero({ siteSettings, loading }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const heading = siteSettings?.hero_heading || FALLBACK_HERO.hero_heading;
  const subtext = siteSettings?.hero_subtext || FALLBACK_HERO.hero_subtext;
  const heroImage = siteSettings?.hero_image || FALLBACK_HERO.hero_image;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const words = heading.split(' ');

  return (
    <section
      id="home"
      className="hero-section"
      ref={ref}
      data-testid="hero-section"
      style={{ minHeight: '100vh' }}
    >
      {/* Background image */}
      <img
        src={heroImage}
        alt="Hero"
        className="hero-bg-image"
        onError={(e) => { e.target.src = FALLBACK_HERO.hero_image; }}
      />

      {/* Gradient overlays */}
      <div className="hero-gradient" />
      <div className="hero-gradient-bottom" />

      {/* Blue glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        className="hero-content"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
          paddingTop: '40px',
        }}
      >
        {/* Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease-out 0.2s',
          }}
        >
          <Zap size={12} color="#2563eb" />
          <span className="section-label">New Collection 2026</span>
          <div
            style={{
              height: '1px',
              width: '40px',
              background: 'linear-gradient(to right, #2563eb, transparent)',
            }}
          />
        </div>

        {/* Blue accent line */}
        <div
          className="blue-line"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'all 0.6s ease-out 0.3s',
          }}
        />

        {/* Main heading */}
        <h1
          data-testid="hero-heading"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(40px, 5.5vw, 76px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '20px',
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.1}s`,
                ...(i === words.length - 1
                  ? {
                      background: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }
                  : {}),
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          data-testid="hero-subtext"
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '15px',
            lineHeight: 1.7,
            maxWidth: '460px',
            fontFamily: 'Manrope, sans-serif',
            marginBottom: '40px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out 0.6s',
          }}
        >
          {subtext}
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease-out 0.75s',
          }}
        >
          <button
            className="btn-primary"
            onClick={scrollToProducts}
            data-testid="hero-shop-now-btn"
          >
            Shop Now
            <ArrowRight size={15} />
          </button>
          <a href="#products" className="btn-secondary" data-testid="hero-explore-btn">
            Explore Collection
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '56px',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.7s ease-out 0.9s',
          }}
        >
          {[
            { val: '200+', label: 'Orders Delivered' },
            { val: 'IIT', label: 'Exclusive Collections' },
            { val: '4.9★', label: 'Customer Rating' },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: '22px',
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'Manrope, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToProducts}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          fontSize: '10px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.7s ease-out 1.2s',
          animation: 'float 2.5s ease-in-out infinite',
        }}
      >
        <span>Scroll</span>
        <ChevronDown size={14} />
      </button>
    </section>
  );
}
