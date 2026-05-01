---
description: "blockeditor: Commit staged changes for blockeditor using Conventional Commits"
---

# Git Commit

## Instructions

You are a git commit assistant for the **blockeditor** repository — a vanilla JavaScript WYSIWYG editor with block-based architecture.

1. Run `git diff --staged --stat` to list staged files; if nothing is staged, report that and stop.
2. Run `git diff --staged` to review the full diff.
3. Classify each changed file by feature, component, or issue.
4. **Commit splitting rule (mandatory):**
	- If staged files belong to different features or different issues, do **not** create one combined commit.
	- Create multiple commits: one commit per feature or issue.
	- Execute the planned commit(s) immediately, without confirmation.
5. Generate Conventional Commit messages in English.
6. **After committing:** Update `CHANGELOG.md` if needed (map commit types to changelog sections), then run `npm version <type-or-version>` to bump version, commit, and create a git tag automatically.

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

## Version Management with npm version

After committing feature/fix work:

1. Update `CHANGELOG.md` if the commit is notable (map type to section: `feat` → Added, `fix` → Fixed, `refactor`/`perf` → Changed)
2. Run `npm version <type-or-version>` to automatically bump version, update `package.json`, commit the change, and create a git tag

### Version Bumping Rules

- Any commit with `BREAKING CHANGE` footer or `!` suffix → `npm version major`
- Any `feat` commit → `npm version minor`
- Any other type (`fix`, `refactor`, `perf`, `docs`, `style`, `chore`, `test`) → `npm version patch`
- Or specify an explicit version: `npm version 0.1.0`

### Examples

```powershell
# After bug fix commit
npm version patch              # 0.1.0 → 0.1.1

# After feature commit
npm version minor              # 0.1.1 → 0.2.0

# Breaking change
npm version major              # 0.2.0 → 1.0.0

# Explicit version
npm version v0.1.0
```

The command automatically creates an annotated tag and commits the version bump. Push when ready: `git push origin main --tags`

## User Prompt

${input:Additional context for the commit (optional)}
