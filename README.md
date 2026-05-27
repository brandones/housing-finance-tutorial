# housing-finance-tutorial

A monorepo of standalone web apps teaching housing finance concepts.

## Layout

```
apps/
  kingston-housing-tutorial/   Svelte + Vite app: Kingston-specific
                               tutorial walking through private and
                               public housing finance in four chapters.
```

Each app lives in its own directory under `apps/`, with its own
`package.json`, build, and `netlify.toml`. To deploy an app to Netlify,
create a new Netlify site and set the **base directory** to the app's
folder (e.g., `apps/kingston-housing-tutorial`). Netlify will read the
app's `netlify.toml` from there.

## Adding another app

1. Create `apps/<new-app-name>/` with its own `package.json`, source,
   and `netlify.toml`.
2. On Netlify, create a new site pointing at this repo and set the
   base directory to `apps/<new-app-name>`.
