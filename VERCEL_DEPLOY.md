# Vercel Deployment Guide — THE LIONEYO

## Step 1: Supabase mein Orders Table banao
Apne Supabase dashboard pe jao → SQL Editor → yeh run karo:

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  quantity TEXT,
  product_title TEXT,
  product_image TEXT,
  price NUMERIC,
  size TEXT,
  category TEXT,
  referral_code TEXT,
  personalization_name TEXT,
  personalization_charge NUMERIC DEFAULT 0,
  final_total NUMERIC,
  payment_method TEXT,
  status TEXT DEFAULT 'Processing',
  college_design_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_orders" ON orders USING (true) WITH CHECK (true);
```

## Step 2: Vercel pe Deploy karo

1. GitHub pe code push karo
2. vercel.com pe jao → New Project
3. **Root Directory** set karo: `frontend`
4. Framework: Create React App (auto-detect)
5. Build Command: `yarn build` (auto-detect)
6. Output Directory: `build` (auto-detect)

## Step 3: Environment Variables set karo Vercel Dashboard mein

Settings → Environment Variables mein yeh add karo:

| Variable | Value |
|---|---|
| `REACT_APP_SUPABASE_URL` | apna Supabase URL |
| `REACT_APP_SUPABASE_ANON_KEY` | apni Supabase Anon Key |
| `REACT_APP_WHATSAPP_NUMBER` | 9557843135 |
| `REACT_APP_GOOGLE_SCRIPT_URL` | apna Google Script URL |
| `REACT_APP_UPI_ID` | apna UPI ID |
| `REACT_APP_ADMIN_EMAIL` | admin@thelioneyo.com |
| `REACT_APP_ADMIN_PASSWORD` | Lioneyo@123 |

## Step 4: Admin Panel — Orders Tab Usage

1. `/admin` pe jao
2. **Orders** tab click karo
3. Har order ke saath **"Confirm Email"** button hai
4. Click karo → Gmail khulega pre-filled email ke saath
5. Send dabao → Customer ko confirmation mil jaayegi

## Important Notes
- `REACT_APP_BACKEND_URL` Vercel pe ADD MAT KARO (not needed)
- `WDS_SOCKET_PORT` Vercel pe ADD MAT KARO (dev only)
- Orders Google Sheets mein bhi jaate hain (webhook working)
- Orders Supabase `orders` table mein bhi save hote hain (admin panel ke liye)
