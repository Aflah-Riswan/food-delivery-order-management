import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file based on current mode
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT) || 3000;

  return {
    plugins: [react()],
    server: {
      port,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
