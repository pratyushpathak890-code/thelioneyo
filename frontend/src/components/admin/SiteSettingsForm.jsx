import React, { useState, useEffect } from 'react';
import { Save, ImagePlus, X, RefreshCw } from 'lucide-react';
import { fetchSiteSettings, upsertSiteSettings, uploadImage, isSupabaseConfigured } from '../../lib/supabase';

const EMPTY = {
  id: null,
  hero_heading: 'IGNITE YOUR STYLE',
  hero_subtext: 'Premium streetwear engineered for the bold generation. Limited drops. Unlimited attitude.',
  hero_image: '',
  whatsapp_number: '9557843135',
  upi_id: '',
  google_script_url: '',
  qr_image_url: 'https://customer-assets.emergentagent.com/job_lioneyo-preview/artifacts/faocstdf_upi-qr.png.jpeg',
  instagram_url: 'https://www.instagram.com/thelioneyotshirts/',
};

function ImageUploadField({ label, value, onChange, bucket, testid, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) { setError('Supabase not configured'); return; }
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, bucket || 'site-images');
      onChange(url);
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </label>
      {hint && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '8px' }}>{hint}</p>}
      {value && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
          <img src={value} alt={label} style={{ width: 120, height: 80, objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,0.1)' }} onError={(e) => { e.target.style.opacity = '0.3'; }} />
          <button type="button" onClick={() => onChange('')} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={10} />
          </button>
        </div>
      )}
      {/* URL paste — primary */}
      <input
        className="input-field"
        type="url"
        value={value}
        onChange={(e) => { onChange(e.target.value); setError(''); }}
        placeholder="Paste image URL (recommended)"
        style={{ marginBottom: '8px' }}
      />
      {/* File upload — secondary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}
        >
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} data-testid={testid} disabled={uploading} />
          {uploading ? 'Uploading...' : <><ImagePlus size={12} /> Upload file</>}
        </label>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>(needs Supabase Storage)</span>
      </div>
      {error && (
        <div style={{ marginTop: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '10px 12px', fontSize: '11px', fontFamily: 'Manrope, sans-serif', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', testid, hint, multiline }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </label>
      {hint && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '6px' }}>{hint}</p>}
      {multiline ? (
        <textarea className="input-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ resize: 'vertical' }} data-testid={testid} />
      ) : (
        <input className="input-field" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testid} />
      )}
    </div>
  );
}

export default function SiteSettingsForm({ onSaved }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === 'object' && v.target ? v.target.value : v }));

  const load = async () => {
    setLoading(true);
    const data = await fetchSiteSettings();
    if (data) setForm({ ...EMPTY, ...data });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) { setError('Supabase not configured. Please add credentials.'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await upsertSiteSettings({
        id: form.id,
        hero_heading: form.hero_heading,
        hero_subtext: form.hero_subtext,
        hero_image: form.hero_image,
        whatsapp_number: form.whatsapp_number,
        upi_id: form.upi_id,
        google_script_url: form.google_script_url,
        qr_image_url: form.qr_image_url,
        instagram_url: form.instagram_url,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onSaved) onSaved();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="site-settings-form">
      {/* Hero Section */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', marginBottom: '20px' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>Hero Section</div>
        <Field label="Hero Heading *" value={form.hero_heading} onChange={set('hero_heading')} placeholder="IGNITE YOUR STYLE" testid="hero-heading-input" />
        <Field label="Hero Subtext" value={form.hero_subtext} onChange={set('hero_subtext')} placeholder="Premium streetwear..." testid="hero-subtext-input" multiline />
        <ImageUploadField
          label="Hero Background Image"
          value={form.hero_image}
          onChange={set('hero_image')}
          bucket="site-images"
          testid="upload-hero-image"
          hint="Recommended: full-width premium fashion photo. Leave empty to use default."
        />
      </div>

      {/* Contact & Payment */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', marginBottom: '20px' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>Contact & Payment</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field
            label="WhatsApp Number"
            value={form.whatsapp_number}
            onChange={set('whatsapp_number')}
            placeholder="9557843135"
            testid="whatsapp-input"
            hint="Without country code. Used for order confirmations."
          />
          <Field
            label="UPI ID"
            value={form.upi_id}
            onChange={set('upi_id')}
            placeholder="yourname@upi"
            testid="upi-id-input"
          />
        </div>
        <Field
          label="Instagram URL"
          value={form.instagram_url}
          onChange={set('instagram_url')}
          placeholder="https://www.instagram.com/yourhandle/"
          testid="instagram-url-input"
          hint="Shown as the Instagram icon link in the footer."
        />
        <ImageUploadField
          label="UPI QR Code Image"
          value={form.qr_image_url}
          onChange={set('qr_image_url')}
          bucket="site-images"
          testid="upload-qr-image"
          hint="Upload your UPI QR code image to show during checkout."
        />
      </div>

      {/* Integrations */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', padding: '28px', marginBottom: '28px' }}>
        <div className="section-label" style={{ marginBottom: '20px' }}>Order Webhook (Google Sheets)</div>
        <Field
          label="Google Apps Script URL"
          value={form.google_script_url}
          onChange={set('google_script_url')}
          placeholder="https://script.google.com/macros/s/..."
          testid="google-script-input"
          hint="Orders will be POSTed to this URL. Get this from your Google Apps Script deployment."
        />
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', padding: '12px 16px', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '16px' }} data-testid="settings-success-msg">
          Settings saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn-primary" style={{ padding: '14px 32px' }} disabled={saving} data-testid="save-settings-btn">
          {saving ? 'Saving...' : <><Save size={14} /> Save Settings</>}
        </button>
        <button type="button" onClick={load} className="btn-secondary" style={{ padding: '14px 20px' }} data-testid="reload-settings-btn">
          <RefreshCw size={13} /> Reload
        </button>
      </div>
    </form>
  );
}
