---
description: "Implement a feature from the ISSUES.md checklist following the project workflow"
---

# Implement Feature

You are implementing a new feature for the JS Editor project.

## 1. Select Task
- Check `ISSUES.md` for the next unchecked feature item
- Prioritize by dependencies and difficulty (easy tasks first)
- Read related documentation in `docs/` and `SPECS.md`

## 2. Design
- Analyze which component should own the new functionality
- Follow SOLID principles — avoid bloating existing classes
- Consider the block architecture: if the feature relates to content editing, it likely belongs in a block class or the Editor
- Consider toolbar integration: use `getToolbarConfig()` for new buttons
- Provide a detailed design summary and confirm with the user before implementing

## 3. Implement
- Use ES module `import`/`export` syntax
- Use instance methods on Editor — no new static methods
- No circular dependencies between blocks and toolbar
- Add `console.log` calls for debugging consistency
- Include `data-timestamp` updates for change tracking if modifying block content

## 4. Test
- Add tests in `tests/` directory
- Run only relevant tests during development: `npx jest tests/SpecificTest.test.js`
- Use `tests/testUtils.js` for helpers

## 5. Document
- Mark the feature as checked (`[x]`) in `ISSUES.md` with a completion note
- Update `SPECS.md` with new behavior
- Update relevant files in `docs/`
- Update `README.md` if the feature is user-facing
- Update `CHANGELOG.md` with the feature description

## 6. Commit and Tag
- Verify build: `npm run build`
- Verify tests: `npm test`
- Commit with descriptive message
- Create incremental version tag
