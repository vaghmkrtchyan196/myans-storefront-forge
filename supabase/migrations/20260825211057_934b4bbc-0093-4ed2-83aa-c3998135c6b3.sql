
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.order_status AS ENUM ('new','confirmed','preparing','shipping','completed','cancelled');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(uid,'admin');
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (uid,'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_amd integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  UNIQUE (product_id, size)
);
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text,
  position integer NOT NULL DEFAULT 0,
  is_main boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  notes text,
  subtotal_amd integer NOT NULL DEFAULT 0,
  shipping_amd integer NOT NULL DEFAULT 0,
  total_amd integer NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price_amd integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.product_images(product_id);
CREATE INDEX ON public.product_sizes(product_id);
CREATE INDEX ON public.order_items(order_id);

CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.categories, public.collections, public.products, public.product_sizes, public.product_images, public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.collections, public.products, public.product_sizes, public.product_images, public.site_settings TO authenticated;
GRANT INSERT ON public.orders, public.order_items TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders, public.order_items TO authenticated;
GRANT ALL ON public.categories, public.collections, public.products, public.product_sizes, public.product_images, public.site_settings, public.orders, public.order_items TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read collections" ON public.collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read sizes" ON public.product_sizes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write sizes" ON public.product_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "anyone can create order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "anyone can create order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.categories (name, slug) VALUES ('Շապիկներ','t-shirts');
INSERT INTO public.collections (name, slug) VALUES ('COLLECTION 01','collection-01');

INSERT INTO public.products (name, description, price_amd, color, category_id, collection_id, is_available, sort_order)
SELECT v.name, v.descr, v.price, v.color, c.id, col.id, true, v.ord
FROM (VALUES
  ('MYANS 01','100% բամբակ։ Օվերսայզ նստվածք։ Հայաստանում ձևավորված։',14900,'Սև',1),
  ('MYANS 02','100% բամբակ։ Օվերսայզ նստվածք։ Հայաստանում ձևավորված։',14900,'Սպիտակ',2),
  ('MYANS 03','100% բամբակ։ Ստանդարտ նստվածք։ Հայաստանում ձևավորված։',15900,'Սև',3),
  ('MYANS 04','100% բամբակ։ Ստանդարտ նստվածք։ Հայաստանում ձևավորված։',15900,'Սպիտակ',4),
  ('MYANS 05','100% բամբակ։ Օվերսայզ նստվածք։ Հայաստանում ձևավորված։',16900,'Մոխրագույն',5),
  ('MYANS 06','100% բամբակ։ Օվերսայզ նստվածք։ Հայաստանում ձևավորված։',16900,'Սև',6)
) AS v(name, descr, price, color, ord)
CROSS JOIN public.categories c CROSS JOIN public.collections col
WHERE c.slug='t-shirts' AND col.slug='collection-01';

INSERT INTO public.product_sizes (product_id, size, is_available)
SELECT p.id, s.size, true FROM public.products p
CROSS JOIN (VALUES ('S'),('M'),('L'),('XL'),('XXL')) AS s(size);

INSERT INTO public.site_settings (key, value) VALUES ('hero_image_url', NULL) ON CONFLICT DO NOTHING;
