-- Agregar columna billing_period a la tabla profiles para guardar el ciclo de facturación
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS billing_period VARCHAR DEFAULT 'mensual';
