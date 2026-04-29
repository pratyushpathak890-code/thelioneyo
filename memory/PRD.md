# THE LIONEYO — PRD (Updated Feb 2026)

## Original Problem Statement
Build a complete production-ready premium clothing brand website called "THE LIONEYO" using React + CRA. The app uses Supabase for product/settings management, a Google Apps Script webhook for order submissions, and WhatsApp for order communication.

## Product Goals
- Premium dark luxury streetwear storefront
- Dynamic products from Supabase, categorized filtering
- Secure payment via Razorpay (full + partial COD)
- WhatsApp auto-confirmation after payment
- Shareable product links (/product/:slug)
- Zero-cost Vercel hosting with serverless functions for Razorpay

## Architecture
```
/app/frontend/
├── api/razorpay/
│   ├── create-order.js    # Vercel serverless — RAZORPAY_KEY_SECRET only here
│   └── verify-payment.js
├── src/
│   ├── components/
│   │   ├── ProductModal.jsx     ← Complete overhaul: Razorpay + layout fix
│   │   ├── ProductCard.jsx      ← Share button + category labels
│   │   ├── ProductGrid.jsx
│   │   ├── admin/
│   │   │   ├── ProductForm.jsx     ← slug field added
│   │   │   ├── SiteSettingsForm.jsx ← partial_cod_amount + cod_enabled
│   │   │   └── AdminDashboard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── OrdersPage.jsx
│   │   └── ProductDetailPage.jsx  ← /product/:slug deep link page
│   ├── lib/
│   │   ├── supabase.js    ← auto-slug generation from title
│   │   └── slugify.js
│   └── App.js             ← /product/:slug route added
├── vercel.json            ← routes: api/* → serverless, /* → index.html
└── .env                   ← REACT_APP_RAZORPAY_KEY_ID added
```

## Key Features Implemented

### ✅ Product Storefront (Complete)
- Dark luxury theme (#080808 background)
- Supabase product grid with Mens/Womens/IIT/Streetwear filters
- ProductCard with share button + correct category labels
- Auto-generated slugs from title (no DB migration needed)

### ✅ Product Modal (Complete - Feb 2026)
- Fixed layout: max-width 1160px, max-height 90vh, two-column desktop
- LEFT: product images (object-fit: CONTAIN, dark bg), thumbnails, related products
- RIGHT: form, pricing, Razorpay payment selection
- Responsive: single column on mobile (430px+)
- Online Payment + Partial COD buttons
- WhatsApp auto-opens after Razorpay payment

### ✅ Razorpay Integration
- Frontend: REACT_APP_RAZORPAY_KEY_ID (test: rzp_test_SjNwkn3HS07NOq)
- Serverless API: /api/razorpay/create-order + /api/razorpay/verify-payment
- RAZORPAY_KEY_SECRET only in Vercel env vars (never in frontend)
- After payment: WhatsApp opens automatically with full order details

### ✅ Deep Linking & Share
- Route: /product/:slug → ProductDetailPage
- Auto-generated slug from title (DB migration optional)
- Share button on ProductCard + ProductModal header
- navigator.share() with clipboard fallback

### ✅ Admin Panel (Complete)
- ProductForm: slug field (auto-generated, editable)
- SiteSettingsForm: partial_cod_amount (default 150) + cod_enabled toggle
- Orders tab with mailto confirmation

### ✅ Other
- OrdersPage (customer order history from localStorage)
- IIT Personalization (+₹40) in checkout
- Referral codes (SHIVAM25, PRATYUSH25, NITIKA25, HARSH20 = 25% off)

## Supabase DB Schema

### products table
```sql
id, title, slug (TEXT UNIQUE), price, category, caption,
image1, image2, image3, features (TEXT/JSON),
is_active (BOOL), created_at
```
Note: slug column may not exist yet — auto-generated from title as fallback

### site_settings table
```sql
id, hero_heading, hero_subtext, hero_image,
whatsapp_number, upi_id, google_script_url, qr_image_url, instagram_url,
partial_cod_amount (INT DEFAULT 150), cod_enabled (BOOL DEFAULT TRUE),
updated_at
```

## Vercel Deployment
Environment variables needed in Vercel dashboard:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_WHATSAPP_NUMBER
- REACT_APP_GOOGLE_SCRIPT_URL
- REACT_APP_RAZORPAY_KEY_ID
- RAZORPAY_KEY_ID (for serverless)
- RAZORPAY_KEY_SECRET (for serverless — NEVER in frontend)

## Backlog / Future Tasks
- P1: Add slug column to Supabase DB: `ALTER TABLE products ADD COLUMN slug TEXT UNIQUE;`
- P1: Add COD settings to Supabase: `ALTER TABLE site_settings ADD COLUMN partial_cod_amount INTEGER DEFAULT 150; ALTER TABLE site_settings ADD COLUMN cod_enabled BOOLEAN DEFAULT TRUE;`
- P2: Customer reviews section
- P2: Instagram feed integration
- P2: Analytics dashboard
- P3: Stock/inventory management in admin
