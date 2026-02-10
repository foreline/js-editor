---
description: "Prepare a release: build, test, tag, and update changelog"
---

# Release Workflow

Prepare a new release for the JS Editor project.

## Steps

### 1. Pre-flight Checks
- Run `npm run build` and verify it succeeds
- Run `npm test` and verify all tests pass
- Run `npm run build:lib` for library build verification
- Check for any uncommitted changes: `git status`

### 2. Version Tag
- Check the current latest tag:
  ```powershell
  git tag --sort=-v:refname | Select-Object -First 5
  ```
- Determine the next version increment (patch/minor/major) based on the changes

### 3. Update Changelog
- Update `CHANGELOG.md` with all changes since the last tag
- Follow the Keep a Changelog format
- Include the new version tag and date in the heading
- Group changes under: Added, Changed, Fixed, Removed

### 4. Commit and Tag
- Stage all changes: `git add .`
- Commit: `git commit -m "Release vX.Y.Z"`
- Create annotated tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`

### 5. Post-release
- Verify the tag: `git tag --sort=-v:refname | Select-Object -First 1`
- Push if remote is configured: `git push; git push --tags`
