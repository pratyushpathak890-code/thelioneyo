import React, { useState, useEffect } from 'react';
import {
  Package,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  ShoppingBag,
  Zap,
  Mail,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  fetchAllProducts,
  deleteProduct,
  toggleProductActive,
  isSupabaseConfigured,
  fetchOrders,
  updateOrderStatus,
} from '../../lib/supabase';
import ProductForm from './ProductForm';
import SiteSettingsForm from './SiteSettingsForm';

const ADMIN_EMAIL = 'pratyushpathak085@gmail.com';

function sendConfirmationEmail(order) {
  const subject = encodeURIComponent(`Order Confirmed! | THE LIONEYO — ${order.id}`);
  const body = encodeURIComponent(
`Hi ${order.full_name},

Great news! Your order has been confirmed by THE LIONEYO team.

━━━━━━━━━━━━━━━━━━━━
Order ID: ${order.id}
Product: ${order.product_title}
Size: ${order.size}${order.personalization_name ? `\nPersonalized Name: ${order.personalization_name}` : ''}
Quantity: ${order.quantity || 1}
Total: Rs.${order.final_total}
Payment: ${order.payment_method}
━━━━━━━━━━━━━━━━━━━━

Delivery Address:
${order.address}, ${order.city}, ${order.state} - ${order.pincode}

Expected Delivery: 4-6 working days

Save your Order ID (${order.id}) for tracking.

Thank you for choosing THE LIONEYO!
Stay Bold,
Team THE LIONEYO`
  );
  window.open(`mailto:${order.email}?subject=${subject}&body=${body}`, '_blank');
}

