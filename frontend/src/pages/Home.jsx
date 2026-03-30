import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import Footer from '../components/Footer';
import { fetchProducts, fetchSiteSettings, isSupabaseConfigured } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [prods, settings] = await Promise.all([fetchProducts(), fetchSiteSettings()]);
      setProducts(prods);
      setSiteSettings(settings);
      setLoading(false);
    }
    load();
  }, []);

  const whatsappNumber =
    siteSettings?.whatsapp_number ||
    process.env.REACT_APP_WHATSAPP_NUMBER ||
    '9557843135';

  const googleScriptUrl =
    siteSettings?.google_script_url || process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      {!isSupabaseConfigured && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#fbbf24',
            padding: '12px 24px',
            textAlign: 'center',
            fontSize: '13px',
            fontFamily: 'Manrope, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={14} />
          Supabase not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env to enable dynamic content.
        </div>
      )}
      <Navbar />
      <Hero siteSettings={siteSettings} loading={loading} />
      <ProductGrid
        products={products}
        loading={loading}
        onProductClick={setSelectedProduct}
      />
      <Footer siteSettings={siteSettings} whatsappNumber={whatsappNumber} />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          relatedProducts={products.filter(
            (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id
          )}
          siteSettings={siteSettings}
          googleScriptUrl={googleScriptUrl}
          whatsappNumber={whatsappNumber}
        />
      )}
    </div>
  );
}
