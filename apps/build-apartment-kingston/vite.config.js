import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Built into a /build-apartment-kingston/ subpath under the parent site.
// Dev server still serves at /.
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'build' ? '/build-apartment-kingston/' : '/',
}))
