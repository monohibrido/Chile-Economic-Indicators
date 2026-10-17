import { INDICADORES, fechaCL, formatValor, type RespuestaIndicadoresHoy } from '../lib/api';
import { Alerta, Mensaje, Tarjeta } from './ui';

interface Props {
  datosHoy: RespuestaIndicadoresHoy | null;
  cargandoHoy: boolean;
  errorHoy: string | null;
}

// Endpoint: GET /api
// Los datos los pide App una sola vez y se comparten con el Conversor (llegan por props).
export function ValoresHoy({ datosHoy, cargandoHoy, errorHoy }: Props) {
  return (
    <Tarjeta titulo={datosHoy ? `Valores hoy: ${fechaCL(String(datosHoy.fecha))}` : 'Valores hoy'}>
      {cargandoHoy && <Mensaje>Cargando datos...</Mensaje>}
      {errorHoy && <Alerta>{errorHoy}</Alerta>}
      {datosHoy && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {INDICADORES.map(({ codigo, nombre }) => {
            const ind = datosHoy[codigo];
            if (!ind || typeof ind === 'string') return null;
            return (
              <div key={codigo} className="rounded-xl bg-black/25 p-3 text-center">
                <div className="text-xs uppercase tracking-wide text-slate-300">{nombre}</div>
                <div className="mt-1 text-lg font-semibold">{formatValor(ind.valor, ind.unidad_medida)}</div>
              </div>
            );
          })}
        </div>
      )}
    </Tarjeta>
  );
}
