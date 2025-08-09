import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('✅ Explicit VITE_ZKLOGIN_CLIENT_ID:', env.VITE_ZKLOGIN_CLIENT_ID); // Debug print

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_ZKLOGIN_CLIENT_ID': JSON.stringify(env.VITE_ZKLOGIN_CLIENT_ID),
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
    },
    optimizeDeps: {
      include: ['@react-oauth/google'],
    },
  };
});
