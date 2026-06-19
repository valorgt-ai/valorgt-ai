-- =========================================================================
-- VALORGT - CREAR TABLA DE SUGERENCIAS PRIVADAS DE CLIENTES (SUPABASE)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase para activar
-- la base de datos del Analizador de Sugerencias.

BEGIN;

CREATE TABLE IF NOT EXISTS public.property_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(255) NOT NULL,
    property_title VARCHAR(255) NOT NULL,
    agent_email VARCHAR(255) NOT NULL,
    suggestion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS para sincronización directa de comentarios de clientes
ALTER TABLE public.property_suggestions DISABLE ROW LEVEL SECURITY;

COMMIT;
