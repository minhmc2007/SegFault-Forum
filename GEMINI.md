# GEMINI: Help Fix GitHub Pages Deployment

## Project
SegFault Forum — a React SPA hosted on GitHub Pages with Supabase backend.

**Repo:** https://github.com/minhmc2007/SegFault-Forum  
**Pages URL:** https://minhmc2007.github.io/SegFault-Forum/

## Current State
The site loads a white page. Console error:
```
src/main.tsx:1 Failed to load resource: the server responded with a status of 404
```

## Stack
- Vite 8 + React 19 + TypeScript 6
- React Router v7 (`createHashRouter`)
- Tailwind CSS 3 + shadcn/ui
- Supabase JS Client
- Hosted on GitHub Pages via GitHub Actions

## Config Files

### vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/SegFault-Forum/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### .github/workflows/deploy.yml
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Router (src/router/index.tsx)
Using `createHashRouter` from react-router-dom v7:
```
Routes: /, /post/:id, /create, /profile/:username, /search
```

### package.json
```json
{
  "name": "segfault-forum",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### Built dist/index.html
On build, assets correctly use `/SegFault-Forum/` prefix:
```html
<script type="module" crossorigin src="/SegFault-Forum/assets/index-xxxxx.js"></script>
<link rel="stylesheet" crossorigin href="/SegFault-Forum/assets/index-xxxxx.css">
```

## What I've Already Tried
1. ✅ Set `base: '/SegFault-Forum/'` in `vite.config.ts` so asset paths match the repo subdirectory
2. ✅ Switched from `createBrowserRouter` to `createHashRouter` to avoid 404s on page refresh
3. ✅ Built locally: `npm run build` produces correct asset paths
4. ✅ Verified built files exist in `dist/`
5. ✅ GitHub Actions workflow runs successfully (check Actions tab)

## Possible Issues I Suspect
1. **GitHub Pages not enabled** in repo Settings → Pages → Source set to "GitHub Actions" (must be set, not "Deploy from a branch")
2. **Environment not configured** — the workflow uses `environment: github-pages` — maybe this needs manual setup in repo Settings → Environments
3. **Node version mismatch** — workflow uses Node 20 but local is Node 26 (but build passes fine locally with TypeScript 6)
4. **Missing Pages deployment from Actions** — even if the workflow runs, Pages might not pick it up without the right configuration
5. **SPA routing still broken** — even with hash router, maybe the `actions/configure-pages` step isn't handling this correctly

## Questions for Gemini
1. Why would `src/main.tsx` return 404? The built dist doesn't include source `.tsx` files at all.
2. Is the `actions/configure-pages@v4` + `actions/deploy-pages@v4` combo correct for Vite SPAs?
3. Do I need any additional Vite config for GitHub Pages (like `build.outDir`, `build.assetsDir`)?
4. Does the user need to manually enable GitHub Pages in repo settings first?
5. Is there a conflict between the Pages deployment branch and the Actions deployment method?
