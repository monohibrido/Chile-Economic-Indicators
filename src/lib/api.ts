// Equivalente a services/indicadores.ts de Angular.
// Sin HttpClient ni Observables: usamos fetch + async/await (Promesas).

const API_URL = 'https://mindicador.cl/api';

export const INDICADORES = [
  { codigo: 'uf', nombre: 'UF' },
  { codigo: 'ivp', nombre: 'IVP' },
  { codigo: 'dolar', nombre: 'Dólar observado' },
  { codigo: 'dolar_intercambio', nombre: 'Dólar Intercambio' },
  { codigo: 'euro', nombre: 'Euro' },
  { codigo: 'ipc', nombre: 'IPC' },
  { codigo: 'utm', nombre: 'UTM' },
  { codigo: 'imacec', nombre: 'IMACEC' },
  { codigo: 'tpm', nombre: 'TPM' },
  { codigo: 'libra_cobre', nombre: 'Libra Cobre' },
  { codigo: 'tasa_desempleo', nombre: 'Tasa Desempleo' },
  { codigo: 'bitcoin', nombre: 'Bitcoin' },
] as const;

export type CodigoIndicador = (typeof INDICADORES)[number]['codigo'];

export interface Indicador {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

// GET /api  -> todos los indicadores de hoy
export interface RespuestaIndicadoresHoy {
  version: string;
  autor: string;
  fecha: string;
  // Cada clave (uf, dolar, euro...) es un Indicador
  [codigo: string]: Indicador | string;
}

export interface Serie {
  fecha: string;
  valor: number;
}

// GET /api/{indicador}, /api/{indicador}/{fecha} y /api/{indicador}/{año}
export interface RespuestaHistorica {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: Serie[];
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);
  return (await res.json()) as T;
}

/** GET /api — snapshot de todos los indicadores de hoy */
export const getIndicadoresHoy = () => getJson<RespuestaIndicadoresHoy>(API_URL);

/** GET /api/{indicador} — serie reciente (últimos ~30 días). ¡Endpoint nuevo! */
export const getIndicadorReciente = (tipo: string) =>
  getJson<RespuestaHistorica>(`${API_URL}/${tipo}`);

/** GET /api/{indicador}/{dd-mm-yyyy} — la fecha entra como yyyy-mm-dd (input date) */
export function getIndicadorPorFecha(tipo: string, fecha: string) {
  const [year, month, day] = fecha.split('-');
  return getJson<RespuestaHistorica>(`${API_URL}/${tipo}/${day}-${month}-${year}`);
}

/** GET /api/{indicador}/{yyyy} — todos los valores de un año */
export const getIndicadorPorAnio = (tipo: string, anio: string | number) =>
  getJson<RespuestaHistorica>(`${API_URL}/${tipo}/${anio}`);

// ---------- Utilidades de formato ----------

/** "2024-03-01T03:00:00.000Z" -> "2024-03-01" (evita líos de zona horaria) */
export const soloFecha = (iso: string) => iso.slice(0, 10);

/** "2024-03-01" -> "01-03-2024" */
export const fechaCL = (iso: string) => {
  const [y, m, d] = soloFecha(iso).split('-');
  return `${d}-${m}-${y}`;
};

/** Fecha de hoy como yyyy-mm-dd en hora local (no UTC) */
export function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function formatValor(valor: number, unidad?: string) {
  const n = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(valor);
  if (unidad === 'Porcentaje') return `${n}%`;
  if (unidad === 'Dólar') return `US$${n}`;
  return `$${n}`;
}
