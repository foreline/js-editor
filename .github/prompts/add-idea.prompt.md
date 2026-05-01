---
description: "Capture a raw idea into the dev-docs/_inbox/ backlog for later triage"
---

# Add Idea

You are capturing a new idea for the BlockEditor project.

## Instructions

1. Ask the user to describe the idea if not already provided.
2. Use the `inbox-writer` skill to create a structured inbox item in `dev-docs/_inbox/`.
3. Set frontmatter fields:
   - `type: idea`
   - `priority`: infer from user's description (default: `medium`)
   - `status: inbox`
   - `date`: today's date
4. Fill in all template sections. For **Open Questions**, think critically about what needs research before this can become a proposal.
5. Confirm the created file path to the user.

## Notes
- Ideas are raw — capture intent, don't design solutions.
- If the idea is clearly a proposal (well-scoped, actionable), suggest the user use `/add-proposal` instead.
- If the idea is clearly a bug, suggest `/report-bug` instead.
