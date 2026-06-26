-- =========================================================================
-- VALORGT - CREAR TABLA DE PORTADAS ALTERNATIVAS (ZONAS SIN PAUTA)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase para activar
-- la base de datos de Portadas Alternativas del Administrador.

BEGIN;

CREATE TABLE IF NOT EXISTS public.zone_banners (
    zone_key VARCHAR(255) PRIMARY KEY,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    cta_text VARCHAR(255) DEFAULT 'MÁS INFORMACIÓN' NOT NULL,
    link TEXT,
    photo TEXT, -- Guarda URLs directas o imágenes Base64 comprimidas
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS para permitir lecturas públicas e inserción/actualización desde la consola
ALTER TABLE public.zone_banners DISABLE ROW LEVEL SECURITY;

COMMIT;
