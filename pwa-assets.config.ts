import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Based on the minimal-2023 preset, but with no maskable icon (per requirement):
// - transparent: pwa-64/192/512 (transparent) + favicon.ico
// - apple:       apple-touch-icon-180x180 (opaque white background — iOS needs it)
// `maskable: { sizes: [] }` keeps the preset type-complete while emitting no maskable icon.
export default defineConfig({
  // Source must live under public/ so generated icons emit into dist/ (not next to the
  // source); public/notebook.svg also doubles as the SVG favicon referenced in index.html.
  images: ["public/notebook.svg"],
  preset: {
    ...minimal2023Preset,
    maskable: { sizes: [] },
  },
});
