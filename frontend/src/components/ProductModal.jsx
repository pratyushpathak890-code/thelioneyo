import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  Shield,
  Package,
  Clock,
  CheckCircle,
  Tag,
  Sparkles,
} from 'lucide-react';
import { insertOrder } from '../lib/supabase';

const DELIVERY_CHARGE = 50;
const PERSONALIZATION_CHARGE = 40;
const VALID_REFERRAL_CODES = ['SHIVAM25', 'PRATYUSH25', 'NITIKA25', 'HARSH20'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function calcPricing(basePrice, referralCode, personalizationName) {
  const code = (referralCode || '').trim().toUpperCase();
  const isValid = code.length > 0 && VALID_REFERRAL_CODES.includes(code);
  const discount = isValid ? Math.round(Number(basePrice) * 0.25) : 0;
  const hasPersonalization = (personalizationName || '').trim().length > 0;
  const personalizationCharge = hasPersonalization ? PERSONALIZATION_CHARGE : 0;
  const total = Number(basePrice) + DELIVERY_CHARGE + personalizationCharge - discount;
  return { basePrice: Number(basePrice), delivery: DELIVERY_CHARGE, discount, personalizationCharge, total, isValid, hasPersonalization };
}

function saveOrderLocally(orderData) {
  const orders = JSON.parse(localStorage.getItem('lioneyo_orders') || '[]');
  const newId = `LNY-${Date.now().toString(36).toUpperCase()}`;
  const saved = { ...orderData, id: newId, date: new Date().toISOString(), status: 'Processing' };
  orders.unshift(saved);
  localStorage.setItem('lioneyo_orders', JSON.stringify(orders.slice(0, 30)));
  return newId;
}

function getImages(product) {
  return [product.image1, product.image2, product.image3].filter(Boolean);
}

function parseFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try { return JSON.parse(features); } catch {}
  return features.split(',').map((f) => f.trim()).filter(Boolean);
}

const DEFAULT_FEATURES = ['200 GSM', 'Bio Wash', 'Breathable', 'Premium Print', 'Gen-Z Streetwear Feel'];

