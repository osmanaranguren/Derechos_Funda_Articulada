-- ========================================================
-- SCRIPT DE INICIALIZACIÓN DE TABLA PARA SUPABASE
-- Plataforma SENA: Derechos Fundamentales en el Trabajo
-- Programa: Articulación con la Media (Colegios)
-- Tabla: evaluaciones_articulada
-- ========================================================

-- 1. Crear tabla dedicada para Colegios en Articulación
CREATE TABLE IF NOT EXISTS public.evaluaciones_articulada (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nombre TEXT NOT NULL,
    documento TEXT,
    ficha TEXT NOT NULL,
    colegio TEXT NOT NULL,
    municipio TEXT,
    grado TEXT,
    intento INTEGER DEFAULT 1,
    puntaje INTEGER NOT NULL,
    total_preguntas INTEGER NOT NULL DEFAULT 10,
    porcentaje NUMERIC(5,2) NOT NULL,
    aprobado BOOLEAN NOT NULL,
    calificado_sofia BOOLEAN DEFAULT FALSE,
    calificado_sofia_por TEXT,
    calificado_sofia_fecha TEXT,
    tiempo_empleado TEXT,
    respuestas_detalle JSONB
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.evaluaciones_articulada ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Inserción, Lectura, Actualización, Eliminación)
CREATE POLICY "Permitir insercion anonima articulada" 
ON public.evaluaciones_articulada FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Permitir lectura anonima articulada" 
ON public.evaluaciones_articulada FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Permitir actualizacion anonima articulada" 
ON public.evaluaciones_articulada FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir eliminacion anonima articulada" 
ON public.evaluaciones_articulada FOR DELETE TO anon, authenticated USING (true);

-- 4. Índices para consultas y filtros de alta velocidad
CREATE INDEX IF NOT EXISTS idx_articulada_ficha ON public.evaluaciones_articulada (ficha);
CREATE INDEX IF NOT EXISTS idx_articulada_colegio ON public.evaluaciones_articulada (colegio);
CREATE INDEX IF NOT EXISTS idx_articulada_fecha ON public.evaluaciones_articulada (created_at DESC);
