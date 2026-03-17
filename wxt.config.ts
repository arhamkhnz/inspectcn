import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";

import path from "node:path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Inspectcn",
    description: "Chrome extension built with WXT, React, Tailwind CSS, and shadcn/ui.",
    action: {
      default_title: "inspectcn",
    },
    permissions: ["storage"],
  },
  alias: {
    "@": path.resolve("."),
  },
  vite: () =>
    ({
      plugins: [tailwindcss()],
    }) as WxtViteConfig,
});
