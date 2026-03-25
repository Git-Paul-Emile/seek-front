import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select", "@radix-ui/react-tabs", "@radix-ui/react-toast", "@radix-ui/react-tooltip", "@radix-ui/react-popover"],
          "vendor-charts": ["recharts"],
          "vendor-map": ["leaflet", "react-leaflet"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-editor": ["@tiptap/react", "@tiptap/starter-kit", "@tiptap/pm"],
          "vendor-utils": ["date-fns", "axios", "socket.io-client", "framer-motion"],
        },
      },
    },
  },
}));
