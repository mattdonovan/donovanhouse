# Developer notes

Kristin's guide is [README.md](README.md). This page is for Matt or anyone working on the code directly.

## Stack and commands

Vite 8, React 19, @react-three/fiber 9, drei 10, three 0.187. Node `^20.19` or `>=22.12` (CI uses 22). Static site, hash routes (`#/`, `#/about`, `#/work`, `#/work/<project-id>`).

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in site/dist
```

Spreads from a 16:9 PDF (macOS, needs Command Line Tools):

```bash
cd site
swift scripts/pdf-to-spreads.swift "Presentation.pdf" public/projects/<project-id>
```

Writes `spread-NN.jpg` (2048px) and `spread-NN-sm.jpg` (1024px). Then add an entry in `src/data/projects.js`.

**Deploy:** every push to `main` runs `.github/workflows/deploy.yml`, which builds `site/` with `BASE_PATH=/donovanhouse/` and publishes to GitHub Pages. Wrap public asset paths in `asset()` (`site/src/asset.js`).

## Code map (`site/src/`)

- `App.jsx`: pages (Landing, About, Work), Nav with auto-hiding header, Footer
- `data/projects.js`: all project content
- `components/Book.jsx`: skinned-mesh page turning, curve/flatten, press physics, blob shadow
- `components/Magazine.jsx`: spreads to page textures, end card (textures cached by `suspend()` keyed on project id)
- `components/covers.js`: canvas-drawn front cover, back cover, "Open project" end spread
- `components/Shelf.jsx`: project rows, one fixed canvas with a drei `View` per row, hover flip-through
- `components/Reader.jsx`: full-screen reader (magnify, flatten, zoom, pan, thumbnails, captions, lightbox)
- `hooks.js`, `asset.js`, `styles.css`

## Agent setup

- `CLAUDE.md`: project rules for Claude Code.
- `.claude/skills/`: `getting-started`, `publish`, `add-project`, `magazine-3d`, `design-review`.
- `DESIGN.md`: brand and interaction decisions (source of truth; `PLAN.md` is historical).
- Design review uses [Impeccable](https://impeccable.style) (Apache-2.0) when `.claude/skills/impeccable/` exists. Vendor it with `npx impeccable install --providers=claude --scope=project` at the repo root and commit.

## Permissions

Commit this as `.claude/settings.json` so Kristin's routine commands don't prompt. `git push` is deliberately left out.

```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git pull:*)",
      "Bash(git fetch:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(npm install)",
      "Bash(npm run dev)",
      "Bash(npm run build)",
      "Bash(swift scripts/pdf-to-spreads.swift:*)",
      "Bash(sips:*)",
      "Bash(gh run:*)",
      "Bash(gh auth status)"
    ]
  }
}
```

## Font licenses

`site/src/assets/fonts/` (PP Object Sans Heavy, Amsterdam Signature Three) is committed to this public repo, so the files are downloadable from GitHub. Check that the Pangram Pangram and MyFonts webfont terms allow this, or host them off-repo.
