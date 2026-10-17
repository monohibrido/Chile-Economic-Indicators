import { useState, type FormEvent } from 'react';
import { fechaCL, formatValor, getIndicadorReciente, soloFecha, type RespuestaHistorica } from '../lib/api';
import { useConsulta } from '../hooks/useConsulta';
import { GraficoLinea } from './GraficoLinea';
import { Alerta, Boton, Mensaje, SelectIndicador, Tarjeta } from './ui';

// NUEVO — Endpoint que no usabas: GET /api/{indicador}
// Devuelve la serie reciente (~30 días) de un indicador, sin tener que elegir fecha.
export function Ultimos30Dias() {
  const [indicador, setIndicador] = useState('');
  const { data, error, cargando, ejecutar, fallar, limpiar } = useConsulta<RespuestaHistorica>();

  function consultar(e: FormEvent) {
    e.preventDefault();
    if (!indicador) return fallar('Elige un indicador.');
    ejecutar(
      () => getIndicadorReciente(indicador),
      (d) => (d.serie?.length ? null : 'La API no devolvió datos recientes para este indicador.'),
    );
  }

  // Estadísticas calculadas en el cliente a partir de la serie
  let resumen: { items: [string, string][]; serie: RespuestaHistorica['serie'] } | null = null;
  if (data) {
    const serie = [...data.serie].reverse(); // antiguo -> nuevo
    const valores = serie.map((s) => s.valor);
    const primero = valores[0];
    const ultimo = valores[valores.length - 1];
    const esPorcentaje = data.unidad_medida === 'Porcentaje';
    const cambio = esPorcentaje
      ? `${(ultimo - primero).toFixed(2)} pts`
      : `${(((ultimo - primero) / primero) * 100).toFixed(2)}%`;
    const f = (v: number) => formatValor(v, data.unidad_medida);
    resumen = {
      serie,
      items: [
        ['Último valor', f(ultimo)],
        ['Cambio en el periodo', cambio],
        ['Mínimo', f(Math.min(...valores))],
        ['Máximo', f(Math.max(...valores))],
        ['Promedio', f(valores.reduce((a, b) => a + b, 0) / valores.length)],
        ['Periodo', `${fechaCL(serie[0].fecha)} → ${fechaCL(serie[serie.length - 1].fecha)}`],
      ],
    };
  }

  return (
    <Tarjeta titulo="Últimos 30 días de un indicador">
      <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <SelectIndicador value={indicador} onChange={setIndicador} />
        </div>
        <Boton type="submit" disabled={!indicador || cargando}>
          {cargando ? 'Buscando...' : 'Ver resumen'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={() => { setIndicador(''); limpiar(); }}>
          Limpiar
        </Boton>
      </form>

      <div className="mt-6">
        {error && <Alerta>{error}</Alerta>}
        {resumen && data ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {resumen.items.map(([titulo, valor]) => (
                <div key={titulo} className="rounded-xl bg-black/25 p-3 text-center">
                  <div className="text-xs uppercase tracking-wide text-slate-300">{titulo}</div>
                  <div className="mt-1 font-semibold">{valor}</div>
                </div>
              ))}
            </div>
            <GraficoLinea
              labels={resumen.serie.map((s) => soloFecha(s.fecha))}
              series={[{ label: data.nombre, data: resumen.serie.map((s) => s.valor), color: '#38bdf8' }]}
            />
          </>
        ) : (
          !error && !cargando && <Mensaje>Elige un indicador para ver su evolución reciente.</Mensaje>
        )}
      </div>
    </Tarjeta>
  );
}
