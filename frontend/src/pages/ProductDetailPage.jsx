import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Shield, Package, Clock, CheckCircle,
  Share2, Copy, MessageCircle, Tag, Sparkles, ChevronLeft,
  ChevronRight, CreditCard, Truck, Zap, X, AlertCircle,
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts, fetchSiteSettings, insertOrder } from '../lib/supabase';

const DELIVERY_CHARGE = 50;
const PERSONALIZATION_CHARGE = 40;
const PARTIAL_COD_DEFAULT = 150;
const VALID_REFERRAL_CODES = ['SHIVAM25', 'PRATYUSH25', 'NITIKA25', 'HARSH20'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function calcPricing(basePrice, qty, referralCode, personalizationName, partialCodAmt) {
  const quantity = Math.max(1, parseInt(qty) || 1);
  const code = (referralCode || '').trim().toUpperCase();
  const isValid = code.length > 0 && VALID_REFERRAL_CODES.includes(code);
  const productTotal = Number(basePrice) * quantity;
  const discount = isValid ? Math.round(productTotal * 0.25) : 0;
  const hasPersonalization = (personalizationName || '').trim().length > 0;
  const personalizationCharge = hasPersonalization ? PERSONALIZATION_CHARGE : 0;
  const total = productTotal + DELIVERY_CHARGE + personalizationCharge - discount;
  const codAdvance = partialCodAmt || PARTIAL_COD_DEFAULT;
  return { basePrice: Number(basePrice), quantity, productTotal, delivery: DELIVERY_CHARGE, discount, personalizationCharge, total, isValid, codAdvance };
}

function saveOrderLocally(orderData) {
  const orders = JSON.parse(localStorage.getItem('lioneyo_orders') || '[]');
  const saved = { ...orderData, date: new Date().toISOString() };
  orders.unshift(saved);
  localStorage.setItem('lioneyo_orders', JSON.stringify(orders.slice(0, 30)));
}

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

const CATEGORY_LABELS = { iit: 'IIT', mens: "Men's", womens: "Women's", streetwear: 'Streetwear' };

function parseFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try { return JSON.parse(features); } catch {}
  return features.split(',').map(f => f.trim()).filter(Boolean);
}
const DEFAULT_FEATURES = ['200 GSM', 'Bio Wash', 'Breathable', 'Premium Print', 'Gen-Z Feel'];

// ─── Share Button ────────────────────────────────────────────────────────────
export function ShareButton({ product, size = 14, label = 'Share', compact = false }) {
  const [copied, setCopied] = useState(false);
  const slug = product?.slug;
  if (!slug) return null;
  const url = `${window.location.origin}/product/${slug}`;

  const handleShare = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text: `Check out ${product.title} on THE LIONEYO`, url });
        return;
      }
    } catch (err) { if (err.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { }
  };

  if (compact) {
    return (
      <button
        onClick={handleShare}
        data-testid={`share-btn-${product.id}`}
        title="Share Product"
        style={{ background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 0 }}
        onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; e.currentTarget.style.color = '#93c5fd'; } }}
        onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
      >
        {copied ? <CheckCircle size={12} /> : <Share2 size={12} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      data-testid={`share-btn-${product.id}`}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: copied ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
    >
      {copied ? <><CheckCircle size={size} /> Copied!</> : <><Share2 size={size} /> {label}</>}
    </button>
  );
}

