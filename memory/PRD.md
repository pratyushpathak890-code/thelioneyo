# THE LIONEYO — Product Requirements Document

## Problem Statement
Build a complete production-ready premium clothing brand website called "THE LIONEYO" — a luxury streetwear e-commerce brand with dynamic product management, hero section management, Google Sheets order system, WhatsApp integration, UPI/COD payment, and an admin panel.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Supabase JS client
- **Backend**: FastAPI (Python) — bypassed for Vercel free deployment
- **Database**: Supabase (PostgreSQL) — products, site_settings tables
- **Storage**: Supabase Storage — product-images, site-images buckets
- **Orders**: Google Apps Script webhook (POST) + localStorage (customer dashboard)
- **Payments**: UPI + COD (no Razorpay)
- **Admin Auth**: Pure frontend `.env` check (no backend)

## Key DB Schema
- `products`: id, title, caption, price, category, image1, image2, image3, features, is_active, created_at
  - Categories: `streetwear`, `mens`, `womens`, `iit`
- `site_settings`: id, hero_heading, hero_subtext, hero_image, whatsapp_number, upi_id, google_script_url, instagram_url, qr_image_url, updated_at

## Admin Credentials
- Email: admin@thelioneyo.com
- Password: Lioneyo@123
- Auth: Frontend-only `.env` check

## Environment Variables
- REACT_APP_SUPABASE_URL (required for dynamic content)
- REACT_APP_SUPABASE_ANON_KEY (required for dynamic content)
- REACT_APP_BACKEND_URL (pre-configured)
- REACT_APP_WHATSAPP_NUMBER (fallback: 9557843135)
- REACT_APP_GOOGLE_SCRIPT_URL (fallback for orders)
- REACT_APP_UPI_ID (fallback)
- REACT_APP_ADMIN_EMAIL / REACT_APP_ADMIN_PASSWORD

## What's Been Implemented

### Session 1 — Initial Build (MVP)
- Cinematic hero, storefront, product cards, product modal, admin panel, footer

### Session 2 — Production Fixes (2025-02)
- [x] Supabase live integration
- [x] site_settings table with instagram_url
- [x] Google Script URL and WhatsApp fallback config
- [x] Product CRUD, Supabase Storage image upload
- [x] Admin Panel refactored to frontend-only auth (Vercel-ready)
- [x] vercel.json added for SPA routing

### Session 3 — Features & Fixes (2026-04)
- [x] Emergent branding REMOVED from index.html (badge, tracking, PostHog)
- [x] Page title updated: "THE LIONEYO | Premium Streetwear"
- [x] SEO meta tags added (og:title, og:description, keywords)
- [x] "New Collection 2025" → "New Collection 2026" in Hero
- [x] Mens & Womens categories added to Admin ProductForm + Storefront
- [x] Animated Category Filter Tabs (All Drops / Streetwear / Men's / Women's / IIT)
  - Only shows tabs for categories that have active products
  - Count badges per category, animated active state
- [x] IIT Personalization: text input field for custom name printed on tee (+₹40 auto-added to total)
  - Live preview: shows "Preview: [name] — +₹40 added"
  - Included in order webhook payload and localStorage
- [x] localStorage Order Dashboard (/orders route)
  - Orders saved after checkout with order ID (LNY-XXXX format)
  - Customer can view all past orders on their device
  - Copy Order ID button per order
  - Order status: Processing / Shipped / Delivered
- [x] My Orders count badge in Navbar (ShoppingBag icon + blue dot)
- [x] Mobile Modal Layout Fix
  - Image stacks on top (260px height) on mobile
  - Form panel scrolls below as part of full modal scroll
  - Related products hidden on mobile
- [x] Related Products section compact on desktop (max 168px height)
- [x] Success screen shows Order ID with "Save for tracking" tip + "View My Orders →" link

## Pricing Logic
- Delivery: ₹50 flat
- Personalization (IIT only): +₹40
- Referral codes: SHIVAM25, PRATYUSH25, NITIKA25 → 25% off base price; HARSH20 → 25% off
- Final = base + 50 + personalizationCharge - discount

## Routes
- `/` — Storefront
- `/orders` — Customer Order Dashboard (localStorage)
- `/admin` — Admin Panel

## P0 Backlog (Pending User Action)
- Configure Supabase credentials in .env
- Create DB tables (see SUPABASE_SETUP.md)
- Add products via admin panel (especially Mens/Womens/IIT categories)
- Configure site settings (hero image, WhatsApp, UPI, Google Script)

## P1 Features (Future)
- Product search bar
- WhatsApp order status updates
- Email notifications via SendGrid
- Inventory/size availability per product
- Customer reviews
- Instagram feed integration
- Analytics dashboard
