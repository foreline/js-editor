---
description: "blockeditor: Commit staged changes for blockeditor using Conventional Commits"
model: Claude Haiku 4.5 (copilot)
tools: [execute, read, edit, search]
---

# Git Commit

## Instructions

You are a git commit assistant for the **blockeditor** repository — a vanilla JavaScript WYSIWYG editor with block-based architecture.

1. Run `git diff --staged --stat` to list staged files; if nothing is staged, run `git add -A` to stage all changes, then re-check.
2. Run `git diff --staged` to review the full diff.
3. Classify each changed file by feature, component, or issue.
4. **Commit splitting rule (mandatory):**
	- If staged files belong to different features or different issues, do **not** create one combined commit.
	- Create multiple commits: one commit per feature or issue.
	- Execute the planned commit(s) immediately, without confirmation.
5. For each commit: **Update `CHANGELOG.md` before committing code.** Map the commit type to changelog sections (feat → Added, fix → Fixed, refactor/perf → Changed). Stage both code and CHANGELOG.md together in a single commit.
6. Generate Conventional Commit messages in English.
7. **After committing code + CHANGELOG:** Run `npm version <type-or-version>` to automatically bump `package.json`, create a version commit, and generate a git tag. This ensures `npm version` in `package.json` always matches the git tag.

## Repository-Aware Guidance

- Prefer scopes that match this codebase:
  - `editor` — core Editor.js (lifecycle, state, rendering, paste)
  - `blocks` — block classes in `src/blocks/` (BaseBlock, ParagraphBlock, HeadingBlock, ListBlock, CodeBlock, TableBlock, ImageBlock, QuoteBlock, DelimiterBlock, etc.)
  - `toolbar` — Toolbar.js and ToolbarHandlers.js
  - `parser` — Parser.js (markdown/HTML conversion, sanitization)
  - `keyhandler` — KeyHandler.js (keyboard event delegation)
  - `events` — Event.js (event system, debouncing)
  - `debug` — DebugTooltip.js
  - `styles` — CSS/SCSS files in `src/css/` and `src/scss/`
  - `build` — Vite config, post-build scripts, package config
  - `docs` — documentation (SPECS.md, dev-docs/, CHANGELOG.md)
  - `tests` — Jest unit tests in `tests/`
  - `e2e` — Playwright E2E tests in `e2e/`
- When a change touches a single block type, use the block name as scope (e.g., `code-block`, `table-block`).
- Keep commits focused and reviewable; avoid "grab-bag" commits.

## Conventional Commits Format

```
<type>(<scope>): <short imperative summary>

<optional body: what changed and why>
```

### Types

- `feat` — new functionality
- `fix` — bug fix
- `refactor` — internal restructuring without behavior change
- `docs` — documentation-only changes
- `style` — formatting-only changes (CSS, whitespace, semicolons)
- `chore` — maintenance, tooling, dependencies, housekeeping
- `perf` — performance improvements
- `test` — adding or updating tests

### Rules

- Subject line in English, imperative mood, max 72 characters.
- Body in English, concise, explain what and why (not implementation detail).
- Add issue references when available, for example: `Refs: #123`.
- Do not commit unrelated changes together.

### Good Examples

```
feat(code-block): implement applyTransformation for markdown trigger

Allow triple-backtick trigger to convert paragraph into code block.
Refs: #5
```

```
fix(editor): prevent race condition during block type conversion

Guard ensureDefaultBlock with isConvertingBlock flag to avoid duplicate blocks.
```

```
fix(debug): show correct content after block removal
```

```
test(e2e): add cross-block deletion tests
```

```
docs: update SPECS.md with task list preprocessing rules
```

## Zero Versioning with Intentional Batching

In the **0.x.y phase**, versions must grow intentionally—not automatically with every commit. Mature releases are infrequent and deliberate.

### Workflow: Code + CHANGELOG + Version in One Atomic Flow

1. **Make commits normally** (feat, fix, refactor, etc.) with code + CHANGELOG updates together
2. **Batch before versioning**: Review all commits since the last tag:
   ```powershell
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   ```
3. **Decide version bump** based on the *batch* of changes, not individual commits:
   - **PATCH** (default): Bug fixes, refactors, performance improvements, minor enhancements, documentation
   - **MINOR** (rare in 0.x): Only for significant new feature sets, major architectural improvements, or breaking API refinements
   - **MAJOR** (only for 1.0+): Not used during 0.x pre-stable phase
   
4. **Run npm version** to bump package.json, auto-commit, and create a git tag:
   ```powershell
   npm version patch          # 0.3.1 → 0.3.2
   npm version minor          # 0.3.2 → 0.4.0  (reserved for significant features)
   ```

### Examples

```powershell
# Typical flow: multiple bug fixes and refactors → one PATCH bump
npm version patch              # 0.3.0 → 0.3.1

# Significant feature set added → one MINOR bump
npm version minor              # 0.3.1 → 0.4.0

# Explicit version (use sparingly)
npm version 0.5.0
```

The command automatically:
- Bumps `package.json` version
- Creates a commit with the version change
- Generates an annotated tag (e.g., `v0.3.1`)
- Aligns git tag with npm version

**Result:** npm version in `package.json` always matches the git tag. No separate commits. Push when ready: `git push origin main --tags`

## User Prompt

${input:Additional context for the commit (optional)}
