---
name: update-legal-or-footer-links
description: Workflow command scaffold for update-legal-or-footer-links in tradescreen-ai-v2.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-legal-or-footer-links

Use this workflow when working on **update-legal-or-footer-links** in `tradescreen-ai-v2`.

## Goal

Adds or updates legal pages (Disclaimer, Privacy Policy, Terms of Use) and ensures footer and navigation links point to them.

## Common Files

- `client/src/pages/LegalPages.tsx`
- `client/src/components/shared.tsx`
- `client/src/pages/Landing.tsx`
- `client/src/components/AppLayout.tsx`
- `client/src/App.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update legal page components in client/src/pages/LegalPages.tsx (or similar)
- Update footer links in client/src/components/shared.tsx and/or client/src/pages/Landing.tsx
- Update navigation or layout in client/src/components/AppLayout.tsx if necessary
- Update client/src/App.tsx to register new routes for legal pages

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.