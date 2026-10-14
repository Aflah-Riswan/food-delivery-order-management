import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file based on current mode
  const env = loadEnv(mode, process.cwd(), '');
  const frontendPort = Number(env.PORT) || 5173;
  const backendPort = Number(env.BACKEND_PORT) || 3001;

  return {
    plugins: [react()],
    server: {
      port : frontendPort,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
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
