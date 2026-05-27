# housing-finance-tutorial

A monorepo of standalone web apps teaching housing finance concepts,
deployed as one Netlify site with each app served from its own subpath.

## Layout

```
apps/
  build-apartment-kingston/   Svelte + Vite tutorial, served at
                               /build-apartment-kingston/
build.sh                       Builds every apps/*/ and assembles a
                               combined dist/ with a landing page.
netlify.toml                   Tells Netlify to run npm run build and
                               publish dist/.
```

A request to `/` hits a small landing page listing each app.
A request to `/<app-name>/` hits that app.

## Local build

```sh
npm run build
npx serve dist
```

## Adding another app

1. Create `apps/<new-app>/` with its own `package.json`, source, and
   `vite.config.js` (set `base: '/<new-app>/'` in production).
2. Re-run `npm run build`. The landing page lists it automatically.
