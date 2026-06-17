-- =========================================================================
-- VALORGT - CREAR TABLA DE ANUNCIOS Y CONFIGURACIONES DEL SISTEMA (SUPABASE)
-- =========================================================================
-- Ejecuta este script en el SQL Editor de tu consola de Supabase.
-- Puedes seleccionar la opción que prefieras (Con RLS o Sin RLS).

BEGIN;

-- Crear la tabla system_announcements
CREATE TABLE IF NOT EXISTS public.system_announcements (
    id VARCHAR(255) PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- OPCIÓN A: EJECUTAR SIN RLS (RECOMENDADO)
-- ==========================================
-- Esto desactiva el RLS para que cualquier petición anon/public pueda operar la tabla sin restricciones.
ALTER TABLE public.system_announcements DISABLE ROW LEVEL SECURITY;


-- ====================================================================================
-- OPCIÓN B: EJECUTAR CON RLS HABILITADO (SI DESEAS MANTENER POLÍTICAS ACTIVAS)
-- ====================================================================================
-- Para usar esta opción, descomenta las siguientes líneas (quita los '--' al inicio de cada línea):
-- ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Permitir lectura publica de anuncios" ON public.system_announcements;
-- DROP POLICY IF EXISTS "Permitir escritura publica de anuncios" ON public.system_announcements;
-- CREATE POLICY "Permitir lectura publica de anuncios" ON public.system_announcements FOR SELECT USING (true);
-- CREATE POLICY "Permitir escritura publica de anuncios" ON public.system_announcements FOR ALL USING (true) WITH CHECK (true);


-- Insertar valores iniciales si no existen
INSERT INTO public.system_announcements (id, message, is_active)
VALUES 
('main_promo', '✨ ¡Oportunidad Prime! Descuento especial del 15% en pautas comerciales contratadas esta semana. Destaca tu propiedad ahora.', true),
('welcome_video_url', '', false),
('plans_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
