import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    https: {
      key: resolve(homedir(), '.rushstack/rushstack-serve.key'),
      cert: resolve(homedir(), '.rushstack/rushstack-serve.pem')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
