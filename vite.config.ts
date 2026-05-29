import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), powerApps(), tailwindcss()],
  // base: "./", // This ensures paths are relative, not absolute
  build: {
    // This prevents small images from being turned into Base64 strings
    assetsInlineLimit: 1000000,
  },
  server: {
    port: 3000,
  },
});
