import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { resolve } from "node:path";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    cloudflare({
      viteEnvironment: { name: "ssr" },
      configPath: "./wrangler.jsonc",
   }),
    tanstackStart(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['sqlite'
      //, 'blake3-wasm', 'better-sqlite3'
    ],
    //force: true,
  },
      // build: {
      //   rollupOptions: {
      //      external: ['sqlite'],
      //     output: {
      //       hoistTransitiveImports: false,
      //     },
      //     treeshake: false,
      //   },
      //   // Disable tree-shaking for problematic packages
      //   commonjsOptions: {
      //     include: [/node_modules/],
      //   },
      //   },

      //TODO: is this needed? can remove?
  // define: {
  //   global: 'globalThis',
  // },
  esbuild: {
    // Preserve function/class names for better stack traces
    keepNames: true,
  },
      // server: {
      //   proxy: {
      //     '/api': {
      //       target: 'http://localhost:8787',
      //       changeOrigin: true,
      //     },
      //   },
      // },
    
  build: {
    rollupOptions: {
      external: ["tsr:routes-manifest", "sqlite", "blake3-wasm"],
      // treeshake: {
      //   moduleSideEffects: 'no-external',
      // },
    },
  },
});
