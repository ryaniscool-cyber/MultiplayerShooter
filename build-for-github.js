
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

async function buildForGitHub() {
  try {
    // Clean up any existing docs directory
    if (fs.existsSync('docs')) {
      fs.rmSync('docs', { recursive: true });
    }

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
      rollupOptions: {
        input: path.resolve(process.cwd(), 'index.html'),
      },
    });
    
    console.log('Build completed! Files are in ./docs directory');
    console.log('Set GitHub Pages to serve from /docs folder');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildForGitHub();
