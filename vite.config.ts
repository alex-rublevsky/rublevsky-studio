import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
		proxy: process.env.LOCAL_SERVER_FN
			? undefined
			: {
					// Proxy server function calls to production (default)
					// Set LOCAL_SERVER_FN=true to run server functions locally
					"/_serverFn": {
						target: "https://rublevsky.studio",
						changeOrigin: true,
						secure: true,
					},
				},
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
		exclude: [
			"sqlite",
			//"blake3-wasm"
		],
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
