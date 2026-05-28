import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build a single self-contained HTML file with all JS/CSS inlined,
// suitable for pasting into a blog or hosting as one static file.
// Output goes to dist-embed/index.html.
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
  },
})
