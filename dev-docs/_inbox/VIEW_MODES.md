# BlockEditor view modes issues

This document outlines issues related to the current implementation of view modes in BlockEditor. The BlockEditor supports three view modes: `edit` mode, where the editor is fully interactive; `markdown` view mode, where the content is rendered as Markdown; and `html` view mode, where the content is rendered as HTML.

## Problem Statement
- Different view containers are not consistent: `editor-markdown` container is a `<textarea>`, while `editor-html` is a `<div>`. This inconsistency can lead to confusion and maintenance issues.
- We lack of proper context switching. When the markdown view mode is activated, we still see the `edit` mode container, which is not ideal. The markdown view should replace the edit mode container, not coexist with it. The same applies to the HTML view mode.
- We want to drop the html tag ids and use class names instead, e.g. currently we have `id="editor-markdown"` and `id="editor-html"`, but we should use `class="bke-editor-markdown"` and `class="bke-editor-html"` instead. This will allow us to support multiple editor instances on the same page without id conflicts.
- Syntax Highlighting. We already have syntax highlighting for the CodeBlock. Why not extend it to the markdown and html view modes as well?
- Copy button for code blocks in markdown and html view modes. This would allow users to easily copy the rendered markdown or html content.
- `Style` html tags attributes. We still have some inline styles in the markdown and html view mode containers. We should move these styles to CSS classes instead for better maintainability and separation of concerns.