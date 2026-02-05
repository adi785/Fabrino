
-- LUMINA DATABASE SCHEMA
-- Execute this in the Supabase SQL Editor

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    image TEXT, 
    category TEXT NOT NULL, 
    story TEXT,
    customizable_fields JSONB DEFAULT '[]'::jsonb, 
    materials TEXT,
    process TEXT,
    care TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    payment_method_last4 TEXT,
    onboarding_complete BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products ON DELETE SET NULL,
    name TEXT NOT NULL,
    customization_text TEXT,
    customization_color TEXT,
    quantity INTEGER DEFAULT 1,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES FOR TABLES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create an order" ON orders FOR INSERT WITH CHECK (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR auth.uid() IS NULL))
);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);

-- ==========================================
-- STORAGE POLICIES (CRITICAL FOR UPLOADS)
-- ==========================================

-- Allow public access to read files in the 'products' bucket
CREATE POLICY "Give public read access to products"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow anyone to upload to the 'products' bucket (for demo simplicity)
-- In production, you would change 'TO public' to 'TO authenticated'
CREATE POLICY "Allow public uploads to products"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'products');

-- Allow anyone to update/delete their own uploads (for demo simplicity)
CREATE POLICY "Allow public updates to products"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'products');

CREATE POLICY "Allow public deletes to products"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'products');

-- TRIGGER FOR NEW USER PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
