#!/usr/bin/env bash
# Build every app under apps/* and assemble a combined dist/ that Netlify
# can publish. Each app ends up at dist/<app-name>/, plus a small landing
# page at dist/index.html that links to all of them.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

rm -rf dist
mkdir -p dist

apps=()
for app in apps/*/; do
  app_name="$(basename "$app")"
  apps+=("$app_name")
  echo "==> Building $app_name"
  (
    cd "$app"
    npm ci --no-audit --no-fund
    npm run build
  )
  mkdir -p "dist/$app_name"
  cp -R "$app"dist/. "dist/$app_name/"
done

# Landing page listing each app
{
  cat <<'HEAD'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Housing finance tutorial</title>
  <link href="https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background: #f8f6f4; color: #2b2724; max-width: 480px; margin: 48px auto; padding: 16px; }
    h1 { font-family: 'Cardo', serif; font-size: 28px; margin: 0 0 4px; }
    .tag { font-size: 12px; color: #8a847e; margin: 0 0 24px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { background: #ffffff; border: 1px solid #e6e2dc; border-radius: 6px; margin-bottom: 8px; }
    a { display: block; padding: 14px 16px; color: #2b2724; text-decoration: none; font-family: 'Cardo', serif; font-size: 17px; font-weight: 700; }
    a:hover { background: #fbfaf7; }
  </style>
</head>
<body>
  <h1>Housing finance tutorial</h1>
  <p class="tag">Brandon Istenes / Rent &amp; Rentier</p>
  <ul>
HEAD

  for app_name in "${apps[@]}"; do
    # Convert kebab-case to title-style label (e.g. kingston-housing → Kingston housing)
    label="$(echo "$app_name" | awk '{ gsub(/-/, " "); print toupper(substr($0,1,1)) substr($0,2) }')"
    echo "    <li><a href=\"/$app_name/\">$label</a></li>"
  done

  cat <<'TAIL'
  </ul>
</body>
</html>
TAIL
} > dist/index.html

echo "==> Done. Combined dist at $ROOT/dist"
