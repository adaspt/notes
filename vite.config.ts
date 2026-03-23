import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import tailwindcss from '@tailwindcss/vite';

function serviceWorkerBuildHash(): Plugin {
  return {
    name: 'sw-build-hash',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve(import.meta.dirname, 'dist/service-worker.js');
      const content = fs.readFileSync(swPath, 'utf-8');
      const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
      fs.writeFileSync(swPath, content.replace('__BUILD_HASH__', hash));
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerBuildHash()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    rolldownOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        redirect: path.resolve(import.meta.dirname, 'redirect.html')
      }
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
