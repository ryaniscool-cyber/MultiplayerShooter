import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

async function buildClient() {
  try {
    await build({
      plugins: [react()],
      root: 'client',
      build: {
        outDir: '../docs',
        emptyOutDir: true,
      },
      publicDir: 'public',
      base: './',
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), './client/src'),
        },
      },
    });
    console.log('Client build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildClient();