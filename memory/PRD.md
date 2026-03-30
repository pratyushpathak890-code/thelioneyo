# THE LIONEYO — Product Requirements Document

## Problem Statement
Build a complete production-ready premium clothing brand website called "THE LIONEYO" - a luxury streetwear e-commerce brand with dynamic product management, hero section management, Google Sheets order system, WhatsApp integration, UPI/COD payment, and an admin panel.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Supabase JS client
- **Backend**: FastAPI (Python) — Admin JWT auth only
- **Database**: Supabase (PostgreSQL) — products, site_settings tables
- **Storage**: Supabase Storage — product-images, site-images buckets
- **Orders**: Google Apps Script webhook (POST)
- **Payments**: UPI + COD (no Razorpay)

## What's Been Implemented (2025-02-xx)

### Storefront
- [x] Premium dark hero section with "IGNITE YOUR STYLE" heading (backend-driven)
- [x] Animated hero section with fallback image from design guidelines
- [x] Glassmorphism navbar with "THE LIONEYO" brand
- [x] Mobile-responsive navigation with hamburger menu
- [x] Products grid grouped by category (Streetwear / IIT)
- [x] Premium product cards with hover glow effects
- [x] Empty state when Supabase not configured
- [x] Footer with social links, brand info, contact

### Product Modal
- [x] Image gallery with left/right navigation and thumbnail strip
- [x] Feature pills (parsed from DB or defaults: 200 GSM, Bio Wash, etc.)
- [x] Size selector (XS, S, M, L, XL, XXL)
- [x] Complete order form (name, phone, email, address, city, state, pincode, quantity, college, referral)
- [x] Pricing summary (MRP, Delivery, Referral Discount, Total)
- [x] UPI payment with QR image + UPI ID (from site_settings)
- [x] COD with ₹100 advance message
- [x] Trust badges (Secure Order, Premium Quality, 4–6 Days)
- [x] Google Sheets webhook order submission
- [x] WhatsApp order button with pre-filled message
- [x] Success screen with confirmation
- [x] Related products horizontal scroll

### Admin Panel (/admin)
- [x] Protected login (FastAPI JWT — admin@thelioneyo.com / Lioneyo@123)
- [x] Dashboard with sidebar navigation
- [x] Products tab: list all products with edit/delete/toggle active
- [x] Add/Edit product form with Supabase Storage image upload
- [x] Site Settings tab: hero heading/subtext/image, WhatsApp, UPI, Google Script URL, QR image
- [x] Logout

### Pricing Logic
- Delivery: ₹50 flat
- Referral codes: SHIVAM25, PRATYUSH25, NITIKA25 → 25% off base price
- Final = base + 50 - discount

## Supabase Setup Required
See /app/SUPABASE_SETUP.md for complete SQL setup instructions

## Admin Credentials
- Email: admin@thelioneyo.com
- Password: Lioneyo@123

## Environment Variables
- REACT_APP_SUPABASE_URL (required for dynamic content)
- REACT_APP_SUPABASE_ANON_KEY (required for dynamic content)
- REACT_APP_BACKEND_URL (pre-configured)
- REACT_APP_WHATSAPP_NUMBER (fallback: 9557843135)
- REACT_APP_GOOGLE_SCRIPT_URL (fallback for orders)
- REACT_APP_UPI_ID (fallback)

## P0 Backlog (Pending User Action)
- Configure Supabase credentials in .env
- Create database tables (see SUPABASE_SETUP.md)
- Create storage buckets (product-images, site-images)
- Add products via admin panel
- Configure site settings (hero image, WhatsApp, UPI, Google Script)

## P1 Features (Future Enhancements)
- Product search/filter
- Order history tracking
- Email notifications
- Inventory management
- Size availability per product
- Customer reviews
- Instagram feed integration
- Analytics dashboard
