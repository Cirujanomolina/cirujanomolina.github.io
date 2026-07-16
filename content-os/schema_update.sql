-- EJECUTAR ESTO EN EL SQL EDITOR DE TU PANEL DE SUPABASE

-- 1. Tabla de Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL, -- Nombre de usuario único para login
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Hash SHA-256 de la contraseña
    role TEXT NOT NULL DEFAULT 'colaborador' CHECK (role IN ('administrador', 'colaborador')),
    function TEXT NOT NULL DEFAULT 'Otros', -- ej: 'Editor de Video', 'Diseñador', 'Copywriter', 'Director Médico'
    photo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS y Políticas de Acceso (Evitando errores si ya existen)
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a colaboradores" ON colaboradores;
CREATE POLICY "Permitir todo a colaboradores" ON colaboradores FOR ALL USING (true);

-- 2. Tabla de Logs de Auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS y Políticas de Acceso (Evitando errores si ya existen)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a audit_logs" ON audit_logs;
CREATE POLICY "Permitir todo a audit_logs" ON audit_logs FOR ALL USING (true);

-- 3. Tabla de Campañas (Paid Media)
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL,
    objective TEXT,
    budget_type TEXT DEFAULT 'ABO',
    budget NUMERIC DEFAULT 0,
    adsets JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS y Políticas de Acceso (Evitando errores si ya existen)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a campaigns" ON campaigns;
CREATE POLICY "Permitir todo a campaigns" ON campaigns FOR ALL USING (true);

-- 4. Crear bucket de almacenamiento para fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pics', 'profile-pics', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas de almacenamiento para profile-pics
DROP POLICY IF EXISTS "Permitir acceso público a profile-pics" ON storage.objects;
CREATE POLICY "Permitir acceso público a profile-pics"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pics');

DROP POLICY IF EXISTS "Permitir subida a profile-pics" ON storage.objects;
CREATE POLICY "Permitir subida a profile-pics"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pics');

DROP POLICY IF EXISTS "Permitir actualización a profile-pics" ON storage.objects;
CREATE POLICY "Permitir actualización a profile-pics"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pics');

-- 5. Crear bucket de almacenamiento para assets del blog
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas de almacenamiento para blog-assets
DROP POLICY IF EXISTS "Permitir acceso público a blog-assets" ON storage.objects;
CREATE POLICY "Permitir acceso público a blog-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS "Permitir subida a blog-assets" ON storage.objects;
CREATE POLICY "Permitir subida a blog-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS "Permitir actualización a blog-assets" ON storage.objects;
CREATE POLICY "Permitir actualización a blog-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-assets');

-- 6. Tabla de Temas Personalizables
CREATE TABLE IF NOT EXISTS content_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a content_topics" ON content_topics;
CREATE POLICY "Permitir todo a content_topics" ON content_topics FOR ALL USING (true);

-- Insertar temas por defecto
INSERT INTO content_topics (name) VALUES 
('Bariátrica'),
('Manga Gástrica'),
('Bypass Gástrico'),
('Balón Intragástrico'),
('Nutrición'),
('Psicología'),
('Estilo de Vida')
ON CONFLICT (name) DO NOTHING;

-- 7. Tabla de Competidores Espiados (Spy System)
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a competitors" ON competitors;
CREATE POLICY "Permitir todo a competitors" ON competitors FOR ALL USING (true);

-- 8. Tabla de Reels/Carruseles Favoritos (Spy System)
CREATE TABLE IF NOT EXISTS spy_favorites (
    id TEXT PRIMARY KEY,
    shortcode TEXT NOT NULL,
    author TEXT NOT NULL,
    thumbnail TEXT,
    views NUMERIC,
    likes NUMERIC,
    comments NUMERIC,
    shares NUMERIC,
    saves NUMERIC,
    duration NUMERIC,
    caption TEXT,
    display_url TEXT,
    is_video BOOLEAN,
    outlier_ratio NUMERIC,
    carousel_media JSONB DEFAULT '[]',
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spy_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a spy_favorites" ON spy_favorites;
CREATE POLICY "Permitir todo a spy_favorites" ON spy_favorites FOR ALL USING (true);




