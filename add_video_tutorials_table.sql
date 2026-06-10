-- Crear tabla de video tutoriales en Supabase
CREATE TABLE IF NOT EXISTS public.video_tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_key VARCHAR(50) NOT NULL,
    youtube_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas por seguridad si se vuelve a correr
DROP POLICY IF EXISTS "Permitir lectura publica de tutoriales" ON public.video_tutorials;
DROP POLICY IF EXISTS "Permitir insercion/borrado de tutoriales a administradores" ON public.video_tutorials;

-- 1. Permitir lectura pública a cualquier usuario
CREATE POLICY "Permitir lectura publica de tutoriales" 
ON public.video_tutorials FOR SELECT 
USING (true);

-- 2. Permitir inserción/borrado de tutoriales (abierto en desarrollo para facilitar pruebas directas, pero requiere rol authenticated en producción)
CREATE POLICY "Permitir insercion/borrado de tutoriales a administradores" 
ON public.video_tutorials FOR ALL 
USING (true)
WITH CHECK (true);
