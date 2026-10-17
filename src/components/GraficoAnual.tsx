import { useState, type FormEvent } from 'react';
import { getIndicadorPorAnio, soloFecha, type RespuestaHistorica } from '../lib/api';
import { useConsulta } from '../hooks/useConsulta';
import { GraficoLinea } from './GraficoLinea';
import { Alerta, Boton, Campo, Mensaje, SelectIndicador, Tarjeta } from './ui';

// Endpoint: GET /api/{indicador}/{yyyy}
export function GraficoAnual() {
  const [indicador, setIndicador] = useState('');
  const [anio, setAnio] = useState('');
  const { data, error, cargando, ejecutar, fallar, limpiar } = useConsulta<RespuestaHistorica>();

  function consultar(e: FormEvent) {
    e.preventDefault();
    if (Number(anio) > new Date().getFullYear()) return fallar(`No hay datos disponibles para el año ${anio}.`);
    ejecutar(
      () => getIndicadorPorAnio(indicador, anio),
      (d) => (d.serie?.length ? null : 'No se encontraron datos para este año.'),
    );
  }

  function limpiarCampos() {
    setIndicador('');
    setAnio('');
    limpiar();
  }

  // La API entrega lo más nuevo primero; el gráfico lo queremos de izquierda (antiguo) a derecha.
  const serie = data ? [...data.serie].reverse() : [];

  return (
    <Tarjeta titulo="Gráfico de un valor por año">
      <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <SelectIndicador value={indicador} onChange={setIndicador} />
        </div>
        <div className="w-full sm:w-40">
          <Campo type="number" placeholder="Ej: 2024" min={1900} value={anio} onChange={(e) => setAnio(e.target.value)} />
        </div>
        <Boton type="submit" disabled={!indicador || !anio || cargando}>
          {cargando ? 'Buscando...' : 'Buscar valores'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={limpiarCampos}>
          Limpiar
        </Boton>
      </form>

      <div className="mt-6">
        {error && <Alerta>{error}</Alerta>}
        {data && (
          <GraficoLinea
            labels={serie.map((s) => soloFecha(s.fecha))}
            series={[{ label: `Valor de ${data.nombre}`, data: serie.map((s) => s.valor), color: '#ffffff' }]}
          />
        )}
        {!data && !error && !cargando && <Mensaje>Selecciona un indicador y un año para visualizar el gráfico.</Mensaje>}
      </div>
    </Tarjeta>
  );
}
