import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    // Eliminamos la definición de la API KEY aquí por seguridad; 
    // la clave debe vivir solo en el servidor (server.js).
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist', // Asegura que la salida sea la carpeta 'dist' en la raíz
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Redirige las llamadas de la API al servidor local durante el desarrollo
        '/api': 'http://localhost:10000',
      },
    },
  };
});