import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 6001,
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:6000",
        changeOrigin: true,
      },
    },
  },
});
