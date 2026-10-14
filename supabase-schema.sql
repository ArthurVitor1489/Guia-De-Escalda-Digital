-- ==============================================================================
-- CRUX / GUIA DE ESCALADA DIGITAL — SCHEMA DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase (https://supabase.com)
-- ==============================================================================

-- 1. TABELA DE DESTINOS / CIDADES / PICOS DE ESCALADA
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state VARCHAR(2) NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    rock_type TEXT DEFAULT 'Granito',
    total_routes INTEGER DEFAULT 0,
    has_3d BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE SETORES
CREATE TABLE IF NOT EXISTS public.sectors (
    id TEXT PRIMARY KEY,
    destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crag_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    elevation_meters INTEGER,
    approach_time_minutes INTEGER,
    approach_trail_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE PAREDES / FALÉSIAS
CREATE TABLE IF NOT EXISTS public.walls (
    id TEXT PRIMARY KEY,
    sector_id TEXT REFERENCES public.sectors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    orientation VARCHAR(5), -- N, S, L, O, NE, SE, NO, SO
    height_meters INTEGER,
    rock_type TEXT,
    fallback_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE VIAS DE ESCALADA
CREATE TABLE IF NOT EXISTS public.routes (
    id TEXT PRIMARY KEY,
    wall_id TEXT REFERENCES public.walls(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    grade_br TEXT NOT NULL,         -- Ex: '6sup', '7a', '8b'
    grade_fr TEXT,                  -- Ex: '6b', '7a+'
    grade_yds TEXT,                 -- Ex: '5.10c'
    danger_rating VARCHAR(5),       -- Ex: 'E1', 'E2', 'E3'
    height_meters INTEGER,
    bolts_count INTEGER DEFAULT 0,
    protection_type VARCHAR(20) DEFAULT 'sport', -- sport, trad, boulder, top-rope
    style VARCHAR(20) DEFAULT 'face',            -- slab, vertical, overhang, roof, crack
    description TEXT,
    first_ascentionist TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE USUÁRIOS / ESCALADORES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    city TEXT,
    state VARCHAR(2),
    bio TEXT,
    hardest_grade_sport TEXT,
    hardest_grade_boulder TEXT,
    climbing_since INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE CADENAS / REGISTRO DE ASCENSÕES (LOGBOOK)
CREATE TABLE IF NOT EXISTS public.ascents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    style VARCHAR(20) NOT NULL, -- redpoint, onsight, flash, repeat
    date DATE DEFAULT CURRENT_DATE,
    crag_name TEXT,
    wall_name TEXT,
    city TEXT,
    partner_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE FOTOS DA COMUNIDADE
CREATE TABLE IF NOT EXISTS public.community_photos (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    user_city TEXT,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route_name TEXT,
    wall_id TEXT REFERENCES public.walls(id) ON DELETE SET NULL,
    wall_name TEXT,
    photo_url TEXT NOT NULL,
    caption TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security (RLS) nas tabelas principais
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (qualquer um pode consultar destinos e vias offline/online)
CREATE POLICY "Leitura pública de destinos" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Leitura pública de setores" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Leitura pública de paredes" ON public.walls FOR SELECT USING (true);
CREATE POLICY "Leitura pública de vias" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Leitura pública de fotos" ON public.community_photos FOR SELECT USING (true);

-- Políticas de inserção/atualização (permite escaladores colaborarem)
CREATE POLICY "Inserção pública de fotos" ON public.community_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserção pública de destinos" ON public.destinations FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserção pública de setores" ON public.sectors FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserção pública de paredes" ON public.walls FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserção pública de vias" ON public.routes FOR INSERT WITH CHECK (true);
