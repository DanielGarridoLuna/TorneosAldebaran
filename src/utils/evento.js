import { supabase } from '../lib/supabase';

const ARCHIVE_KEY = "eventos_archivados_map"

function leerMapaArchivados() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function guardarMapaArchivados(mapa) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(mapa))
}

export function esEventoArchivado(eventoId) {
  const mapa = leerMapaArchivados()
  return Boolean(mapa[String(eventoId)])
}

export function resolverEventoArchivado(evento) {
  if (evento && typeof evento === "object" && "archivado" in evento) {
    return Boolean(evento.archivado)
  }
  return esEventoArchivado(evento?.id ?? evento)
}

export async function obtenerEventos(torneo_id, opciones = {}) {
  const { includeArchivados = false } = opciones
  const { data } = await supabase
    .from("eventos")
    .select("*")
    .eq("torneo_id", torneo_id)
    .order("fecha", { ascending: false })

  const lista = data || []
  if (includeArchivados) return lista
  return lista.filter(ev => !resolverEventoArchivado(ev))
}

export async function obtenerEventoActual(torneo_id) {
  const lista = await obtenerEventos(torneo_id)
  return lista[0] || null
}