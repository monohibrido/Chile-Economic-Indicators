import { useCallback, useRef, useState } from 'react';

/**
 * Hook reutilizable para "pedir algo a la API y mostrar cargando / error / datos".
 * En Angular lo repetías en cada componente con 3 signals (resultados, errorMsg, cargando).
 * En React lo sacamos a un hook y los 5 componentes lo comparten.
 */
export function useConsulta<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  // Si el usuario consulta dos veces seguidas, ignoramos la respuesta vieja.
  const ultimaId = useRef(0);

  const ejecutar = useCallback(
    async (pedir: () => Promise<T>, mensajeSiVacio?: (d: T) => string | null) => {
      const id = ++ultimaId.current;
      setCargando(true);
      setError(null);
      try {
        const d = await pedir();
        if (id !== ultimaId.current) return;
        const vacio = mensajeSiVacio?.(d);
        if (vacio) {
          setData(null);
          setError(vacio);
        } else {
          setData(d);
        }
      } catch (e) {
        if (id !== ultimaId.current) return;
        console.error('API Error:', e);
        setData(null);
        setError('Error de conexión con la API.');
      } finally {
        if (id === ultimaId.current) setCargando(false);
      }
    },
    [],
  );

  /** Para errores de validación del formulario (antes de llamar a la API) */
  const fallar = useCallback((mensaje: string) => {
    ultimaId.current++;
    setData(null);
    setError(mensaje);
    setCargando(false);
  }, []);

  const limpiar = useCallback(() => {
    ultimaId.current++;
    setData(null);
    setError(null);
    setCargando(false);
  }, []);

  return { data, error, cargando, ejecutar, fallar, limpiar };
}
