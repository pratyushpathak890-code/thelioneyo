import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Clock, CheckCircle, Copy, Package } from 'lucide-react';

const STATUS_STYLES = {
  Processing: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  Shipped:    { bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.3)',   text: '#93c5fd' },
  Delivered:  { bg: 'rgba(37,211,102,0.1)',  border: 'rgba(37,211,102,0.3)', text: '#4ade80' },
};

function OrderCard({ order }) {
  const [copied, setCopied] = useState(false);
  const s = STATUS_STYLES[order.status] || STATUS_STYLES.Processing;

  const handleCopy = () => {
    navigator.clipboard?.writeText(order.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      data-testid={`order-card-${order.id}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px',
        marginBottom: '12px',
        transition: 'border-color 0.25s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        {/* Left info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          {/* Order ID row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#93c5fd', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em' }}>
              {order.id}
            </span>
            <button
              onClick={handleCopy}
              title="Copy Order ID"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', padding: '2px' }}
              data-testid={`copy-order-${order.id}`}
            >
              {copied ? <CheckCircle size={12} color="#4ade80" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Product name */}
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '17px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
            {order.product_title}
          </div>

          {/* Details chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {order.size && (
              <span style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Size: {order.size}
              </span>
            )}
            {order.quantity && (
              <span style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Qty: {order.quantity}
              </span>
            )}
            {order.payment_method && (
              <span style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {order.payment_method}
              </span>
            )}
            {order.personalization_name && (
              <span style={{ padding: '3px 10px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Name: {order.personalization_name}
              </span>
            )}
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
            <Clock size={10} /> {formattedDate}
          </div>
        </div>

        {/* Right: amount + status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '24px', color: '#fff', letterSpacing: '-0.02em' }}>
            ₹{order.final_total}
          </div>
          <div style={{ padding: '4px 14px', background: s.bg, border: `1px solid ${s.border}`, color: s.text, fontSize: '11px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
            data-testid={`order-status-${order.id}`}
          >
            {order.status}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('lioneyo_orders') || '[]');
    setOrders(stored);
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh' }}>
      {/* Sticky header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 90 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>THE LIONEYO</span>
        </Link>
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'Manrope, sans-serif', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          data-testid="back-to-shop"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(32px,4vw,64px) clamp(20px,4vw,40px)' }}>
        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Order History</div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 'clamp(28px,5vw,48px)', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>
            My Orders
          </h1>
          <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.7 }}>
            Orders placed on this device are saved here. Delivery in 4–6 working days. For support contact{' '}
            <a href="https://wa.me/9557843135" target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: 700, textDecoration: 'none' }}>WhatsApp</a>.
          </p>
        </div>

        {orders.length === 0 ? (
          <div data-testid="no-orders" style={{ textAlign: 'center', padding: '80px 32px', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Package size={48} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              No Orders Yet
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '28px', lineHeight: 1.6 }}>
              Your placed orders will appear here. Start shopping!
            </p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }} data-testid="shop-now-from-orders">
              <ShoppingBag size={14} /> Shop Now
            </Link>
          </div>
        ) : (
          <div data-testid="orders-list">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </span>
            </div>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