// ─── Main ProductDetailPage ──────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const rightRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  // Form state
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [referralCode, setReferralCode] = useState('');
  const [personalizationName, setPersonalizationName] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', quantity: '1', college_name: '' });

  // Payment state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [prod, settings] = await Promise.all([fetchProductBySlug(slug), fetchSiteSettings()]);
      if (!prod) { setNotFound(true); setLoading(false); return; }
      setProduct(prod);
      setSiteSettings(settings);
      const allProds = await fetchProducts();
      setRelatedProducts(allProds.filter(p => p.id !== prod.id && p.category === prod.category).slice(0, 4));
      setLoading(false);
    };
    load();
  }, [slug]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (loading) return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading Product...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', padding: '32px' }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '80px', color: 'rgba(255,255,255,0.05)', letterSpacing: '-0.05em' }}>404</div>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.05em' }}>Product Not Found</h2>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif', fontSize: '14px', textAlign: 'center' }}>This product link may be expired or the product is no longer available.</p>
      <Link to="/" style={{ padding: '12px 28px', background: '#2563eb', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={14} /> Back to Shop
      </Link>
    </div>
  );

  const images = [product.image1, product.image2, product.image3].filter(Boolean);
  const features = parseFeatures(product.features).length > 0 ? parseFeatures(product.features) : DEFAULT_FEATURES;
  const partialCodAmt = Number(siteSettings?.partial_cod_amount) || PARTIAL_COD_DEFAULT;
  const enableCod = siteSettings?.enable_cod !== false;
  const pricing = calcPricing(product.price, form.quantity, referralCode, personalizationName, partialCodAmt);
  const waNumber = (siteSettings?.whatsapp_number || '9557843135').replace(/\D/g, '');
  const scriptUrl = siteSettings?.google_script_url || process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';
  const payNow = paymentMethod === 'PARTIAL_COD' ? partialCodAmt : pricing.total;
  const productUrl = `${window.location.origin}/product/${slug}`;

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openWhatsApp = (pdOverride, orderIdOverride, methodOverride) => {
    const pd = pdOverride !== undefined ? pdOverride : paymentDetails;
    const oid = orderIdOverride !== undefined ? orderIdOverride : orderId;
    const meth = methodOverride !== undefined ? methodOverride : paymentMethod;
    const lines = [
      `*Order — THE LIONEYO*`,
      ``,
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
    if (!selectedSize) { setSizeError(true); window.scrollTo({ top: 400, behavior: 'smooth' }); return; }
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
        throw new Error(err.error || 'Payment initialization failed. Try again.');
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
        setPaymentError('Payment was cancelled. Click the button below to try again.');
      } else {
        setPaymentError(err.message || 'Payment failed. Please try again.');
      }
    }
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', clipPath: 'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>THE LIONEYO</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
          {/* Breadcrumb */}
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', display: 'none' }} className="md:inline">
            Shop / {CATEGORY_LABELS[product.category] || product.category} /
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 180 }}>
            {product.title}
          </span>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s', flexShrink: 0, marginLeft: '8px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={13} /> Back
          </Link>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,3vw,48px) clamp(16px,3vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '40px' }} className="product-detail-grid">
          <style>{`
            @media(max-width:768px){
              .product-detail-grid{grid-template-columns:1fr!important}
              .product-detail-sticky{position:static!important}
            }
          `}</style>

          {/* LEFT — Image gallery */}
          <div>
            {/* Main image */}
            <div style={{ position: 'relative', background: '#040404', overflow: 'hidden', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', maxHeight: '65vh' }}>
              {images.length > 0 ? (
                <img src={images[imgIdx]} alt={`${product.title} ${imgIdx + 1}`}
                  style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', objectPosition: 'center', display: 'block', padding: '12px' }}
                  onError={e => e.target.style.display = 'none'}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={64} style={{ color: 'rgba(255,255,255,0.06)' }} />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {/* Category + Share overlay */}
              <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ padding: '4px 10px', background: 'rgba(37,99,235,0.85)', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                <ShareButton product={product} compact size={12} />
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{ flex: '0 0 70px', height: '70px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIdx ? '#2563eb' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img} alt={`thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '4px' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                ))}
              </div>
            )}

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <div className="section-label" style={{ marginBottom: '12px' }}>More from this collection</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                  {relatedProducts.map(rp => (
                    <Link key={rp.id} to={`/product/${rp.slug}`} style={{ textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', transition: 'border-color 0.2s', display: 'block' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      {rp.image1 && <img src={rp.image1} alt={rp.title} style={{ width: '100%', height: '120px', objectFit: 'contain', objectPosition: 'center', background: '#040404', display: 'block', padding: '4px' }} />}
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{rp.title}</div>
                        <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>₹{rp.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Product info + Checkout form */}
          <div className="product-detail-sticky" style={{ position: 'sticky', top: '80px', alignSelf: 'start' }} ref={rightRef}>
            {isSubmitted ? (
              /* SUCCESS STATE */
              <div style={{ padding: '40px 32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }} data-testid="order-success-page">
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '2px solid #25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulseGlow 2s ease-in-out infinite' }}>
                  <CheckCircle size={32} color="#25d366" />
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: '8px' }}>
                  {paymentDetails?.method === 'ONLINE' ? 'Payment Successful!' : 'Order Confirmed!'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.7, marginBottom: '20px' }}>
                  {paymentDetails?.method === 'ONLINE'
                    ? 'Your payment is confirmed. Expected delivery in 4–6 working days.'
                    : `₹${paymentDetails?.remaining_amount} remaining will be collected on delivery.`}
                </p>
                {/* Order ID */}
                <div style={{ padding: '12px 20px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)', marginBottom: '16px', textAlign: 'left' }} data-testid="success-order-id">
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Order ID</div>
                  <div style={{ color: '#93c5fd', fontWeight: 800, fontSize: '16px', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.12em' }}>{orderId}</div>
                </div>
                {/* Payment details */}
                {paymentDetails && (
                  <div style={{ padding: '12px 20px', background: 'rgba(37,211,102,0.04)', border: '1px solid rgba(37,211,102,0.15)', marginBottom: '20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif' }}>Razorpay ID</span>
                      <span style={{ fontSize: '12px', color: '#4ade80', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>{paymentDetails.payment_id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: paymentDetails.remaining_amount > 0 ? '6px' : 0 }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif' }}>Paid Now</span>
                      <span style={{ fontSize: '12px', color: '#4ade80', fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>₹{paymentDetails.paid_amount}</span>
                    </div>
                    {paymentDetails.remaining_amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif' }}>Pay on Delivery</span>
                        <span style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>₹{paymentDetails.remaining_amount}</span>
                      </div>
                    )}
                  </div>
                )}
                <button className="whatsapp-btn" onClick={() => openWhatsApp()} style={{ width: '100%', marginBottom: '10px' }} data-testid="whatsapp-confirm-btn">
                  <MessageCircle size={16} /> Resend WhatsApp
                </button>
                <Link to="/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', transition: 'all 0.2s', marginBottom: '10px' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  View My Orders →
                </Link>
                <Link to="/" style={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', marginTop: '4px' }}>← Continue Shopping</Link>
              </div>
            ) : (
              /* ORDER FORM */
              <form onSubmit={handleSubmit}>
                {/* Product title + share */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(22px,3vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#fff', lineHeight: 1.1, marginBottom: '6px' }}>
                      {product.title}
                    </h1>
                    <span style={{ padding: '3px 10px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '10px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      {CATEGORY_LABELS[product.category] || product.category}
                    </span>
                  </div>
                  <ShareButton product={product} size={13} label="Share" />
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '36px', letterSpacing: '-0.03em', color: '#fff' }}>₹{product.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>+₹50 delivery</span>
                </div>

                {/* Caption */}
                {product.caption && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.7, marginBottom: '16px' }}>{product.caption}</p>}

                {/* Features */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {features.map(f => <span key={f} className="feature-pill">{f}</span>)}
                </div>

                {/* Size selector */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: sizeError ? '#f87171' : 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                    Select Size {sizeError && '— Please choose'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {SIZES.map(s => (
                      <button key={s} type="button" className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => { setSelectedSize(s); setSizeError(false); }} data-testid={`size-${s}`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {[{ icon: <Shield size={12} />, label: 'Secure Payment' }, { icon: <Package size={12} />, label: 'Premium Quality' }, { icon: <Clock size={12} />, label: '4–6 Days Delivery' }].map(b => (
                    <div key={b.label} className="trust-badge">{b.icon} {b.label}</div>
                  ))}
                </div>

                {/* IIT personalization */}
                {product.category === 'iit' && (
                  <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.25)', padding: '16px', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#93c5fd', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      <Sparkles size={12} /> Personalized Name on Tee (+₹40)
                    </label>
                    <input className="input-field" value={personalizationName} onChange={e => setPersonalizationName(e.target.value)} placeholder="Enter name to print (optional)" data-testid="personalization-input" />
                    {personalizationName.trim() && (
                      <div style={{ marginTop: '8px', padding: '7px 12px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: '#93c5fd', fontSize: '12px', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={12} /> "{personalizationName}" — +₹40 added
                      </div>
                    )}
                  </div>
                )}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '24px' }} />
                <div className="section-label" style={{ marginBottom: '16px' }}>Order Details</div>

                {/* Order form */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name *</label><input className="input-field" name="name" value={form.name} onChange={handleFormChange} placeholder="Your name" required data-testid="name-input" /></div>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Phone *</label><input className="input-field" name="phone" value={form.phone} onChange={handleFormChange} placeholder="10-digit number" required data-testid="phone-input" /></div>
                </div>
                <div style={{ marginBottom: '10px' }}><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Email *</label><input className="input-field" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="your@email.com" required data-testid="email-input" /></div>
                <div style={{ marginBottom: '10px' }}><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Address *</label><input className="input-field" name="address" value={form.address} onChange={handleFormChange} placeholder="Street address, house no." required data-testid="address-input" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>City *</label><input className="input-field" name="city" value={form.city} onChange={handleFormChange} placeholder="City" required data-testid="city-input" /></div>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>State *</label><input className="input-field" name="state" value={form.state} onChange={handleFormChange} placeholder="State" required data-testid="state-input" /></div>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Pincode *</label><input className="input-field" name="pincode" value={form.pincode} onChange={handleFormChange} placeholder="Pincode" required data-testid="pincode-input" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Quantity</label><input className="input-field" name="quantity" type="number" min="1" max="10" value={form.quantity} onChange={handleFormChange} data-testid="qty-input" /></div>
                  <div><label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>College / Design Name</label><input className="input-field" name="college_name" value={form.college_name} onChange={handleFormChange} placeholder="Optional" data-testid="college-input" /></div>
                </div>

                {/* Referral code */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <Tag size={10} style={{ display: 'inline', marginRight: 4 }} /> Referral Code (25% off)
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input className="input-field" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="Enter promo code" style={{ flex: 1 }} data-testid="referral-input" />
                    {pricing.isValid && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}><CheckCircle size={14} /> Valid!</div>}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', marginBottom: '20px' }} data-testid="pricing-summary">
                  <div className="section-label" style={{ marginBottom: '12px' }}>Price Breakdown</div>
                  <div className="pricing-row"><span>Price (₹{pricing.basePrice} × {pricing.quantity})</span><span>₹{pricing.productTotal}</span></div>
                  <div className="pricing-row"><span>Delivery</span><span>₹{pricing.delivery}</span></div>
                  {pricing.discount > 0 && <div className="pricing-row discount"><span>Referral Discount</span><span>-₹{pricing.discount}</span></div>}
                  {pricing.personalizationCharge > 0 && <div className="pricing-row" style={{ color: '#93c5fd' }}><span>Personalization</span><span>+₹{pricing.personalizationCharge}</span></div>}
                  <div className="pricing-row total"><span>Total</span><span data-testid="total-amount">₹{pricing.total}</span></div>
                  {paymentMethod === 'PARTIAL_COD' && (
                    <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                      <div className="pricing-row" style={{ color: '#fbbf24' }}><span>Pay Now (Advance)</span><span>₹{partialCodAmt}</span></div>
                      <div className="pricing-row" style={{ color: 'rgba(255,255,255,0.4)' }}><span>Pay on Delivery</span><span>₹{pricing.total - partialCodAmt}</span></div>
                    </>
                  )}
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: '20px' }}>
                  <div className="section-label" style={{ marginBottom: '12px' }}>Payment Method</div>
                  <div style={{ display: 'grid', gridTemplateColumns: enableCod ? '1fr 1fr' : '1fr', gap: '10px' }}>
                    {/* Online */}
                    <button type="button" onClick={() => setPaymentMethod('ONLINE')} data-testid="pay-online-btn"
                      style={{ padding: '14px 16px', background: paymentMethod === 'ONLINE' ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${paymentMethod === 'ONLINE' ? '#2563eb' : 'rgba(255,255,255,0.08)'}`, color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: paymentMethod === 'ONLINE' ? '0 0 20px rgba(37,99,235,0.15)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <CreditCard size={14} color={paymentMethod === 'ONLINE' ? '#2563eb' : 'rgba(255,255,255,0.4)'} />
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: paymentMethod === 'ONLINE' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Online</span>
                        {paymentMethod === 'ONLINE' && <CheckCircle size={12} color="#2563eb" style={{ marginLeft: 'auto' }} />}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>UPI · Cards · Net Banking</div>
                    </button>
                    {/* Partial COD */}
                    {enableCod && (
                      <button type="button" onClick={() => setPaymentMethod('PARTIAL_COD')} data-testid="pay-partial-cod-btn"
                        style={{ padding: '14px 16px', background: paymentMethod === 'PARTIAL_COD' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${paymentMethod === 'PARTIAL_COD' ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`, color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Truck size={14} color={paymentMethod === 'PARTIAL_COD' ? '#fbbf24' : 'rgba(255,255,255,0.4)'} />
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: paymentMethod === 'PARTIAL_COD' ? '#fbbf24' : 'rgba(255,255,255,0.6)' }}>Partial COD</span>
                          {paymentMethod === 'PARTIAL_COD' && <CheckCircle size={12} color="#fbbf24" style={{ marginLeft: 'auto' }} />}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>₹{partialCodAmt} advance + rest COD</div>
                      </button>
                    )}
                  </div>

                  {paymentMethod === 'PARTIAL_COD' && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}>
                      <strong>Partial COD:</strong> Pay ₹{partialCodAmt} now to confirm. Remaining ₹{pricing.total - partialCodAmt} on delivery.
                    </div>
                  )}
                </div>

                {/* Payment error */}
                {paymentError && (
                  <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '13px', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.5 }} data-testid="payment-error">
                    <AlertCircle size={14} style={{ flexShrink: 0 }} /> {paymentError}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px', fontSize: '14px', padding: '16px', position: 'relative' }}
                  disabled={isSubmitting} data-testid="submit-btn"
                >
                  {isSubmitting ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing Payment...</>
                  ) : (
                    <><Zap size={15} /> {paymentMethod === 'ONLINE' ? `Pay ₹${pricing.total} Online` : `Pay ₹${partialCodAmt} Advance`}</>
                  )}
                </button>
                <button type="button" className="whatsapp-btn" onClick={openWhatsApp} data-testid="whatsapp-btn">
                  <MessageCircle size={15} /> Order via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
