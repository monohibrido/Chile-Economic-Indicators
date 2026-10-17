import { useState, type FormEvent } from 'react';
import { getIndicadorPorAnio, soloFecha, type RespuestaHistorica } from '../lib/api';
import { useConsulta } from '../hooks/useConsulta';
import { GraficoLinea } from './GraficoLinea';
import { Alerta, Boton, Campo, Mensaje, SelectIndicador, Tarjeta } from './ui';

type Par = [RespuestaHistorica, RespuestaHistorica];

// NUEVO — práctica: dos llamadas a GET /api/{indicador}/{yyyy} en paralelo (Promise.all)
// y comparación en "base 100" (cada serie parte en 100) para poder ver dólar vs bitcoin
// aunque sus valores sean de órdenes de magnitud distintos.
export function Comparar() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [anio, setAnio] = useState('');
  const { data, error, cargando, ejecutar, fallar, limpiar } = useConsulta<Par>();

  function consultar(e: FormEvent) {
    e.preventDefault();
    if (a === b) return fallar('Elige dos indicadores distintos.');
    if (Number(anio) > new Date().getFullYear()) return fallar(`No hay datos disponibles para el año ${anio}.`);
    ejecutar(
      async () => Promise.all([getIndicadorPorAnio(a, anio), getIndicadorPorAnio(b, anio)]) as Promise<Par>,
      (d) => (d.every((x) => x.serie?.length) ? null : 'Alguno de los indicadores no tiene datos ese año.'),
    );
  }

  let grafico: { labels: string[]; series: { label: string; data: (number | null)[]; color: string }[] } | null = null;
  if (data) {
    // Cada indicador puede tener fechas distintas (UF diaria, IPC mensual): unimos las fechas.
    const mapas = data.map((r) => new Map(r.serie.map((s) => [soloFecha(s.fecha), s.valor])));
    const labels = [...new Set(mapas.flatMap((m) => [...m.keys()]))].sort();
    const colores = ['#38bdf8', '#f59e0b'];
    grafico = {
      labels,
      series: data.map((r, i) => {
        const base = r.serie[r.serie.length - 1].valor; // el más antiguo del año
        return {
          label: `${r.nombre} (base 100)`,
          color: colores[i],
          data: labels.map((l) => (mapas[i].has(l) ? (mapas[i].get(l)! / base) * 100 : null)),
        };
      }),
    };
  }

  return (
    <Tarjeta titulo="Compara dos indicadores en un año">
      <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-52">
          <SelectIndicador value={a} onChange={setA} />
        </div>
        <div className="w-full sm:w-52">
          <SelectIndicador value={b} onChange={setB} />
        </div>
        <div className="w-full sm:w-32">
          <Campo type="number" placeholder="Ej: 2024" min={1900} value={anio} onChange={(e) => setAnio(e.target.value)} />
        </div>
        <Boton type="submit" disabled={!a || !b || !anio || cargando}>
          {cargando ? 'Comparando...' : 'Comparar'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={() => { setA(''); setB(''); setAnio(''); limpiar(); }}>
          Limpiar
        </Boton>
      </form>

      <div className="mt-6">
        {error && <Alerta>{error}</Alerta>}
        {grafico ? (
          <GraficoLinea labels={grafico.labels} series={grafico.series} />
        ) : (
          !error && !cargando && <Mensaje>Elige dos indicadores y un año. Ambos parten en 100 para comparar su variación.</Mensaje>
        )}
      </div>
    </Tarjeta>
  );
}
