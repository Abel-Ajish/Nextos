
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Defines process.env.API_KEY globally for the app to access
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
