import React, { useState } from 'react';
import { ShoppingBag, Share2, CheckCircle } from 'lucide-react';

const CATEGORY_LABELS = { iit: 'IIT', mens: "Men's", womens: "Women's", streetwear: 'Streetwear' };

export default function ProductCard({ product, onClick }) {
  const [copied, setCopied] = useState(false);
  const imageUrl = product.image1 || product.image2 || product.image3 || null;
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Streetwear';

  const handleShare = async (e) => {
    e.stopPropagation();
    const slug = product?.slug;
    if (!slug) return;
    const url = `${window.location.origin}/product/${slug}`;
    try {
      if (navigator.share) { await navigator.share({ title: product.title, url }); return; }
    } catch (err) { if (err.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <div
      className="product-card animate-fade-in-up"
      onClick={() => onClick(product)}
      data-testid={`product-card-${product.id}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-img-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            style={{ objectFit: 'contain', objectPosition: 'center', padding: '8px', background: '#050505' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          style={{
            display: imageUrl ? 'none' : 'flex',
            position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center',
            background: '#050505',
            flexDirection: 'column', gap: '12px',
            color: 'rgba(255,255,255,0.1)',
          }}
        >
          <ShoppingBag size={40} />
          <span style={{ fontSize: '11px', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.2em', textTransform: 'uppercase' }}>The Lioneyo</span>
        </div>

        {/* Category badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', color: '#93c5fd', fontSize: '10px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {categoryLabel}
        </div>

        {/* Share button */}
        {product.slug && (
          <button
            onClick={handleShare}
            data-testid={`share-card-${product.id}`}
            title="Share"
            style={{ position: 'absolute', top: '10px', right: '10px', width: 30, height: 30, background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(0,0,0,0.55)', border: `1px solid ${copied ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(6px)' }}
          >
            {copied ? <CheckCircle size={13} /> : <Share2 size={13} />}
          </button>
        )}

        {/* Hover overlay */}
        <div className="product-overlay">
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} data-testid={`view-details-${product.id}`}>
            <ShoppingBag size={14} /> View Details
          </button>
        </div>
      </div>

      <div style={{ padding: '18px 16px 14px' }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '15px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '6px', lineHeight: 1.2 }}>
          {product.title}
        </h3>
        {product.caption && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', marginBottom: '12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.caption}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span data-testid={`product-price-${product.id}`} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: '#ffffff', letterSpacing: '-0.02em' }}>
            ₹{product.price}
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            +₹50 delivery
          </span>
        </div>
      </div>
    </div>
  );
}
