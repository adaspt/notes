import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), viteReact(), tailwindcss()],
  server: {
    https: {
      key: resolve(homedir(), '.rushstack/rushstack-serve.key'),
      cert: resolve(homedir(), '.rushstack/rushstack-serve.pem')
    }
  },
  build: {
    target: 'esnext',
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
