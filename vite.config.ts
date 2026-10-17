import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind v4 se integra como plugin de Vite: no hay tailwind.config.js ni postcss.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
