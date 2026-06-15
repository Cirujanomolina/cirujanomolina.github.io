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
