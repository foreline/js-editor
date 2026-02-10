---
description: "Fix a bug following the project's established workflow: analyze, implement, test, document, commit"
---

# Fix Bug Workflow

You are fixing a bug in the JS Editor project. Follow this workflow:

## 1. Analyze
- Read the bug description from `ISSUES.md`
- Examine the console log output to trace the execution flow (the project logs every method call)
- Identify which component owns the responsibility: `Editor.js`, a block class in `src/blocks/`, `KeyHandler.js`, `Toolbar.js`, `ToolbarHandlers.js`, or `Parser.js`
- Check for race conditions involving `isCreatingBlock` or `isConvertingBlock` flags

## 2. Propose
- Provide a detailed summary of the root cause and your fix strategy
- Confirm the approach with the user before writing code

## 3. Implement
- Follow SOLID principles — keep changes scoped to the responsible class
- Avoid introducing circular dependencies between blocks and toolbar
- Use instance methods, never add new static methods on `Editor`
- Keep `console.log` calls in new code for debugging consistency

## 4. Test
- Run only the relevant test file: `npx jest tests/SpecificTest.test.js`
- Add or update tests in `tests/` if needed. Use `tests/testUtils.js` for shared helpers
- Avoid running the full test suite unless verifying before commit

## 5. Document
- Mark the bug as checked (`[x]`) in `ISSUES.md` with a brief fix note
- Update `SPECS.md` if the fix changes documented behavior
- Update `CHANGELOG.md` with the fix description

## 6. Commit
- Ensure `npm run build` succeeds
- Ensure all tests pass with `npm test`
- Commit with a descriptive message
- Create an incremental version tag (check latest with `git tag --sort=-v:refname | Select-Object -First 5`)
