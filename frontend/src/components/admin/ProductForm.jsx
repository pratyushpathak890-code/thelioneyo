import React, { useState } from 'react';
import { Upload, X, Save, ImagePlus, Package } from 'lucide-react';
import { insertProduct, updateProduct, uploadImage, isSupabaseConfigured } from '../../lib/supabase';

const CATEGORIES = ['streetwear', 'iit'];

const EMPTY_FORM = {
  title: '', caption: '', price: '', category: 'streetwear',
  image1: '', image2: '', image3: '',
  features: '200 GSM, Bio Wash, Breathable, Premium Print, Gen-Z Streetwear Feel',
  is_active: true,
};

function ImageUploadField({ label, value, onChange, bucket, testid }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) { setError('Supabase not configured'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, bucket || 'product-images');
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </label>
      {value && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
          <img src={value} alt={label} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
          >
            <X size={10} />
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
            color: '#93c5fd', fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.1)')}
        >
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} data-testid={testid} />
          {uploading ? 'Uploading...' : <><ImagePlus size={13} /> Upload</>}
        </label>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>or</span>
        <input
          className="input-field"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL"
          style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
        />
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

export default function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState(product ? {
    title: product.title || '',
    caption: product.caption || '',
    price: product.price || '',
    category: product.category || 'streetwear',
    image1: product.image1 || '',
    image2: product.image2 || '',
    image3: product.image3 || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : (product.features || ''),
    is_active: product.is_active !== undefined ? product.is_active : true,
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!product;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) { setError('Supabase not configured. Please add credentials.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim(),
        price: Number(form.price),
        category: form.category,
        image1: form.image1 || null,
        image2: form.image2 || null,
        image3: form.image3 || null,
        features: form.features.trim(),
        is_active: form.is_active,
      };
      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await insertProduct(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px' }} data-testid="product-form">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '4px' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
            {isEdit ? `Editing: ${product.title}` : 'Fill in the details to add a new product'}
          </p>
        </div>
        <button onClick={onCancel} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Title + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Product Title *</label>
            <input className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. OG Black Tee" required data-testid="product-title-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Category *</label>
            <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)} required data-testid="product-category-select">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: '#0a0a0a' }}>
                  {c === 'iit' ? 'IIT Collection' : 'Streetwear'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Caption */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Caption / Description</label>
          <textarea className="input-field" value={form.caption} onChange={(e) => set('caption', e.target.value)} placeholder="Short product description" rows={2} style={{ resize: 'vertical' }} data-testid="product-caption-input" />
        </div>

        {/* Price */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Price (₹) *</label>
          <input className="input-field" type="number" min="1" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 599" required style={{ maxWidth: '200px' }} data-testid="product-price-input" />
        </div>

        {/* Images */}
        <div className="section-label" style={{ marginBottom: '16px' }}>Product Images (Upload to Supabase Storage)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ImageUploadField label="Image 1 (Front view) *" value={form.image1} onChange={(v) => set('image1', v)} bucket="product-images" testid="upload-image1" />
          <ImageUploadField label="Image 2 (Back view)" value={form.image2} onChange={(v) => set('image2', v)} bucket="product-images" testid="upload-image2" />
          <ImageUploadField label="Image 3 (Detail view)" value={form.image3} onChange={(v) => set('image3', v)} bucket="product-images" testid="upload-image3" />
        </div>

        {/* Features */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Features (comma-separated)</label>
          <input className="input-field" value={form.features} onChange={(e) => set('features', e.target.value)} placeholder="200 GSM, Bio Wash, Breathable, Premium Print" data-testid="product-features-input" />
        </div>

        {/* Active toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563eb' }} data-testid="product-active-toggle" />
          <label htmlFor="is_active" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}>
            Active (visible on storefront)
          </label>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }} disabled={saving} data-testid="save-product-btn">
            {saving ? 'Saving...' : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Add Product'}</>}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '14px 24px' }} data-testid="cancel-product-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
