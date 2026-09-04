-- ========================================================
-- SCRIPT DE ACTUALIZACIÓN Y COMPATIBILIDAD SUPABASE
-- Plataforma SENA: Derechos Fundamentales en el Trabajo
-- Programa: Articulación con la Media (Colegios Grado 11°)
-- Tabla: evaluaciones_articulada
-- ========================================================

-- ========================================================
-- PASO 1: AGREGAR CAMPOS FALTANTES (SEGURO PARA TABLAS EXISTENTES)
-- ========================================================
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS colegio TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS municipio TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS grado TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS programa TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS intento INTEGER DEFAULT 1;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS calificado_sofia BOOLEAN DEFAULT FALSE;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS calificado_sofia_por TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS calificado_sofia_fecha TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS tiempo_empleado TEXT;
ALTER TABLE public.evaluaciones_articulada ADD COLUMN IF NOT EXISTS respuestas_detalle JSONB;

-- ========================================================
-- PASO 2: HABILITAR SEGURIDAD (RLS)
-- ========================================================
ALTER TABLE public.evaluaciones_articulada ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- PASO 3: POLÍTICAS DE ACCESO (RE-CREACIÓN LIMPIA SIN ERROR 42710)
-- ========================================================
DROP POLICY IF EXISTS "Permitir insercion anonima articulada" ON public.evaluaciones_articulada;
CREATE POLICY "Permitir insercion anonima articulada" 
ON public.evaluaciones_articulada FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura anonima articulada" ON public.evaluaciones_articulada;
CREATE POLICY "Permitir lectura anonima articulada" 
ON public.evaluaciones_articulada FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion anonima articulada" ON public.evaluaciones_articulada;
CREATE POLICY "Permitir actualizacion anonima articulada" 
ON public.evaluaciones_articulada FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion anonima articulada" ON public.evaluaciones_articulada;
CREATE POLICY "Permitir eliminacion anonima articulada" 
ON public.evaluaciones_articulada FOR DELETE TO anon, authenticated USING (true);

-- ========================================================
-- PASO 4: ÍNDICES DE VELOCIDAD
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_articulada_ficha ON public.evaluaciones_articulada (ficha);
CREATE INDEX IF NOT EXISTS idx_articulada_colegio ON public.evaluaciones_articulada (colegio);
CREATE INDEX IF NOT EXISTS idx_articulada_municipio ON public.evaluaciones_articulada (municipio);
CREATE INDEX IF NOT EXISTS idx_articulada_programa ON public.evaluaciones_articulada (programa);
CREATE INDEX IF NOT EXISTS idx_articulada_fecha ON public.evaluaciones_articulada (created_at DESC);
