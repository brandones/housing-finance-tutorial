import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Built into a /kingston-housing-tutorial/ subpath under the parent site.
// Dev server still serves at /.
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'build' ? '/kingston-housing-tutorial/' : '/',
}))
