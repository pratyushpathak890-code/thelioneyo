import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight, MessageCircle, ShoppingBag,
  Shield, Package, Clock, CheckCircle, Tag, Sparkles,
  CreditCard, Truck, Zap, AlertCircle, Share2,
} from 'lucide-react';
import { insertOrder } from '../lib/supabase';

const DELIVERY_CHARGE = 50;
const PERSONALIZATION_CHARGE = 40;
const PARTIAL_COD_DEFAULT = 150;
const VALID_REFERRAL_CODES = ['SHIVAM25', 'PRATYUSH25', 'NITIKA25', 'HARSH20'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORY_LABELS = { iit: 'IIT', mens: "Men's", womens: "Women's", streetwear: 'Streetwear' };

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function calcPricing(basePrice, qty, referralCode, personalizationName) {
  const quantity = Math.max(1, parseInt(qty) || 1);
  const code = (referralCode || '').trim().toUpperCase();
  const isValid = code.length > 0 && VALID_REFERRAL_CODES.includes(code);
  const productTotal = Number(basePrice) * quantity;
  const discount = isValid ? Math.round(productTotal * 0.25) : 0;
  const hasPersonalization = (personalizationName || '').trim().length > 0;
  const personalizationCharge = hasPersonalization ? PERSONALIZATION_CHARGE : 0;
  const total = productTotal + DELIVERY_CHARGE + personalizationCharge - discount;
  return { basePrice: Number(basePrice), quantity, productTotal, delivery: DELIVERY_CHARGE, discount, personalizationCharge, total, isValid };
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

const DEFAULT_FEATURES = ['200 GSM', 'Bio Wash', 'Breathable', 'Premium Print', 'Gen-Z Feel'];

function ShareBtn({ product }) {
  const [copied, setCopied] = useState(false);
  const slug = product?.slug;
  if (!slug) return null;
  const url = `${window.location.origin}/product/${slug}`;
  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) { await navigator.share({ title: product.title, text: `Check out ${product.title}`, url }); return; }
    } catch (err) { if (err.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <button onClick={handleShare} data-testid={`share-btn-${product.id}`} title="Share"
      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: copied ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
      {copied ? <><CheckCircle size={11} /> Copied!</> : <><Share2 size={11} /> Share</>}
    </button>
  );
}

const MODAL_STYLES = `
  .lny-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.9);
    backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    padding: 12px;
  }
  .lny-box {
    width: 95vw;
    max-width: 1160px;
    max-height: 90vh;
    background: #080808;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 80px rgba(37,99,235,0.1), 0 40px 100px rgba(0,0,0,0.85);
  }
  .lny-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0; background: #080808; z-index: 10;
  }
  .lny-body {
    display: flex; flex: 1; overflow: hidden; min-height: 0;
  }
  .lny-left {
    flex: 0 0 43%;
    display: flex; flex-direction: column;
    background: #040404;
    border-right: 1px solid rgba(255,255,255,0.05);
    overflow-y: auto; min-height: 0;
  }
  .lny-right {
    flex: 1; overflow-y: auto;
    padding: 22px 26px; min-height: 0;
  }
  .lny-img-wrap {
    width: 100%;
    background: #040404;
    display: flex; align-items: center; justify-content: center;
    position: relative; flex-shrink: 0;
    padding: 12px;
    min-height: 280px;
  }
  .lny-img-wrap img {
    max-width: 100%; max-height: 380px;
    width: 100%; height: 380px;
    object-fit: contain; object-position: center;
    display: block;
  }
  .lny-nav-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 30px; height: 30px;
    background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.12);
    color: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; z-index: 5;
  }
  .lny-nav-btn:hover { background: rgba(37,99,235,0.5); }
  .lny-nav-btn.prev { left: 10px; }
  .lny-nav-btn.next { right: 10px; }
  .lny-thumbs {
    display: flex; gap: 6px; padding: 8px 12px;
    border-top: 1px solid rgba(255,255,255,0.04); flex-shrink: 0;
    overflow-x: auto;
  }
  .lny-thumb {
    flex: 0 0 56px; height: 56px; cursor: pointer;
    background: #040404; border: 2px solid rgba(255,255,255,0.06);
    overflow: hidden; transition: border-color 0.2s;
  }
  .lny-thumb.active { border-color: #2563eb; }
  .lny-thumb img { width: 100%; height: 100%; object-fit: contain; object-position: center; }
  .lny-related {
    padding: 10px 12px 12px;
    border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
  }
  .lny-rel-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; margin-top: 7px;
  }
  .lny-rel-card {
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    overflow: hidden; cursor: pointer; transition: border-color 0.2s;
  }
  .lny-rel-card:hover { border-color: rgba(37,99,235,0.35); }
  .lny-rel-card img {
    width: 100%; height: 72px;
    object-fit: contain; object-position: center;
    background: #040404; display: block;
  }
  /* Tablet */
  @media (max-width: 1024px) {
    .lny-box { max-width: 96vw; }
    .lny-left { flex: 0 0 40%; }
    .lny-right { padding: 18px 20px; }
    .lny-img-wrap img { max-height: 320px; height: 320px; }
  }
  /* Mobile */
  @media (max-width: 767px) {
    .lny-box { width: 95vw; max-height: 92vh; }
    .lny-body { flex-direction: column; overflow-y: auto; }
    .lny-left {
      flex: 0 0 auto; border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      overflow: visible;
    }
    .lny-right { padding: 16px 14px; overflow: visible; min-height: auto; }
    .lny-img-wrap { padding: 8px; min-height: 220px; }
    .lny-img-wrap img { max-height: 260px; height: 260px; }
    .lny-rel-grid { grid-template-columns: repeat(3, 1fr); }
    .lny-left, .lny-right { min-height: auto; }
  }
  @media (max-width: 430px) {
    .lny-right { padding: 14px 12px; }
    .lny-img-wrap img { max-height: 230px; height: 230px; }
    .lny-rel-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

export default function ProductModal({ product, onClose, relatedProducts, siteSettings, googleScriptUrl, whatsappNumber }) {
  const images = getImages(product);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [referralCode, setReferralCode] = useState('');
  const [personalizationName, setPersonalizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const rightRef = useRef(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', quantity: '1', college_name: '' });

  const partialCodAmt = Number(siteSettings?.partial_cod_amount) || PARTIAL_COD_DEFAULT;
  const enableCod = siteSettings?.cod_enabled !== false;
  const pricing = calcPricing(product.price, form.quantity, referralCode, personalizationName);
  const payNow = paymentMethod === 'PARTIAL_COD' ? partialCodAmt : pricing.total;
  const features = parseFeatures(product.features).length > 0 ? parseFeatures(product.features) : DEFAULT_FEATURES;
  const scriptUrl = siteSettings?.google_script_url || googleScriptUrl || process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
  const waNumber = (siteSettings?.whatsapp_number || whatsappNumber || '9557843135').replace(/\D/g, '');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  });

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openWhatsApp = (pdOverride, orderIdOverride, methodOverride) => {
    const pd = pdOverride !== undefined ? pdOverride : paymentDetails;
    const oid = orderIdOverride !== undefined ? orderIdOverride : orderId;
    const meth = methodOverride !== undefined ? methodOverride : paymentMethod;
    const lines = [
      `*Order — THE LIONEYO*`, ``,
      `Customer: ${form.name}`,
      `Phone: ${form.phone}`,
      `Product: ${product.title}`,
      `Size: ${selectedSize}`,
      `Qty: ${form.quantity}`,
      `Total: ₹${pricing.total}`,
      `Payment: ${meth === 'ONLINE' ? 'Online (Razorpay)' : 'Partial COD'}`,
      pd ? `Paid: ₹${pd.paid_amount}` : '',
      meth === 'PARTIAL_COD' ? `Remaining COD: ₹${pricing.total - partialCodAmt}` : '',
      pd?.payment_id ? `Razorpay ID: ${pd.payment_id}` : '',
      oid ? `Order ID: ${oid}` : '',
      ``,
      `Address: ${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSize) { setSizeError(true); rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSizeError(false);
    setIsSubmitting(true);
    setPaymentError('');
    const tempId = `LNY-${Date.now().toString(36).toUpperCase()}`;

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Payment gateway unavailable. Please try again.');

      const orderResp = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payNow, receipt: tempId }),
      });
      if (!orderResp.ok) {
        const err = await orderResp.json().catch(() => ({}));
        throw new Error(err.error || 'Payment initialization failed.');
      }
      const rzpOrder = await orderResp.json();
      const rzpKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;

      const paymentResult = await new Promise((resolve, reject) => {
        const options = {
          key: rzpKeyId,
          amount: rzpOrder.amount,
          currency: 'INR',
          name: 'THE LIONEYO',
          description: `${product.title} × ${form.quantity}`,
          image: product.image1 || '',
          order_id: rzpOrder.id,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          notes: { order_id: tempId, product: product.title, size: selectedSize },
          theme: { color: '#2563eb' },
          handler: async (rzpResp) => {
            try {
              const verifyResp = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: rzpResp.razorpay_order_id,
                  razorpay_payment_id: rzpResp.razorpay_payment_id,
                  razorpay_signature: rzpResp.razorpay_signature,
                }),
              });
              const vd = await verifyResp.json();
              if (vd.verified) resolve({ ...rzpResp, verified: true });
              else reject(new Error('Payment verification failed. Contact support.'));
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error('DISMISSED')) },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed')));
        rzp.open();
      });

      const details = {
        payment_id: paymentResult.razorpay_payment_id,
        method: paymentMethod,
        paid_amount: payNow,
        remaining_amount: paymentMethod === 'PARTIAL_COD' ? pricing.total - partialCodAmt : 0,
      };

      const orderData = {
        id: tempId,
        full_name: form.name, phone: form.phone, email: form.email,
        address: form.address, city: form.city, state: form.state, pincode: form.pincode,
        quantity: form.quantity, college_design_name: form.college_name,
        product_title: product.title, product_image: product.image1 || '',
        price: pricing.basePrice, size: selectedSize, category: product.category,
        referral_code: referralCode.toUpperCase(),
        personalization_name: personalizationName.trim(),
        personalization_charge: pricing.personalizationCharge,
        final_total: pricing.total,
        payment_method: paymentMethod === 'ONLINE' ? 'Online Payment' : 'Partial COD',
        razorpay_payment_id: details.payment_id,
        paid_amount: details.paid_amount,
        remaining_amount: details.remaining_amount,
        payment_status: paymentMethod === 'ONLINE' ? 'Paid' : 'Partial COD Confirmed',
        status: paymentMethod === 'ONLINE' ? 'Paid' : 'Partial COD Confirmed',
      };

      saveOrderLocally(orderData);
      insertOrder(orderData).catch(() => {});
      if (scriptUrl) fetch(scriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) }).catch(() => {});

      setPaymentDetails(details);
      setOrderId(tempId);
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Auto-open WhatsApp immediately after payment
      openWhatsApp(details, tempId, paymentMethod);

    } catch (err) {
      setIsSubmitting(false);
      if (err.message === 'DISMISSED') {
        setPaymentError('Payment cancelled. Try again.');
      } else {
        setPaymentError(err.message || 'Payment failed. Please try again.');
      }
    }
  };

  const label = (txt) => (
    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>{txt}</div>
  );

  return (
    <>
      <style>{MODAL_STYLES}</style>
      <div className="lny-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} data-testid="product-modal">
        <div className="lny-box">

          {/* ── HEADER ── */}
          <div className="lny-hdr">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <span style={{ flexShrink: 0, padding: '3px 9px', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '10px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {CATEGORY_LABELS[product.category] || 'Streetwear'}
              </span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <ShareBtn product={product} />
              <button onClick={onClose} data-testid="modal-close-btn"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="lny-body">

            {/* LEFT — Images */}
            <div className="lny-left">
              <div className="lny-img-wrap">
                {images.length > 0 ? (
                  <img src={images[imgIdx]} alt={`${product.title} ${imgIdx + 1}`} data-testid="modal-main-image"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.06)', flexDirection: 'column', gap: 12 }}>
                    <ShoppingBag size={52} />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button className="lny-nav-btn prev" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} data-testid="prev-image-btn"><ChevronLeft size={15} /></button>
                    <button className="lny-nav-btn next" onClick={() => setImgIdx(i => (i + 1) % images.length)} data-testid="next-image-btn"><ChevronRight size={15} /></button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="lny-thumbs">
                  {images.map((img, i) => (
                    <div key={i} className={`lny-thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} data-testid={`thumbnail-${i}`}>
                      <img src={img} alt={`thumb ${i + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              )}

              {relatedProducts && relatedProducts.length > 0 && (
                <div className="lny-related">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#2563eb', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Also Like</span>
                    <a href="#products" onClick={onClose} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>See All →</a>
                  </div>
                  <div className="lny-rel-grid">
                    {relatedProducts.slice(0, 4).map((rp) => (
                      <div key={rp.id} className="lny-rel-card" data-testid={`related-product-${rp.id}`}>
                        {rp.image1 && <img src={rp.image1} alt={rp.title} onError={(e) => { e.target.style.display = 'none'; }} />}
                        <div style={{ padding: '5px 7px' }}>
                          <div style={{ fontSize: '10px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{rp.title}</div>
                          <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>₹{rp.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Form */}
            <div ref={rightRef} className="lny-right">
              {isSubmitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', textAlign: 'center', padding: '20px 12px' }} data-testid="order-success">
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '2px solid #25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', animation: 'pulseGlow 2s ease-in-out infinite' }}>
                    <CheckCircle size={28} color="#25d366" />
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '20px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>
                    {paymentDetails?.method === 'ONLINE' ? 'Payment Done!' : 'Order Confirmed!'}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.7, marginBottom: '16px', maxWidth: '290px' }}>
                    {paymentDetails?.method === 'ONLINE'
                      ? 'Payment verified! WhatsApp confirmation has been sent automatically.'
                      : `₹${paymentDetails?.remaining_amount} remaining on delivery. WhatsApp confirmation sent.`}
                  </p>
                  {paymentDetails && (
                    <div style={{ padding: '12px 14px', background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.15)', marginBottom: '12px', width: '100%', maxWidth: '290px', textAlign: 'left' }}>
                      {[
                        { label: 'Razorpay ID', val: paymentDetails.payment_id, color: '#4ade80' },
                        { label: 'Paid Now', val: `₹${paymentDetails.paid_amount}`, color: '#4ade80' },
                        ...(paymentDetails.remaining_amount > 0 ? [{ label: 'Pay on Delivery', val: `₹${paymentDetails.remaining_amount}`, color: '#fbbf24' }] : []),
                      ].map(({ label: l, val, color }) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif' }}>{l}</span>
                          <span style={{ fontSize: '11px', color, fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {orderId && (
                    <div data-testid="order-id-display" style={{ padding: '10px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', marginBottom: '18px', width: '100%', maxWidth: '290px', textAlign: 'left' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Order ID</div>
                      <div style={{ color: '#93c5fd', fontWeight: 800, fontSize: '14px', fontFamily: "'Outfit', sans-serif" }} data-testid="order-id">{orderId}</div>
                    </div>
                  )}
                  <button className="whatsapp-btn" onClick={() => openWhatsApp()} data-testid="whatsapp-confirm-btn" style={{ width: '100%', maxWidth: '290px', marginBottom: '10px' }}>
                    <MessageCircle size={14} /> Resend WhatsApp
                  </button>
                  <button onClick={onClose} className="btn-secondary" style={{ width: '100%', maxWidth: '290px', justifyContent: 'center', marginBottom: '8px' }}>Continue Shopping</button>
                  <Link to="/orders" onClick={onClose} data-testid="view-my-orders-link"
                    style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#93c5fd')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                    View My Orders →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Price */}
                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '28px', letterSpacing: '-0.03em', color: '#fff' }}>₹{product.price}</span>
                    <span style={{ marginLeft: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>+₹50 delivery</span>
                  </div>

                  {product.caption && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.7, marginBottom: '14px' }}>{product.caption}</p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {features.map((f) => <span key={f} className="feature-pill">{f}</span>)}
                  </div>

                  {/* Size */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: sizeError ? '#f87171' : 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                      Select Size {sizeError && '— Please choose'}
                    </div>
                    <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                      {SIZES.map((s) => (
                        <button key={s} type="button" className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                          onClick={() => { setSelectedSize(s); setSizeError(false); }} data-testid={`size-btn-${s}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {[{ icon: <Shield size={11} />, label: 'Secure Payment' }, { icon: <Package size={11} />, label: 'Premium Quality' }, { icon: <Clock size={11} />, label: '4–6 Days' }].map((b) => (
                      <div key={b.label} className="trust-badge">{b.icon}{b.label}</div>
                    ))}
                  </div>

                  {product.category === 'iit' && (
                    <div data-testid="iit-personalization-section" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.25)', padding: '12px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#93c5fd', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        <Sparkles size={11} /> Personalized Name (+₹40)
                      </label>
                      <input className="input-field" value={personalizationName} onChange={(e) => setPersonalizationName(e.target.value)} placeholder="Name to print (optional)" data-testid="input-personalization" />
                      {personalizationName.trim() && (
                        <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '11px', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle size={11} /> "{personalizationName}" — +₹40
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '18px' }} />
                  <div className="section-label" style={{ marginBottom: '12px' }}>Order Details</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '9px' }}>
                    <div>{label('Full Name *')}<input className="input-field" name="name" value={form.name} onChange={handleFormChange} placeholder="Your name" required data-testid="input-name" /></div>
                    <div>{label('Phone *')}<input className="input-field" name="phone" value={form.phone} onChange={handleFormChange} placeholder="10-digit" required data-testid="input-phone" /></div>
                  </div>
                  <div style={{ marginBottom: '9px' }}>{label('Email *')}<input className="input-field" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="your@email.com" required data-testid="input-email" /></div>
                  <div style={{ marginBottom: '9px' }}>{label('Address *')}<input className="input-field" name="address" value={form.address} onChange={handleFormChange} placeholder="Street, house no." required data-testid="input-address" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '9px' }}>
                    <div>{label('City *')}<input className="input-field" name="city" value={form.city} onChange={handleFormChange} placeholder="City" required data-testid="input-city" /></div>
                    <div>{label('State *')}<input className="input-field" name="state" value={form.state} onChange={handleFormChange} placeholder="State" required data-testid="input-state" /></div>
                    <div>{label('Pincode *')}<input className="input-field" name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="Pincode" required data-testid="input-pincode" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '18px' }}>
                    <div>{label('Quantity')}<input className="input-field" name="quantity" type="number" min="1" max="10" value={form.quantity} onChange={handleFormChange} data-testid="input-quantity" /></div>
                    <div>{label('College / Design')}<input className="input-field" name="college_name" value={form.college_name} onChange={handleFormChange} placeholder="Optional" data-testid="input-college" /></div>
                  </div>

                  {/* Referral */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={10} /> Referral Code (25% off)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="input-field" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="e.g. HARSH20" style={{ flex: 1 }} data-testid="input-referral" />
                      {pricing.isValid && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '12px', whiteSpace: 'nowrap', padding: '0 6px' }}><CheckCircle size={12} /> Valid!</div>}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', marginBottom: '16px' }} data-testid="pricing-summary">
                    <div className="section-label" style={{ marginBottom: '8px' }}>Price Breakdown</div>
                    <div className="pricing-row"><span>Price (₹{pricing.basePrice} × {pricing.quantity})</span><span>₹{pricing.productTotal}</span></div>
                    <div className="pricing-row"><span>Delivery</span><span>₹{pricing.delivery}</span></div>
                    {pricing.discount > 0 && <div className="pricing-row discount"><span>Discount</span><span>-₹{pricing.discount}</span></div>}
                    {pricing.personalizationCharge > 0 && <div className="pricing-row" style={{ color: '#93c5fd' }}><span>Personalization</span><span>+₹{pricing.personalizationCharge}</span></div>}
                    <div className="pricing-row total"><span>Total</span><span data-testid="order-total">₹{pricing.total}</span></div>
                    {paymentMethod === 'PARTIAL_COD' && (
                      <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '7px 0' }} />
                        <div className="pricing-row" style={{ color: '#fbbf24' }}><span>Pay Now</span><span>₹{partialCodAmt}</span></div>
                        <div className="pricing-row" style={{ color: 'rgba(255,255,255,0.4)' }}><span>Pay on Delivery</span><span>₹{pricing.total - partialCodAmt}</span></div>
                      </>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div style={{ marginBottom: '16px' }}>
                    <div className="section-label" style={{ marginBottom: '9px' }}>Payment Method</div>
                    <div style={{ display: 'grid', gridTemplateColumns: enableCod ? '1fr 1fr' : '1fr', gap: '8px' }}>
                      <button type="button" onClick={() => setPaymentMethod('ONLINE')} data-testid="payment-online"
                        style={{ padding: '11px 13px', background: paymentMethod === 'ONLINE' ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${paymentMethod === 'ONLINE' ? '#2563eb' : 'rgba(255,255,255,0.08)'}`, color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <CreditCard size={12} color={paymentMethod === 'ONLINE' ? '#2563eb' : 'rgba(255,255,255,0.4)'} />
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: paymentMethod === 'ONLINE' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Online</span>
                          {paymentMethod === 'ONLINE' && <CheckCircle size={11} color="#2563eb" style={{ marginLeft: 'auto' }} />}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>UPI · Cards · Net Banking</div>
                      </button>
                      {enableCod && (
                        <button type="button" onClick={() => setPaymentMethod('PARTIAL_COD')} data-testid="payment-partial-cod"
                          style={{ padding: '11px 13px', background: paymentMethod === 'PARTIAL_COD' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${paymentMethod === 'PARTIAL_COD' ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`, color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <Truck size={12} color={paymentMethod === 'PARTIAL_COD' ? '#fbbf24' : 'rgba(255,255,255,0.4)'} />
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: paymentMethod === 'PARTIAL_COD' ? '#fbbf24' : 'rgba(255,255,255,0.6)' }}>Partial COD</span>
                            {paymentMethod === 'PARTIAL_COD' && <CheckCircle size={11} color="#fbbf24" style={{ marginLeft: 'auto' }} />}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>₹{partialCodAmt} now + rest COD</div>
                        </button>
                      )}
                    </div>
                    {paymentMethod === 'PARTIAL_COD' && (
                      <div style={{ marginTop: '8px', padding: '9px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.5 }}>
                        Pay ₹{partialCodAmt} now. Remaining ₹{pricing.total - partialCodAmt} collected on delivery.
                      </div>
                    )}
                  </div>

                  {paymentError && (
                    <div style={{ marginBottom: '12px', padding: '9px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '12px', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.5 }} data-testid="payment-error">
                      <AlertCircle size={13} style={{ flexShrink: 0 }} /> {paymentError}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', fontSize: '13px', padding: '14px' }} disabled={isSubmitting} data-testid="submit-order-btn">
                    {isSubmitting ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                    ) : (
                      <><Zap size={13} /> {paymentMethod === 'ONLINE' ? `Pay ₹${pricing.total} Online` : `Pay ₹${partialCodAmt} Advance`}</>
                    )}
                  </button>
                  <button type="button" className="whatsapp-btn" onClick={() => openWhatsApp(null, null, paymentMethod)} data-testid="whatsapp-order-btn">
                    <MessageCircle size={14} /> Order via WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
