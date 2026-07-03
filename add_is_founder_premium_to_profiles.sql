-- Agregar columna is_founder_premium a la tabla profiles para control de membresías promo
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founder_premium BOOLEAN DEFAULT FALSE;
