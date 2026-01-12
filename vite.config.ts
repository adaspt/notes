import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import os from 'node:os';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    https: {
      key: path.resolve(os.homedir(), '.rushstack/rushstack-serve.key'),
      cert: path.resolve(os.homedir(), '.rushstack/rushstack-serve.pem')
    }
  }
});
