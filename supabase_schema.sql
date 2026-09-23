-- CRUX — Esquema do Banco de Dados PostgreSQL / Supabase
-- Execute este script no SQL Editor do Supabase (https://app.supabase.com)

-- 1. Tabela de Perfis de Escaladores
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  city TEXT,
  state VARCHAR(2),
  avatar_url TEXT,
  bio TEXT,
  hardest_grade TEXT DEFAULT '5º',
  member_since TEXT DEFAULT TO_CHAR(NOW(), 'YYYY'),
  total_ascents_count INT DEFAULT 0,
  total_photos_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Destinos / Polos de Escalada
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  city TEXT,
  region_name TEXT,
  description TEXT,
  cover_image TEXT,
  rock_type TEXT,
  total_routes INT DEFAULT 0,
  total_sectors INT DEFAULT 1,
  has_3d BOOLEAN DEFAULT false,
  has_sport BOOLEAN DEFAULT true,
  has_trad BOOLEAN DEFAULT false,
  has_boulder BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Setores
CREATE TABLE IF NOT EXISTS public.sectors (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crag_name TEXT,
  region TEXT,
  city TEXT,
  state VARCHAR(2),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  elevation_meters INT DEFAULT 500,
  approach_time_minutes INT DEFAULT 15,
  approach_trail_description TEXT,
  access_status TEXT DEFAULT 'aberto',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Paredes / Falésias
CREATE TABLE IF NOT EXISTS public.walls (
  id TEXT PRIMARY KEY,
  sector_id TEXT REFERENCES public.sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  orientation VARCHAR(4) DEFAULT 'L',
  sun_shade_notes TEXT,
  height_meters INT DEFAULT 20,
  rock_type TEXT DEFAULT 'granito',
  approach_notes TEXT,
  fallback_photo_url TEXT,
  model_3d_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Vias de Escalada
CREATE TABLE IF NOT EXISTS public.routes (
  id TEXT PRIMARY KEY,
  wall_id TEXT REFERENCES public.walls(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  name TEXT NOT NULL,
  grade_br TEXT NOT NULL,
  grade_fr TEXT,
  grade_yds TEXT,
  danger_rating VARCHAR(3) DEFAULT 'E1',
  height_meters INT,
  bolts_count INT,
  protection_type TEXT DEFAULT 'chapeleta',
  anchor_type TEXT DEFAULT 'dupla_com_anel',
  style TEXT DEFAULT 'esportiva',
  description TEXT,
  safety_warnings TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Fotos da Comunidade & Betas Visuais
CREATE TABLE IF NOT EXISTS public.community_photos (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  user_city TEXT,
  route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
  route_name TEXT,
  wall_id TEXT REFERENCES public.walls(id) ON DELETE SET NULL,
  wall_name TEXT,
  photo_url TEXT NOT NULL,
  caption TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Cadenas e Diário de Escalada (Ascent Log)
CREATE TABLE IF NOT EXISTS public.ascent_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id TEXT REFERENCES public.routes(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  route_grade TEXT NOT NULL,
  wall_name TEXT,
  sector_name TEXT,
  style TEXT NOT NULL, -- 'onsight', 'flash', 'redpoint', 'repeat'
  rating INT DEFAULT 5,
  date TEXT NOT NULL,
  partner TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ascent_logs ENABLE ROW LEVEL SECURITY;

-- Regras de Leitura Pública (Qualquer pessoa pode ler o guia de escalada)
CREATE POLICY "Leitura pública de destinos" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Leitura pública de setores" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Leitura pública de paredes" ON public.walls FOR SELECT USING (true);
CREATE POLICY "Leitura pública de vias" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Leitura pública de fotos" ON public.community_photos FOR SELECT USING (true);
CREATE POLICY "Leitura pública de perfis" ON public.profiles FOR SELECT USING (true);

-- Regras de Inserção para Usuários
CREATE POLICY "Usuários autenticados criam destinos" ON public.destinations FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuários autenticados criam fotos" ON public.community_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuários autenticados registram cadenas" ON public.ascent_logs FOR ALL USING (true);