export default function AdminDashboard({ adminEmail, onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchAllProducts();
    setProducts(data);
    setLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setOrdersLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
      showToast('Product deleted');
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleToggle = async (id, current) => {
    try {
      const updated = await toggleProductActive(id, !current);
      setProducts((p) => p.map((x) => (x.id === id ? updated : x)));
      showToast(`Product ${!current ? 'activated' : 'deactivated'}`);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
    showToast('Product saved successfully');
  };

  const handleMarkDelivered = async (id) => {
    const updated = await updateOrderStatus(id, 'Delivered');
    if (updated) {
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: 'Delivered' } : x)));
      showToast('Marked as Delivered');
    }
  };

  const TABS = [
    { id: 'products', label: 'Products', icon: <Package size={16} /> },
    { id: 'orders',   label: 'Orders',   icon: <ShoppingBag size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div
      style={{ background: '#050505', minHeight: '100vh', display: 'flex' }}
      data-testid="admin-dashboard"
    >
      {/* Sidebar */}
      <div
        style={{
          width: '220px',
          flexShrink: 0,
          background: '#080808',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 24px',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                flexShrink: 0,
              }}
            />
            THE LIONEYO
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'Manrope, sans-serif',
              marginTop: '4px',
              marginLeft: '32px',
            }}
          >
            Admin Panel
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className={`admin-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`sidebar-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </div>
          ))}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-sidebar-item"
            style={{ textDecoration: 'none' }}
            data-testid="view-storefront-link"
          >
            <ShoppingBag size={16} />
            View Storefront
          </a>
        </div>

        {/* User + logout */}
        <div style={{ padding: '0 8px 0' }}>
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '16px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Manrope, sans-serif',
                marginBottom: '10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {adminEmail}
            </div>
            <button
              className="admin-sidebar-item"
              onClick={onLogout}
              data-testid="logout-btn"
              style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', color: '#f87171', borderLeft: '2px solid transparent', padding: '8px 0' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Toast */}
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#0a0a0a',
              border: '1px solid rgba(37,99,235,0.4)',
              color: '#93c5fd',
              padding: '12px 24px',
              fontSize: '14px',
              fontFamily: 'Manrope, sans-serif',
              zIndex: 9999,
              animation: 'fadeInUp 0.3s ease-out',
              boxShadow: '0 0 20px rgba(37,99,235,0.2)',
            }}
          >
            {toastMsg}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              color: '#fbbf24',
              padding: '14px 20px',
              fontSize: '13px',
              fontFamily: 'Manrope, sans-serif',
              marginBottom: '28px',
              lineHeight: 1.6,
            }}
            data-testid="supabase-config-notice"
          >
            <strong>Supabase not configured.</strong> Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file to enable product and settings management.
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div data-testid="products-tab">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: '28px',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    color: '#fff',
                    marginBottom: '4px',
                  }}
                >
                  Products
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={loadProducts}
                  className="btn-secondary"
                  style={{ padding: '10px 16px', fontSize: '12px' }}
                  data-testid="refresh-products-btn"
                >
                  <RefreshCw size={13} />
                  Refresh
                </button>
                <button
                  onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '12px' }}
                  data-testid="add-product-btn"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>
            </div>

            {/* Product form modal */}
            {showProductForm && (
              <div
                style={{
                  position: 'fixed', inset: 0, zIndex: 200,
                  background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    width: '100%', maxWidth: '700px', maxHeight: '92vh',
                    background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                    overflowY: 'auto', animation: 'scaleIn 0.3s ease-out',
                  }}
                >
                  <ProductForm
                    product={editingProduct}
                    onSaved={handleProductSaved}
                    onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
                  />
                </div>
              </div>
            )}

            {/* Products table */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
              data-testid="products-table"
            >
              {loading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ width: 32, height: 32, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div style={{ padding: '64px 32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  <Package size={36} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    No products yet
                  </p>
                  <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="btn-primary" style={{ marginTop: '20px', fontSize: '12px', padding: '10px 20px' }}>
                    <Plus size={13} /> Add First Product
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" data-testid="products-list">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Image</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} data-testid={`product-row-${p.id}`}>
                          <td>
                            {p.image1 ? (
                              <img src={p.image1} alt={p.title} style={{ width: 48, height: 48, objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <div style={{ width: 48, height: 48, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingBag size={16} style={{ color: 'rgba(255,255,255,0.15)' }} />
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: 2 }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption}</div>
                          </td>
                          <td>
                            <span style={{ padding: '3px 10px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '11px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                              {p.category === 'iit' ? 'IIT' : p.category === 'mens' ? "Men's" : p.category === 'womens' ? "Women's" : 'Streetwear'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>₹{p.price}</td>
                          <td>
                            <button
                              onClick={() => handleToggle(p.id, p.is_active)}
                              data-testid={`toggle-product-${p.id}`}
                              style={{
                                padding: '4px 12px', fontSize: '11px', fontWeight: 700,
                                fontFamily: "'Outfit', sans-serif", letterSpacing: '0.1em',
                                textTransform: 'uppercase', cursor: 'pointer',
                                border: '1px solid',
                                background: 'transparent',
                                color: p.is_active ? '#4ade80' : 'rgba(255,255,255,0.3)',
                                borderColor: p.is_active ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                transition: 'all 0.2s',
                              }}
                            >
                              {p.is_active ? <><Eye size={11} /> Active</> : <><EyeOff size={11} /> Hidden</>}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                                data-testid={`edit-product-${p.id}`}
                                style={{ padding: '6px 12px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.2)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.1)')}
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                data-testid={`delete-product-${p.id}`}
                                style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div data-testid="settings-tab">
            <div style={{ marginBottom: '32px' }}>
              <h1
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: '28px',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  marginBottom: '4px',
                }}
              >
                Site Settings
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                Manage hero content, WhatsApp, UPI, and Google Script
              </p>
            </div>
            <SiteSettingsForm onSaved={() => showToast('Settings saved!')} />
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div data-testid="orders-tab">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#fff', marginBottom: '4px' }}>
                  Orders
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                  {orders.length} order{orders.length !== 1 ? 's' : ''} received
                </p>
              </div>
              <button onClick={loadOrders} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '12px' }} data-testid="refresh-orders-btn">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {!isSupabaseConfigured && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', padding: '16px 20px', fontSize: '13px', fontFamily: 'Manrope, sans-serif', marginBottom: '24px', lineHeight: 1.7 }}>
                <strong>Supabase not configured.</strong> Orders will not appear here without Supabase. Run this SQL in your Supabase dashboard to create the orders table:
                <pre style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '10px', fontSize: '11px', overflowX: 'auto', color: '#fde68a' }}>{`CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  full_name TEXT, phone TEXT, email TEXT,
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  quantity TEXT, product_title TEXT, product_image TEXT,
  price NUMERIC, size TEXT, category TEXT,
  referral_code TEXT, personalization_name TEXT,
  personalization_charge NUMERIC DEFAULT 0,
  final_total NUMERIC, payment_method TEXT,
  status TEXT DEFAULT 'Processing',
  college_design_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_orders" ON orders USING (true) WITH CHECK (true);`}</pre>
              </div>
            )}

            {ordersLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ width: 32, height: 32, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '64px 32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                <ShoppingBag size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  No orders yet
                </p>
              </div>
            ) : (
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" data-testid="orders-list">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} data-testid={`order-row-${o.id}`}>
                          <td>
                            <span style={{ color: '#93c5fd', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em' }}>{o.id}</span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: 2 }}>{o.full_name}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif' }}>{o.email}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>{o.phone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', textTransform: 'uppercase', maxWidth: 160 }}>{o.product_title}</div>
                            {o.personalization_name && (
                              <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: 2 }}>Name: {o.personalization_name}</div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#fff' }}>{o.size}</td>
                          <td style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>₹{o.final_total}</td>
                          <td>
                            <span style={{ padding: '3px 8px', background: o.payment_method === 'UPI' ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                              {o.payment_method}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>
                            {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 10px',
                              background: o.status === 'Delivered' ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)',
                              border: `1px solid ${o.status === 'Delivered' ? 'rgba(74,222,128,0.3)' : 'rgba(245,158,11,0.3)'}`,
                              color: o.status === 'Delivered' ? '#4ade80' : '#fbbf24',
                              fontSize: '11px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase',
                            }}>
                              {o.status || 'Processing'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => sendConfirmationEmail(o)}
                                data-testid={`confirm-email-${o.id}`}
                                style={{ padding: '5px 10px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37,211,102,0.15)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37,211,102,0.08)')}
                                title={`Send confirmation to ${o.email}`}
                              >
                                <Mail size={11} /> Confirm Email
                              </button>
                              {o.status !== 'Delivered' && (
                                <button
                                  onClick={() => handleMarkDelivered(o.id)}
                                  data-testid={`mark-delivered-${o.id}`}
                                  style={{ padding: '5px 10px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#93c5fd', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.15)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37,99,235,0.08)')}
                                >
                                  <CheckCircle size={11} /> Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
