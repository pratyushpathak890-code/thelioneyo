import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const imageUrl = product.image1 || product.image2 || product.image3 || null;
  const categoryLabel = product.category === 'iit' ? 'IIT' : 'Streetwear';

  return (
    <div
      className="product-card animate-fade-in-up"
      onClick={() => onClick(product)}
      data-testid={`product-card-${product.id}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div className="product-img-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback placeholder */}
        <div
          style={{
            display: imageUrl ? 'none' : 'flex',
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
            flexDirection: 'column',
            gap: '12px',
            color: 'rgba(255,255,255,0.1)',
          }}
        >
          <ShoppingBag size={40} />
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            The Lioneyo
          </span>
        </div>

        {/* Category badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '4px 10px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            color: '#93c5fd',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {categoryLabel}
        </div>

        {/* Hover overlay */}
        <div className="product-overlay">
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            data-testid={`view-details-${product.id}`}
          >
            <ShoppingBag size={14} />
            View Details
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '20px 16px 16px' }}>
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '6px',
            lineHeight: 1.2,
          }}
        >
          {product.title}
        </h3>
        {product.caption && (
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px',
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '12px',
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.caption}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            data-testid={`product-price-${product.id}`}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: '18px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            ₹{product.price}
          </span>
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'Manrope, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            +₹50 delivery
          </span>
        </div>
      </div>
    </div>
  );
}
