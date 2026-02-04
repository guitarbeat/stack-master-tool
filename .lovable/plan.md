
# Consolidate Config Directories to Root-Level Strategy

## Overview

The project has config files scattered across three locations:
- **`config/`** - Contains `vite.config.ts` (wrapper that re-exports root)
- **`.config/`** - Contains `eslint.config.js`, `tailwind.config.ts`, `.gitignore`
- **Root** - Contains `eslint.config.js` (wrapper), `vite.config.ts` (actual), `vitest.config.ts`

This creates unnecessary indirection and confusion. We'll consolidate everything to root-level.

---

## Current State

| File | Location | Purpose |
|------|----------|---------|
| `vite.config.ts` | Root | Actual config |
| `vite.config.ts` | `config/` | Wrapper (re-exports root) |
| `eslint.config.js` | Root | Wrapper (imports `.config/`) |
| `eslint.config.js` | `.config/` | Actual config |
| `tailwind.config.ts` | `.config/` | Actual config |
| `vitest.config.ts` | Root | Actual config |

---

## Implementation Plan

### Step 1: Merge ESLint Config to Root
Move the actual ESLint configuration from `.config/eslint.config.js` into root `eslint.config.js`, replacing the wrapper.

### Step 2: Create Root Tailwind Config  
Move `.config/tailwind.config.ts` to root `tailwind.config.ts` (file appears in listing but doesn't exist - needs creation).

### Step 3: Delete Config Directory Wrappers
- Delete `config/vite.config.ts` (wrapper no longer needed)
- Delete `config/` directory entirely

### Step 4: Delete .config Directory
- Delete `.config/eslint.config.js` 
- Delete `.config/tailwind.config.ts`
- Delete `.config/.gitignore` (redundant, root `.gitignore` is comprehensive)
- Delete `.config/` directory

### Step 5: Update package.json Scripts
Remove `--config config/vite.config.ts` from all scripts since Vite auto-detects root config:

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "build:prod": "vite build --mode production",
  "build:analyze": "vite build --mode production --reporter verbose",
  "preview": "vite preview",
  "preview:prod": "vite preview --host 0.0.0.0"
}
```

### Step 6: Update PROJECT_STRUCTURE.md
Remove references to the `config/` and `.config/` directories since they no longer exist.

---

## Files Changed

| Action | File |
|--------|------|
| Replace | `eslint.config.js` (root) - full ESLint config |
| Create | `tailwind.config.ts` (root) - from `.config/tailwind.config.ts` |
| Edit | `package.json` - simplify vite script paths |
| Edit | `PROJECT_STRUCTURE.md` - update docs |
| Delete | `config/vite.config.ts` |
| Delete | `config/` directory |
| Delete | `.config/eslint.config.js` |
| Delete | `.config/tailwind.config.ts` |
| Delete | `.config/.gitignore` |
| Delete | `.config/` directory |

---

## Technical Notes

- ESLint config references `./config/tsconfig.app.json` for TypeScript parser - this path will need updating or the tsconfig reference may need removal if file doesn't exist
- The `.config/.gitignore` content is redundant with root `.gitignore`
- Vite automatically finds `vite.config.ts` in root, no explicit path needed
- Tailwind also auto-detects `tailwind.config.ts` in root

---

## Result

After consolidation, root will contain:
- `vite.config.ts` - Vite/build config
- `vitest.config.ts` - Test config  
- `eslint.config.js` - Linting config
- `tailwind.config.ts` - Styling config

No wrapper files, no subdirectories for configs.