export default function ProductModal({
  product,
  onClose,
  relatedProducts,
  siteSettings,
  googleScriptUrl,
  whatsappNumber,
}) {
  const images = getImages(product);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referralCode, setReferralCode] = useState('');
  const [personalizationName, setPersonalizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const rightRef = useRef(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '',
    pincode: '', quantity: '1', college_name: '',
  });

  const pricing = calcPricing(product.price, referralCode, personalizationName);
  const features = parseFeatures(product.features).length > 0
    ? parseFeatures(product.features)
    : DEFAULT_FEATURES;
  const upiId = siteSettings?.upi_id || process.env.REACT_APP_UPI_ID || '';
  const qrImage = siteSettings?.qr_image_url || 'https://customer-assets.emergentagent.com/job_lioneyo-preview/artifacts/faocstdf_upi-qr.png.jpeg';
  const scriptUrl = siteSettings?.google_script_url || googleScriptUrl || process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
  const waNumber = (whatsappNumber || '9557843135').replace(/\D/g, '');

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const prevImg = () => setImgIdx((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % images.length);

  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openWhatsApp = () => {
    const msg = `Hi, I placed an order from The Lioneyo:\n\nProduct: ${product.title}\nSize: ${selectedSize}\nTotal: ₹${pricing.total}\nName: ${form.name}\nAddress: ${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSize) { setSizeError(true); rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSizeError(false);
    setIsSubmitting(true);

    const orderData = {
      full_name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      quantity: form.quantity,
      college_design_name: form.college_name,
      product_title: product.title,
      product_image: product.image1 || '',
      price: pricing.basePrice,
      size: selectedSize,
      category: product.category,
      referral_code: referralCode.toUpperCase(),
      personalization_name: personalizationName.trim(),
      personalization_charge: pricing.personalizationCharge,
      final_total: pricing.total,
      payment_method: paymentMethod,
    };

    try {
      if (scriptUrl) {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
      }
    } catch (err) {
      console.warn('Order webhook error (non-blocking):', err);
    }

    const newOrderId = saveOrderLocally(orderData);
    // Save to Supabase (non-blocking)
    insertOrder({ ...orderData, id: newOrderId }).catch(() => {});
    setOrderId(newOrderId);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="product-modal"
    >
      <div
        className="modal-container glass-panel"
        style={{ background: '#080808' }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                padding: '3px 10px',
                background: 'rgba(37,99,235,0.15)',
                border: '1px solid rgba(37,99,235,0.3)',
                color: '#93c5fd',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {product.category === 'iit' ? 'IIT' : 'Streetwear'}
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              {product.title}
            </span>
          </div>
          <button
            onClick={onClose}
            data-testid="modal-close-btn"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Main body */}
        <div
          className="modal-body md:flex-row flex-col"
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* LEFT: Image Gallery */}
          <div
            className="modal-panel-left"
            style={{
              flex: '0 0 45%',
              position: 'relative',
              background: '#050505',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '400px',
              maxHeight: '75vh',
            }}
          >
            {/* Main image */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {images.length > 0 ? (
                <img
                  src={images[imgIdx]}
                  alt={`${product.title} view ${imgIdx + 1}`}
                  data-testid="modal-main-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transition: 'opacity 0.3s' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a0a0a, #111)',
                  }}
                >
                  <ShoppingBag size={60} style={{ color: 'rgba(255,255,255,0.08)' }} />
                </div>
              )}

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button className="img-nav-btn prev" onClick={prevImg} data-testid="prev-image-btn">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="img-nav-btn next" onClick={nextImg} data-testid="next-image-btn">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '12px 16px',
                  background: '#050505',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  flexShrink: 0,
                }}
              >
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb ${i + 1}`}
                    className={`thumb-btn ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                    data-testid={`thumbnail-${i}`}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}

            {/* Compact Related — 2 items inside left panel */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div style={{ padding: '10px 14px 14px', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#2563eb', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Also Like
                  </span>
                  <a
                    href="#products"
                    onClick={onClose}
                    style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                  >
                    More →
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {relatedProducts.slice(0, 2).map((rp) => (
                    <div
                      key={rp.id}
                      data-testid={`related-product-${rp.id}`}
                      style={{ flex: 1, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', transition: 'border-color 0.25s', overflow: 'hidden' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    >
                      <div style={{ height: '70px', overflow: 'hidden', background: '#0a0a0a' }}>
                        {rp.image1 ? (
                          <img src={rp.image1} alt={rp.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={14} style={{ color: 'rgba(255,255,255,0.1)' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '5px 7px' }}>
                        <div style={{ fontSize: '10px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {rp.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>₹{rp.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Product Info + Order Form */}
          <div
            ref={rightRef}
            className="modal-panel-right"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px 28px',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {isSubmitted ? (
              /* SUCCESS STATE */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  textAlign: 'center',
                  padding: '32px',
                }}
                data-testid="order-success"
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(37,211,102,0.1)',
                    border: '2px solid #25d366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    animation: 'pulseGlow 2s ease-in-out infinite',
                  }}
                >
                  <CheckCircle size={32} color="#25d366" />
                </div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: '22px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    marginBottom: '12px',
                  }}
                >
                  Order Placed!
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '14px',
                    fontFamily: 'Manrope, sans-serif',
                    lineHeight: 1.7,
                    marginBottom: '20px',
                    maxWidth: '320px',
                  }}
                >
                  Thank you for your order. Delivery in 4–6 days. Confirmation on WhatsApp.
                </p>

                {/* Order ID */}
                {orderId && (
                  <div
                    data-testid="order-id-display"
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(37,99,235,0.08)',
                      border: '1px solid rgba(37,99,235,0.25)',
                      marginBottom: '24px',
                      width: '100%',
                      maxWidth: '320px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Your Order ID
                    </div>
                    <div style={{ color: '#93c5fd', fontWeight: 800, fontSize: '16px', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.12em' }} data-testid="order-id">
                      {orderId}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                      Save this for order tracking
                    </div>
                  </div>
                )}
                <button
                  className="whatsapp-btn"
                  onClick={openWhatsApp}
                  data-testid="whatsapp-confirm-btn"
                  style={{ maxWidth: '320px' }}
                >
                  <MessageCircle size={16} />
                  Confirm on WhatsApp
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ marginTop: '12px', width: '100%', maxWidth: '320px', textAlign: 'center', justifyContent: 'center' }}
                >
                  Continue Shopping
                </button>
                <Link
                  to="/orders"
                  onClick={onClose}
                  data-testid="view-my-orders-link"
                  style={{ marginTop: '10px', display: 'inline-block', color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  View My Orders →
                </Link>
              </div>
            ) : (
              /* ORDER FORM */
              <form onSubmit={handleSubmit}>
                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 900,
                      fontSize: '32px',
                      letterSpacing: '-0.03em',
                      color: '#fff',
                    }}
                  >
                    ₹{product.price}
                  </span>
                  <span
                    style={{
                      marginLeft: '8px',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '13px',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    +₹50 delivery
                  </span>
                </div>

                {/* Caption */}
                {product.caption && (
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '13px',
                      fontFamily: 'Manrope, sans-serif',
                      lineHeight: 1.7,
                      marginBottom: '20px',
                    }}
                  >
                    {product.caption}
                  </p>
                )}

                {/* Feature pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {features.map((f) => (
                    <span key={f} className="feature-pill">{f}</span>
                  ))}
                </div>

                {/* Size selector */}
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: sizeError ? '#f87171' : 'rgba(255,255,255,0.4)',
                      marginBottom: '10px',
                    }}
                  >
                    Select Size {sizeError && '— Please choose a size'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                        onClick={() => { setSelectedSize(s); setSizeError(false); }}
                        data-testid={`size-btn-${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {[
                    { icon: <Shield size={12} />, label: 'Secure Order' },
                    { icon: <Package size={12} />, label: 'Premium Quality' },
                    { icon: <Clock size={12} />, label: '4–6 Days Delivery' },
                  ].map((b) => (
                    <div key={b.label} className="trust-badge">
                      {b.icon}
                      {b.label}
                    </div>
                  ))}
                </div>

                {/* IIT Personalization */}
                {product.category === 'iit' && (
                  <div
                    data-testid="iit-personalization-section"
                    style={{
                      background: 'rgba(37,99,235,0.06)',
                      border: '1px solid rgba(37,99,235,0.25)',
                      padding: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#93c5fd', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px', cursor: 'default' }}>
                      <Sparkles size={12} /> Personalized Name on Tee (+₹40)
                    </label>
                    <input
                      className="input-field"
                      value={personalizationName}
                      onChange={(e) => setPersonalizationName(e.target.value)}
                      placeholder="Enter name to print (e.g. RAHUL — optional)"
                      data-testid="input-personalization"
                    />
                    {personalizationName.trim() && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '12px', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={12} /> Preview: "{personalizationName}" — +₹40 added to total
                      </div>
                    )}
                    <p style={{ marginTop: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.55 }}>
                      Leave empty if no personalization needed. For custom designs contact{' '}
                      <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 700, textDecoration: 'none' }}>WhatsApp</a>.
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                    marginBottom: '24px',
                  }}
                />

                {/* Form heading */}
                <div className="section-label" style={{ marginBottom: '16px' }}>Order Details</div>

                {/* Order form fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name *</label>
                    <input className="input-field" name="name" value={form.name} onChange={handleFormChange} placeholder="Your name" required data-testid="input-name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Phone / WhatsApp *</label>
                    <input className="input-field" name="phone" value={form.phone} onChange={handleFormChange} placeholder="10-digit number" required data-testid="input-phone" />
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Email *</label>
                  <input className="input-field" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="your@email.com" required data-testid="input-email" />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Address *</label>
                  <input className="input-field" name="address" value={form.address} onChange={handleFormChange} placeholder="Street address, house no." required data-testid="input-address" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>City *</label>
                    <input className="input-field" name="city" value={form.city} onChange={handleFormChange} placeholder="City" required data-testid="input-city" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>State *</label>
                    <input className="input-field" name="state" value={form.state} onChange={handleFormChange} placeholder="State" required data-testid="input-state" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Pincode *</label>
                    <input className="input-field" name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="Pincode" required data-testid="input-pincode" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Quantity</label>
                    <input className="input-field" name="quantity" type="number" min="1" max="10" value={form.quantity} onChange={handleFormChange} data-testid="input-quantity" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>College / Design Name</label>
                    <input className="input-field" name="college_name" value={form.college_name} onChange={handleFormChange} placeholder="Optional" data-testid="input-college" />
                  </div>
                </div>

                {/* Referral code */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <Tag size={10} style={{ display: 'inline', marginRight: 4 }} />
                    Referral Code (25% off)
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      className="input-field"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Enter promo code e.g. HARSH20"
                      style={{ flex: 1 }}
                      data-testid="input-referral"
                    />
                    {pricing.isValid && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap', padding: '0 8px' }}>
                        <CheckCircle size={14} /> Valid!
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing summary */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    padding: '16px 20px',
                    marginBottom: '20px',
                  }}
                  data-testid="pricing-summary"
                >
                  <div className="section-label" style={{ marginBottom: '12px' }}>Order Summary</div>
                  <div className="pricing-row">
                    <span>MRP</span>
                    <span>₹{pricing.basePrice}</span>
                  </div>
                  <div className="pricing-row">
                    <span>Delivery</span>
                    <span>₹{pricing.delivery}</span>
                  </div>
                  {pricing.discount > 0 && (
                    <div className="pricing-row discount">
                      <span>Referral Discount (25%)</span>
                      <span>-₹{pricing.discount}</span>
                    </div>
                  )}
                  {pricing.personalizationCharge > 0 && (
                    <div className="pricing-row" style={{ color: '#93c5fd' }}>
                      <span>Personalization</span>
                      <span>+₹{pricing.personalizationCharge}</span>
                    </div>
                  )}
                  <div className="pricing-row total">
                    <span>Total</span>
                    <span data-testid="order-total">₹{pricing.total}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ marginBottom: '20px' }}>
                  <div className="section-label" style={{ marginBottom: '10px' }}>Payment Method</div>
                  <div style={{ display: 'flex', gap: '0' }}>
                    {['UPI', 'COD'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`payment-option ${paymentMethod === m ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(m)}
                        data-testid={`payment-${m.toLowerCase()}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment details */}
                {paymentMethod === 'UPI' && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '20px',
                      marginBottom: '20px',
                      textAlign: 'center',
                    }}
                    data-testid="upi-details"
                  >
                    {qrImage && (
                      <div className="qr-container" style={{ marginBottom: '12px' }}>
                        <img src={qrImage} alt="UPI QR Code" />
                      </div>
                    )}
                    {!qrImage && (
                      <div
                        style={{
                          width: '160px',
                          height: '160px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: '11px',
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          textAlign: 'center',
                          padding: '12px',
                        }}
                      >
                        QR Code configured from Admin Panel
                      </div>
                    )}
                    {upiId && (
                      <div
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(37,99,235,0.08)',
                          border: '1px solid rgba(37,99,235,0.2)',
                          color: '#93c5fd',
                          fontSize: '13px',
                          fontFamily: 'Manrope, sans-serif',
                          fontWeight: 700,
                          display: 'inline-block',
                        }}
                      >
                        UPI: {upiId}
                      </div>
                    )}
                    {!upiId && (
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
                        UPI ID configured from Admin Panel
                      </p>
                    )}
                    <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
                      Pay ₹{pricing.total} and proceed with the order
                    </p>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      color: '#fbbf24',
                      fontSize: '13px',
                      fontFamily: 'Manrope, sans-serif',
                      lineHeight: 1.6,
                    }}
                    data-testid="cod-details"
                  >
                    <strong>Cash on Delivery:</strong> A partial advance of ₹100 is required via UPI/WhatsApp to confirm your COD order. Full amount (₹{pricing.total}) due at delivery.
                  </div>
                )}

                {/* Submit + WhatsApp */}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', fontSize: '14px', padding: '16px' }}
                  disabled={isSubmitting}
                  data-testid="submit-order-btn"
                >
                  {isSubmitting ? 'Placing Order...' : (
                    <><ShoppingBag size={15} /> Place Order — ₹{pricing.total}</>
                  )}
                </button>
                <button
                  type="button"
                  className="whatsapp-btn"
                  onClick={openWhatsApp}
                  data-testid="whatsapp-order-btn"
                >
                  <MessageCircle size={15} />
                  Order via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related products - removed from bottom, now in left panel above */}
      </div>
    </div>
  );
}
