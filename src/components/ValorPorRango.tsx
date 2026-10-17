import { useState, type FormEvent } from 'react';
import {
  fechaCL,
  formatValor,
  getIndicadorPorAnio,
  soloFecha,
  type RespuestaHistorica,
  type Serie,
} from '../lib/api';
import { useConsulta } from '../hooks/useConsulta';
import { Alerta, Boton, Campo, Mensaje, SelectIndicador, Tabla, Tarjeta, Td } from './ui';

interface ResultadoRango {
  nombre: string;
  unidad: string;
  filas: Serie[];
}

const MAX_DIAS = 30;
const DIA_MS = 1000 * 60 * 60 * 24;

// La API no tiene "rango": pedimos el/los año(s) completos y filtramos nosotros.
// Endpoint: GET /api/{indicador}/{yyyy}  (una o dos veces si el rango cruza de año)
export function ValorPorRango() {
  const [indicador, setIndicador] = useState('');
  const [inicio, setInicio] = useState('');
  const [termino, setTermino] = useState('');
  const { data, error, cargando, ejecutar, fallar, limpiar } = useConsulta<ResultadoRango>();

  function consultar(e: FormEvent) {
    e.preventDefault();
    if (inicio > termino) return fallar('La fecha de inicio no puede ser posterior a la de término.');
    const dias = (new Date(termino).getTime() - new Date(inicio).getTime()) / DIA_MS;
    if (dias > MAX_DIAS) return fallar(`El rango no puede superar los ${MAX_DIAS} días`);

    // Mejora respecto a la versión Angular: si el rango cruza de año (dic -> ene),
    // pedimos los dos años en paralelo con Promise.all.
    const anios = [...new Set([inicio.slice(0, 4), termino.slice(0, 4)])];

    ejecutar(
      async () => {
        const respuestas: RespuestaHistorica[] = await Promise.all(
          anios.map((a) => getIndicadorPorAnio(indicador, a)),
        );
        const filas = respuestas
          .flatMap((r) => r.serie)
          .filter((s) => {
            const f = soloFecha(s.fecha); // comparar "yyyy-mm-dd" como texto funciona
            return f >= inicio && f <= termino;
          })
          .sort((a, b) => soloFecha(a.fecha).localeCompare(soloFecha(b.fecha)));
        return { nombre: respuestas[0].nombre, unidad: respuestas[0].unidad_medida, filas };
      },
      (d) => (d.filas.length ? null : 'No hay datos en el rango seleccionado'),
    );
  }

  function limpiarCampos() {
    setIndicador('');
    setInicio('');
    setTermino('');
    limpiar();
  }

  return (
    <Tarjeta titulo="Busca un valor por rango de fecha">
      <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <SelectIndicador value={indicador} onChange={setIndicador} />
        </div>
        <div className="w-full sm:w-44">
          <Campo etiqueta="Fecha de inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className="w-full sm:w-44">
          <Campo etiqueta="Fecha de término" type="date" value={termino} onChange={(e) => setTermino(e.target.value)} />
        </div>
        <Boton type="submit" disabled={!indicador || !inicio || !termino || cargando}>
          {cargando ? 'Buscando...' : 'Buscar valores'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={limpiarCampos}>
          Limpiar
        </Boton>
      </form>

      <div className="mt-6">
        {data ? (
          <>
            <p className="mb-2 text-center text-sm text-slate-300">
              {data.nombre} · {data.filas.length} valores
            </p>
            <Tabla columnas={['Fecha', 'Valor']}>
              {data.filas.map((f) => (
                <tr key={f.fecha}>
                  <Td>{fechaCL(f.fecha)}</Td>
                  <Td>{formatValor(f.valor, data.unidad)}</Td>
                </tr>
              ))}
            </Tabla>
          </>
        ) : error ? (
          <Alerta>{error}</Alerta>
        ) : (
          <Mensaje>Selecciona un indicador y un rango de fechas (máx. {MAX_DIAS} días).</Mensaje>
        )}
      </div>
    </Tarjeta>
  );
}
