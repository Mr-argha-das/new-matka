import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },

  optimizeDeps: {
    include: ["tinymce", "@tinymce/tinymce-react"],
  },

  build: {
    chunkSizeWarningLimit: 2000,

    commonjsOptions: {
      include: [/node_modules/, /tinymce/],
    },

    rollupOptions: {
      // ❌ external REMOVE KAR DIYA
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.split("node_modules/")[1].split("/")[0];
          }
        },
      },
    },
  },
});
