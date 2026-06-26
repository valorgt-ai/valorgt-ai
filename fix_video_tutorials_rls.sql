-- Deshabilitar y recrear las políticas de seguridad de Supabase para video_tutorials
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores
DROP POLICY IF EXISTS "Permitir lectura publica de tutoriales" ON public.video_tutorials;
DROP POLICY IF EXISTS "Permitir insercion/borrado de tutoriales a administradores" ON public.video_tutorials;
DROP POLICY IF EXISTS "Permitir todo a publico" ON public.video_tutorials;

-- Crear una política abierta para que cualquier cliente de desarrollo (incluso anónimo/anon_key) pueda insertar, actualizar y borrar tutoriales
CREATE POLICY "Permitir todo a publico" 
ON public.video_tutorials FOR ALL 
USING (true)
WITH CHECK (true);
