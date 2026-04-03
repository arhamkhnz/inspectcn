// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['./node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2']
          },
          {
            weight: '100 900',
            style: 'italic',
            src: ['./node_modules/geist/dist/fonts/geist-sans/Geist-Italic[wght].woff2']
          }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['./node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2']
          },
          {
            weight: '100 900',
            style: 'italic',
            src: ['./node_modules/geist/dist/fonts/geist-mono/GeistMono-Italic[wght].woff2']
          }
        ]
      }
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Pixel Line',
      cssVariable: '--font-geist-pixel-line',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Line.woff2']
          }
        ]
      }
    }
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
