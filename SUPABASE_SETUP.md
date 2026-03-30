# THE LIONEYO — Supabase Setup Guide

## Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API

## Step 2: Create Tables

Run this SQL in Supabase → SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'streetwear',
  image1 TEXT,
  image2 TEXT,
  image3 TEXT,
  features TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_heading TEXT DEFAULT 'IGNITE YOUR STYLE',
  hero_subtext TEXT DEFAULT 'Premium streetwear engineered for the bold generation.',
  hero_image TEXT,
  whatsapp_number TEXT DEFAULT '9557843135',
  upi_id TEXT,
  google_script_url TEXT,
  qr_image_url TEXT,
  instagram_url TEXT DEFAULT 'https://www.instagram.com/thelioneyotshirts/',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings row
INSERT INTO site_settings (hero_heading, hero_subtext, whatsapp_number, instagram_url)
VALUES (
  'IGNITE YOUR STYLE',
  'Premium streetwear engineered for the bold generation. Limited drops. Unlimited attitude.',
  '9557843135',
  'https://www.instagram.com/thelioneyotshirts/'
);
```

## Step 3: Create Storage Buckets

In Supabase → Storage, create these public buckets:

1. **product-images** — for product photos (set to Public)
2. **site-images** — for hero image, QR codes (set to Public)

To make them public:
- Click on the bucket → Settings → Toggle "Public bucket" ON

OR run this SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

## Step 4: Set RLS Policies (Optional but Recommended)

For basic public read + unrestricted write (simple setup):
```sql
-- Allow public read on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Allow public read on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
```

For storage:
```sql
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public read site images" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

CREATE POLICY "Admin upload site images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');
```

## Step 5: Add Environment Variables

Update `/app/frontend/.env`:
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart the frontend:
```bash
sudo supervisorctl restart frontend
```

## Step 6: (Optional) Configure Google Apps Script

1. In Google Sheets, go to Extensions → Apps Script
2. Paste your webhook handler (receives POST JSON)
3. Deploy as Web App (Anyone can access)
4. Copy the deployment URL
5. Paste it in Admin Panel → Site Settings → Google Script URL

## Referral Codes
The following referral codes give **25% discount** on base product price:
- `SHIVAM25`
- `PRATYUSH25`
- `NITIKA25`

## Admin Panel
Access at: `/admin`
Default credentials:
- Email: `admin@thelioneyo.com`
- Password: `Lioneyo@123`

To change credentials, update in `/app/backend/.env`:
```
ADMIN_EMAIL=newemail@example.com
ADMIN_PASSWORD=NewPassword123
```
Then restart: `sudo supervisorctl restart backend`
