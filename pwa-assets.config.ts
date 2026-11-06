import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// `npm run icons` regenerates the PNG icons in public/ from public/favicon.svg.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0e1014' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0e1014' } }
  },
  images: ['public/favicon.svg']
});
