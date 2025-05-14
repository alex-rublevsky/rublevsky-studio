// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";
import nitroCloudflareBindings from "nitro-cloudflare-dev";
var app_config_default = defineConfig({
  server: {
    preset: "cloudflare-module",
    unenv: cloudflare,
    modules: [nitroCloudflareBindings]
  },
  tsr: {
    appDirectory: "src"
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ]
  }
});
export {
  app_config_default as default
};
