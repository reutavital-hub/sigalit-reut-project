import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// const apiTarget =
//   process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000'
  
const apiTarget =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

//פרוקסי מתפקד כמתווך בשביל הקונטיינר
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})