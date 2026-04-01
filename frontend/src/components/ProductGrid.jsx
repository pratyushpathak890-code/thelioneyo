import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Package } from 'lucide-react';

const CATEGORY_META = {
  streetwear: { label: 'Streetwear Collection', desc: 'Premium urban fashion for the bold generation', id: 'streetwear' },
  mens:       { label: "Men's Collection",        desc: 'Engineered for him — premium fits for the modern man', id: 'mens' },
  womens:     { label: "Women's Collection",       desc: 'Bold, beautiful, and built for her', id: 'womens' },
  iit:        { label: 'IIT Collection',           desc: 'Exclusive designs for the campus elite', id: 'iit' },
};

const ALL_CATEGORIES = ['streetwear', 'mens', 'womens', 'iit'];

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 20, width: '40%' }} />
      </div>
    </div>
  );
}

function CategorySection({ category, products, onProductClick }) {
  const meta = CATEGORY_META[category] || { label: category.charAt(0).toUpperCase() + category.slice(1), desc: '', id: category };

  return (
    <section id={meta.id} style={{ marginBottom: '80px' }} data-testid={`category-section-${category}`}>
      <div className="category-header">
        <div>
          <div className="section-label" style={{ marginBottom: '8px' }}>{meta.desc}</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1 }}>
            {meta.label}
          </h2>
        </div>
        <div className="category-line" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {products.map((product, i) => (
          <div key={product.id} style={{ opacity: 0, animation: `fadeInUp 0.5s ease-out ${i * 0.08}s forwards` }}>
            <ProductCard product={product} onClick={onProductClick} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductGrid({ products, loading, onProductClick }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const availableCats = ALL_CATEGORIES.filter(cat => products.some(p => p.category === cat));

  const filters = [
    { id: 'all', label: 'All Drops' },
    ...availableCats.map(id => ({
      id,
      label: id === 'iit' ? 'IIT' : id === 'mens' ? "Men's" : id === 'womens' ? "Women's" : 'Streetwear',
    })),
  ];

  const filteredProducts = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  const countFor = (id) => id === 'all' ? products.length : products.filter(p => p.category === id).length;

  return (
    <section id="products" data-testid="products-section" style={{ background: '#050505', padding: 'clamp(48px, 6vw, 96px) clamp(24px, 4vw, 64px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section intro */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>The Collection</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(32px, 5vw, 56px)', textTransform: 'uppercase', letterSpacing: '-0.03em', color: '#ffffff', marginBottom: '16px' }}>
            Wear Your Identity
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontFamily: 'Manrope, sans-serif', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
            Every piece engineered with 200 GSM premium fabric, bio-wash finish, and Gen-Z streetwear energy.
          </p>
        </div>

        {/* Animated Filter Tabs */}
        {!loading && products.length > 0 && (
          <div
            data-testid="filter-tabs"
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}
          >
            {filters.map((f) => {
              const isActive = activeFilter === f.id;
              const count = countFor(f.id);
              return (
                <button
                  key={f.id}
                  data-testid={`filter-tab-${f.id}`}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: '9px 22px',
                    background: isActive ? '#2563eb' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? '#2563eb' : 'rgba(255,255,255,0.1)'}`,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '11px',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '100px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isActive ? '0 0 20px rgba(37,99,235,0.4)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                >
                  {f.label}
                  {count > 0 && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.65, fontWeight: 600 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Products */}
        {!loading && activeFilter === 'all' && (
          <>
            {ALL_CATEGORIES.map((cat) => {
              const catProducts = products.filter(p => p.category === cat);
              if (!catProducts.length) return null;
              return <CategorySection key={cat} category={cat} products={catProducts} onProductClick={onProductClick} />;
            })}
          </>
        )}

        {/* Filtered flat grid */}
        {!loading && activeFilter !== 'all' && filteredProducts.length > 0 && (
          <section id={activeFilter} data-testid={`filtered-grid-${activeFilter}`} style={{ marginBottom: '80px' }}>
            <div className="category-header">
              <div>
                <div className="section-label" style={{ marginBottom: '8px' }}>
                  {CATEGORY_META[activeFilter]?.desc || ''}
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(28px, 4vw, 48px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>
                  {CATEGORY_META[activeFilter]?.label || activeFilter}
                </h2>
              </div>
              <div className="category-line" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {filteredProducts.map((product, i) => (
                <div key={product.id} style={{ opacity: 0, animation: `fadeInUp 0.45s ease-out ${i * 0.07}s forwards` }}>
                  <ProductCard product={product} onClick={onProductClick} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div data-testid="empty-products" style={{ textAlign: 'center', padding: '96px 32px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Package size={40} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif", fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Products coming soon. Configure Supabase to load products.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
