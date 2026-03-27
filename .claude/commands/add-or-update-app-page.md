---
name: add-or-update-app-page
description: Workflow command scaffold for add-or-update-app-page in tradescreen-ai-v2.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-app-page

Use this workflow when working on **add-or-update-app-page** in `tradescreen-ai-v2`.

## Goal

Adds a new app page or updates an existing page, including related navigation, layout, and shared components.

## Common Files

- `client/src/pages/*.tsx`
- `client/src/components/AppLayout.tsx`
- `client/src/components/shared.tsx`
- `client/src/App.tsx`
- `client/src/pages/Landing.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify a file in client/src/pages/PageName.tsx
- Update navigation or layout components in client/src/components/AppLayout.tsx or client/src/components/shared.tsx to include the new/updated page
- Update client/src/App.tsx to register the new route or adjust routing logic
- Optionally update client/src/pages/Landing.tsx if the landing page references the new/updated page

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.