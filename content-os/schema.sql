-- Supabase Schema for Content OS

-- 1. Depósito de Ideas
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'transferida', 'descartada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transferred_to TEXT,
    idea_text TEXT
);

-- 2. Constructores (Reels y Carruseles)
CREATE TABLE content_pieces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('reel', 'carrusel', 'story', 'post')),
    pillar TEXT,
    platform TEXT,
    status TEXT DEFAULT 'en_creacion' CHECK (status IN ('en_creacion', 'revision', 'listo', 'publicado')),
    publish_date DATE,
    idea_id UUID REFERENCES ideas(id),
    -- JSONB column for specific data (guion for reels, slides for carrusels)
    content_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Banco de Hooks
CREATE TABLE hooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    pillar TEXT,
    emotion TEXT,
    format_suggested TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRM Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    source TEXT,
    content_origin TEXT,
    stage TEXT DEFAULT 'contacto_inicial' CHECK (stage IN ('contacto_inicial', 'info_enviada', 'pre_consulta', 'consulta', 'en_proceso', 'paciente_activo')),
    economic_capacity TEXT,
    notes TEXT,
    first_contact_date DATE DEFAULT CURRENT_DATE,
    last_followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Estrategia
CREATE TABLE strategy_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT CHECK (type IN ('anual', 'mensual', 'semanal')),
    period_name TEXT NOT NULL, -- e.g., "Mayo 2026", "Semana 22"
    plan_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and setup basic policies (allowing all for the prototype)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions on ideas" ON ideas FOR ALL USING (true);
CREATE POLICY "Allow all actions on content_pieces" ON content_pieces FOR ALL USING (true);
CREATE POLICY "Allow all actions on hooks" ON hooks FOR ALL USING (true);
CREATE POLICY "Allow all actions on leads" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all actions on strategy_plans" ON strategy_plans FOR ALL USING (true);

-- Insert some dummy data for testing
INSERT INTO ideas (title, tags, status, idea_text) VALUES 
('Mito sobre el metabolismo adaptativo', ARRAY['mito', 'educacion'], 'idea', 'Explicar por qué comer menos a veces estanca el peso.'),
('Historia paciente Valeria', ARRAY['transformacion', 'emocional'], 'idea', 'Volvió a salir en las fotos familiares.');
