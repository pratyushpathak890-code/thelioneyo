# THE LIONEYO — PRD (Updated)

## Problem Statement
Production-ready premium clothing brand e-commerce website with Supabase, Google Sheets orders, WhatsApp, UPI/COD, admin panel, and customer dashboard.

## Architecture
- **Frontend**: React (CRA + Craco) + Tailwind + Supabase JS
- **Backend**: None (bypassed for Vercel free tier)
- **Database**: Supabase — tables: `products`, `site_settings`, `orders`
- **Orders**: Google Apps Script webhook + Supabase `orders` table
- **Payments**: UPI + COD
- **Admin Auth**: Frontend `.env` check only

## Routes
- `/` — Storefront
- `/orders` — Customer Order Dashboard (localStorage)
- `/admin` — Admin Panel (Products + Orders + Settings)

## Admin Credentials
- Email: admin@thelioneyo.com
- Password: Lioneyo@123

## Supabase Tables
- `products`: id, title, caption, price, category (streetwear/mens/womens/iit), image1-3, features, is_active, created_at
- `site_settings`: id, hero_heading, hero_subtext, hero_image, whatsapp_number, upi_id, google_script_url, instagram_url, qr_image_url, updated_at
- `orders`: id, full_name, phone, email, address, city, state, pincode, quantity, product_title, product_image, price, size, category, referral_code, personalization_name, personalization_charge, final_total, payment_method, status, college_design_name, created_at

## Pricing Logic
- Delivery: ₹50 flat
- Personalization (IIT only): +₹40
- Referral codes: SHIVAM25, PRATYUSH25, NITIKA25 → 25% off; HARSH20 → 25% off
- Final = base + 50 + personalizationCharge - discount

## What's Implemented (All Sessions)

### Session 1 — MVP
- Dark luxury UI, hero, product cards, product modal, admin panel, footer

### Session 2 — Production
- Supabase integration, site_settings, Google Script webhook, Admin auth refactor, vercel.json

### Session 3 (2026-04)
- [x] Emergent branding removed from index.html
- [x] Page title: "THE LIONEYO | Premium Streetwear"
- [x] SEO meta tags
- [x] "New Collection 2026"
- [x] Mens/Womens categories (admin + storefront)
- [x] Animated Category Filter Tabs with count badges
- [x] IIT Personalization field (+₹40)
- [x] Order Dashboard (/orders) — localStorage based
- [x] My Orders count badge in Navbar
- [x] Mobile modal layout fix

### Session 4 (2026-04)
- [x] Modal image: object-position top center (face visible)
- [x] Related products: 2 items inside left panel + More button (not below form)
- [x] Admin Orders tab with all incoming orders
- [x] "Confirm Email" button in admin → opens Gmail with pre-filled email
- [x] "Mark Delivered" button in admin
- [x] Orders saved to Supabase + localStorage + Google Sheets
- [x] Vercel build passing (148KB gzipped)
- [x] vercel.json updated with buildCommand, outputDirectory
- [x] .env.example created for Vercel deployment
- [x] VERCEL_DEPLOY.md deployment guide

## Environment Variables (Vercel)
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_WHATSAPP_NUMBER
- REACT_APP_GOOGLE_SCRIPT_URL
- REACT_APP_UPI_ID
- REACT_APP_ADMIN_EMAIL
- REACT_APP_ADMIN_PASSWORD

## Pending User Actions
1. Create `orders` table in Supabase (SQL in VERCEL_DEPLOY.md)
2. Connect GitHub → Vercel (Root Dir: `frontend`)
3. Set env variables in Vercel dashboard
4. Add Mens/Womens/IIT products via Admin panel

## Future Backlog
- Product search bar
- Email notifications (SendGrid/Resend)
- Size availability per product
- Customer reviews
- Instagram feed
- Analytics dashboard
