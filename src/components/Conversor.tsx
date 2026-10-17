import { useState } from 'react';
import { formatValor, type Indicador, type RespuestaIndicadoresHoy } from '../lib/api';
import { Campo, Mensaje, Tarjeta } from './ui';

// Monedas/unidades del conversor. Todo se pasa primero a pesos (CLP) y de ahí a la otra unidad:
//   monto * (CLP por unidad origen) / (CLP por unidad destino)
const UNIDADES = [
  { codigo: 'clp', nombre: 'Peso chileno (CLP)' },
  { codigo: 'uf', nombre: 'UF' },
  { codigo: 'utm', nombre: 'UTM' },
  { codigo: 'dolar', nombre: 'Dólar observado (USD)' },
  { codigo: 'euro', nombre: 'Euro' },
  { codigo: 'bitcoin', nombre: 'Bitcoin' },
] as const;

type Codigo = (typeof UNIDADES)[number]['codigo'];

/** Cuántos pesos vale 1 unidad de cada cosa, según los valores de hoy */
function pesosPorUnidad(datos: RespuestaIndicadoresHoy): Record<Codigo, number> {
  const v = (c: string) => (datos[c] as Indicador).valor;
  return {
    clp: 1,
    uf: v('uf'),
    utm: v('utm'),
    dolar: v('dolar'),
    euro: v('euro'),
    bitcoin: v('bitcoin') * v('dolar'), // bitcoin viene en dólares
  };
}

const decimales = (c: Codigo) => (c === 'clp' ? 0 : c === 'bitcoin' ? 8 : 4);
const formato = (n: number, c: Codigo) =>
  new Intl.NumberFormat('es-CL', { maximumFractionDigits: decimales(c) }).format(n);

const selectClase =
  'w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400';

// NUEVO — Conversor. No hace llamadas propias: usa los valores de hoy que ya pidió App.
export function Conversor({ datosHoy }: { datosHoy: RespuestaIndicadoresHoy | null }) {
  const [monto, setMonto] = useState('1');
  const [origen, setOrigen] = useState<Codigo>('uf');
  const [destino, setDestino] = useState<Codigo>('clp');

  if (!datosHoy) {
    return (
      <Tarjeta titulo="Conversor">
        <Mensaje>Esperando los valores de hoy...</Mensaje>
      </Tarjeta>
    );
  }

  const tabla = pesosPorUnidad(datosHoy);
  const cantidad = Number(monto.replace(',', '.'));
  const valido = monto.trim() !== '' && Number.isFinite(cantidad) && cantidad >= 0;
  const resultado = valido ? (cantidad * tabla[origen]) / tabla[destino] : null;
  const tasa = tabla[origen] / tabla[destino];
  const nombre = (c: Codigo) => UNIDADES.find((u) => u.codigo === c)!.nombre;

  function invertir() {
    setOrigen(destino);
    setDestino(origen);
  }

  return (
    <Tarjeta titulo="Conversor">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-40">
          <Campo etiqueta="Monto" type="text" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} />
        </div>
        <div className="w-full sm:flex-1">
          <span className="mb-1 block text-sm text-slate-300">De</span>
          <select className={selectClase} value={origen} onChange={(e) => setOrigen(e.target.value as Codigo)} aria-label="Convertir desde">
            {UNIDADES.map((u) => <option key={u.codigo} value={u.codigo}>{u.nombre}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={invertir}
          aria-label="Invertir conversión"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          ⇄
        </button>
        <div className="w-full sm:flex-1">
          <span className="mb-1 block text-sm text-slate-300">A</span>
          <select className={selectClase} value={destino} onChange={(e) => setDestino(e.target.value as Codigo)} aria-label="Convertir a">
            {UNIDADES.map((u) => <option key={u.codigo} value={u.codigo}>{u.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-black/25 p-4 text-center">
        {resultado !== null ? (
          <>
            <div className="text-sm text-slate-300">
              {formato(cantidad, origen)} {nombre(origen)} equivalen a
            </div>
            <div className="my-1 font-subtitulo text-2xl font-semibold sm:text-3xl" data-testid="resultado">
              {formato(resultado, destino)} {nombre(destino)}
            </div>
            <div className="text-xs text-slate-400">
              1 {nombre(origen)} = {formato(tasa, destino)} {nombre(destino)} · valores de hoy
              {origen === 'clp' || destino === 'clp' ? '' : ' (pasando por pesos)'}
            </div>
          </>
        ) : (
          <p className="text-slate-300">Escribe un monto válido para convertir.</p>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Referencial: usa los valores publicados por el Banco Central ({formatValor(tabla.dolar)} por dólar observado), no el precio en vivo del mercado.
      </p>
    </Tarjeta>
  );
}
