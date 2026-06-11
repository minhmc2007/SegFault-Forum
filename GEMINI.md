# GEMINI: Fix GitHub Pages Deployment (Updated)

## Project
SegFault Forum — React SPA on GitHub Pages + Supabase.

**Repo:** https://github.com/minhmc2007/SegFault-Forum  
**Pages URL:** https://minhmc2007.github.io/SegFault-Forum/

## Symptom
White page. Console: `src/main.tsx:1 Failed to load resource: the server responded with a status of 404 ()`

## What We've Verified

### 1. The deployed HTML is the SOURCE file, not the built one
Fetching the live page returns:
```html
<script type="module" src="/src/main.tsx"></script>
```
But the **built** `dist/index.html` correctly has:
```html
<script type="module" crossorigin src="/SegFault-Forum/assets/index-xxxxx.js"></script>
<link rel="stylesheet" crossorigin href="/SegFault-Forum/assets/index-xxxxx.css">
```

This means GitHub Pages is serving the raw repo root, not the built `dist/` directory.

### 2. Local build works perfectly
```
npm run build  ✅ (tsc + vite, no errors)
```
Built `dist/` contains correct files with correct paths.

### 3. GitHub Actions deploy.yml
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

### 4. Router uses `createHashRouter` (to avoid SPA 404s)

### 5. Vite config has `base: '/SegFault-Forum/'`

## What's Already Been Tried
1. ✅ Set Vite `base: '/SegFault-Forum/'` 
2. ✅ Switched to `createHashRouter`
3. ✅ Changed Pages Source from "Deploy from a branch" to "GitHub Actions" (in repo Settings → Pages)
4. ✅ Verified `dist/index.html` has correct asset paths
5. ✅ GitHub Actions workflow runs successfully (green checkmark in Actions tab)

## Why It Still Fails
Despite switching to "GitHub Actions" source, the live page still serves the raw repo `index.html` with `/src/main.tsx`. Possible causes:

1. **Workflow environment not created** — `environment: github-pages` in the workflow requires the environment to exist in Settings → Environments. Maybe it was never auto-created.
2. **No new workflow run after changing source** — The source change might require a fresh push to trigger a new deployment that uses the Actions-based pipeline.
3. **GitHub Pages deployment URL doesn't match** — The `actions/deploy-pages` uploads to GitHub's internal artifact storage, but the Pages URL (`minhmc2007.github.io/SegFault-Forum/`) might still be pointed at the old branch-based deployment.
4. **Secret Pages configuration** — Maybe Pages is configured to deploy from `gh-pages` branch AND Actions, creating a conflict.

## Questions for Claude
1. Why would GitHub Pages serve raw repo files even after switching Source to "GitHub Actions"?
2. Do we need to manually trigger a new workflow run after changing the source setting?
3. Could the `environment: github-pages` block in the workflow block deployment if not manually created first?
4. Is there a way to check the actual deployment status via `curl` or the GitHub API to confirm what Source Pages is actually using?
5. Should we try a simpler approach: remove the `environment` block from the workflow, or switch to deploying to the `gh-pages` branch directly via `peaceiris/actions-gh-pages`?
