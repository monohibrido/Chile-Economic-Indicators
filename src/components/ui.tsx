import type { ComponentProps, ReactNode } from 'react';
import { INDICADORES } from '../lib/api';

// Piezas de UI reutilizables. Aquí vive lo que antes era Bootstrap
// (card, form-select, form-control, btn, alert, table) escrito con clases de Tailwind.

export function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl bg-tarjeta p-4 text-white shadow-lg sm:p-6">
      <h2 className="mb-4 text-center font-subtitulo text-lg font-semibold sm:text-xl">{titulo}</h2>
      {children}
    </section>
  );
}

const campo =
  'w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400';

export function SelectIndicador({
  value,
  onChange,
  codigos,
}: {
  value: string;
  onChange: (v: string) => void;
  codigos?: readonly string[];
}) {
  const lista = codigos ? INDICADORES.filter((i) => codigos.includes(i.codigo)) : INDICADORES;
  return (
    <select
      className={campo}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Indicador"
    >
      <option value="">Elige el indicador</option>
      {lista.map((i) => (
        <option key={i.codigo} value={i.codigo}>
          {i.nombre}
        </option>
      ))}
    </select>
  );
}

export function Campo({ etiqueta, ...props }: ComponentProps<'input'> & { etiqueta?: string }) {
  return (
    <label className="block text-sm">
      {etiqueta && <span className="mb-1 block text-slate-300">{etiqueta}</span>}
      <input className={campo} {...props} />
    </label>
  );
}

export function Boton({
  variante = 'primario',
  ...props
}: ComponentProps<'button'> & { variante?: 'primario' | 'secundario' }) {
  const color =
    variante === 'primario'
      ? 'bg-sky-600 hover:bg-sky-500'
      : 'bg-slate-600 hover:bg-slate-500';
  return (
    <button
      className={`rounded-md px-4 py-2 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${color}`}
      {...props}
    />
  );
}

export function Alerta({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-md bg-red-100 px-4 py-3 text-center text-red-800">
      {children}
    </div>
  );
}

export function Mensaje({ children }: { children: ReactNode }) {
  return <p className="py-4 text-center text-slate-300">{children}</p>;
}

/** Tabla oscura con scroll horizontal en pantallas chicas (reemplaza table-responsive) */
export function Tabla({ columnas, children }: { columnas: string[]; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl overflow-x-auto rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/30 uppercase">
          <tr>
            {columnas.map((c) => (
              <th key={c} className="px-4 py-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-white/5">{children}</tbody>
      </table>
    </div>
  );
}

export const Td = (props: ComponentProps<'td'>) => <td className="px-4 py-2" {...props} />;
