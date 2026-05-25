-- HelloMenu — Schéma Supabase
-- Copiez-collez ce script dans l'éditeur SQL de votre projet Supabase

-- ============================================
-- TABLES
-- ============================================

-- Profils utilisateurs (liés à auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  nb_persons INT DEFAULT 2,
  dietary_preference TEXT CHECK (dietary_preference IN ('equilibre','sain','vegan','sportif','gourmand')),
  goal TEXT CHECK (goal IN ('prise_masse','perte_poids','maintien')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free','medium','premium')),
  stripe_customer_id TEXT,
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menus générés
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  period TEXT CHECK (period IN ('semaine','mois')),
  nb_persons INT DEFAULT 2,
  diet_type TEXT,
  goal TEXT,
  meals JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abonnements Stripe
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT CHECK (plan IN ('medium','premium')),
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compteur de générations mensuel
CREATE TABLE IF NOT EXISTS generation_counts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count INT DEFAULT 0,
  reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_counts ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture et écriture uniquement pour le propriétaire
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Menus : lecture et écriture uniquement pour le propriétaire
CREATE POLICY "menus_select" ON menus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "menus_insert" ON menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "menus_update" ON menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "menus_delete" ON menus FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions : lecture uniquement pour le propriétaire
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Generation counts : lecture et écriture uniquement pour le propriétaire
CREATE POLICY "gen_counts_select" ON generation_counts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gen_counts_insert" ON generation_counts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gen_counts_update" ON generation_counts FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER : création automatique du profil
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
