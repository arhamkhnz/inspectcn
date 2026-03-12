import path from 'node:path';
import { defineConfig, type WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Inspectcn',
    description: 'Chrome extension built with WXT, React, Tailwind CSS, and shadcn/ui.',
    action: {
      default_title: 'inspectcn',
    },
  },
  alias: {
    '@': path.resolve('.'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }) as WxtViteConfig,
});
