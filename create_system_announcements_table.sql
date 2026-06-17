-- =========================================================================
-- VALORGT - CREAR TABLA DE ANUNCIOS Y CONFIGURACIONES DEL SISTEMA (SUPABASE)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase para resolver
-- el error de sincronización de anuncios, banner promocional y videos.

BEGIN;

-- Crear la tabla system_announcements
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id VARCHAR(255) PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS para permitir lecturas y escrituras directas desde el panel
ALTER TABLE public.system_announcements DISABLE ROW LEVEL SECURITY;

-- Insertar valores iniciales si no existen
INSERT INTO public.system_announcements (id, message, is_active)
VALUES 
('main_promo', '✨ ¡Oportunidad Prime! Descuento especial del 15% en pautas comerciales contratadas esta semana. Destaca tu propiedad ahora.', true),
('welcome_video_url', '', false),
('plans_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
