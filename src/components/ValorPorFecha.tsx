import { useState, type FormEvent } from 'react';
import { fechaCL, formatValor, getIndicadorPorFecha, hoyISO, type RespuestaHistorica } from '../lib/api';
import { useConsulta } from '../hooks/useConsulta';
import { Alerta, Boton, Campo, Mensaje, SelectIndicador, Tabla, Tarjeta, Td } from './ui';

// Endpoint: GET /api/{indicador}/{dd-mm-yyyy}
export function ValorPorFecha() {
  // Antes: [(ngModel)]. Ahora: estado + onChange ("componente controlado").
  const [indicador, setIndicador] = useState('');
  const [fecha, setFecha] = useState('');
  const { data, error, cargando, ejecutar, fallar, limpiar } = useConsulta<RespuestaHistorica>();

  function consultar(e: FormEvent) {
    e.preventDefault(); // equivalente a (ngSubmit)
    if (!indicador || !fecha) return fallar('Por favor, selecciona un indicador y una fecha.');
    if (fecha > hoyISO()) return fallar('No puedes consultar una fecha futura.');

    ejecutar(
      () => getIndicadorPorFecha(indicador, fecha),
      (d) => (d.serie?.length ? null : 'No hay datos para este indicador en la fecha seleccionada.'),
    );
  }

  function limpiarCampos() {
    setIndicador('');
    setFecha('');
    limpiar();
  }

  return (
    <Tarjeta titulo="Busca un valor por fecha">
      <form onSubmit={consultar} className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <SelectIndicador value={indicador} onChange={setIndicador} />
        </div>
        <div className="w-full sm:w-48">
          <Campo type="date" max={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <Boton type="submit" disabled={!indicador || !fecha || cargando}>
          {cargando ? 'Buscando...' : 'Buscar valor'}
        </Boton>
        <Boton type="button" variante="secundario" onClick={limpiarCampos}>
          Limpiar
        </Boton>
      </form>

      <div className="mt-6">
        {data ? (
          <Tabla columnas={['Indicador', 'Unidad', 'Fecha', 'Valor']}>
            <tr>
              <Td>{data.nombre}</Td>
              <Td>{data.unidad_medida}</Td>
              <Td>{fechaCL(data.serie[0].fecha)}</Td>
              <Td>{formatValor(data.serie[0].valor, data.unidad_medida)}</Td>
            </tr>
          </Tabla>
        ) : error ? (
          <Alerta>{error}</Alerta>
        ) : (
          <Mensaje>Selecciona un indicador y una fecha para comenzar.</Mensaje>
        )}
      </div>
    </Tarjeta>
  );
}
