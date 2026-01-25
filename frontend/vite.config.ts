
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log(path.resolve(__dirname, "./src"));


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Map '@' to 'src'
    },
  },
})
