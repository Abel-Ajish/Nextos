import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to resolve the environment directory
  // This avoids the "Property 'cwd' does not exist on type 'Process'" TypeScript error
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Defines process.env.API_KEY globally for the app to access
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});