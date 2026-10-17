import { useEffect } from 'react';
import { getIndicadoresHoy, type RespuestaIndicadoresHoy } from './lib/api';
import { useConsulta } from './hooks/useConsulta';
import { ValoresHoy } from './components/ValoresHoy';
import { Conversor } from './components/Conversor';
import { ValorPorFecha } from './components/ValorPorFecha';
import { ValorPorRango } from './components/ValorPorRango';
import { GraficoAnual } from './components/GraficoAnual';
import { Ultimos30Dias } from './components/Ultimos30Dias';
import { Comparar } from './components/Comparar';

export default function App() {
  // Los valores de hoy se piden UNA vez aquí y se comparten con ValoresHoy y Conversor
  // (en React, cuando dos componentes necesitan el mismo dato, el estado "sube" al padre).
  const hoy = useConsulta<RespuestaIndicadoresHoy>();
  const { ejecutar } = hoy;
  useEffect(() => {
    ejecutar(getIndicadoresHoy);
  }, [ejecutar]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-slate-100 px-4 py-6">
      <h1 className="mb-6 text-center font-titulo text-3xl font-semibold text-slate-900 sm:text-4xl">
        Indicadores de valor en Chile
      </h1>
      <ValoresHoy datosHoy={hoy.data} cargandoHoy={hoy.cargando} errorHoy={hoy.error} />
      <Conversor datosHoy={hoy.data} />
      <ValorPorFecha />
      <ValorPorRango />
      <GraficoAnual />
      <Ultimos30Dias />
      <Comparar />
      <footer className="pb-4 text-center text-xs text-slate-500">
        <p>
          Hecho por{' '}
          <a className="font-semibold underline" href="https://daleclick.cl" target="_blank" rel="noreferrer">
            DaleClick
          </a>
        </p>
        <p className="mt-1">
          Datos: <a className="underline" href="https://mindicador.cl">mindicador.cl</a>
        </p>
      </footer>
    </main>
  );
}
