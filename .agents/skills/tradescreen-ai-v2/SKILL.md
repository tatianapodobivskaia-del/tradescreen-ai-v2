```markdown
# tradescreen-ai-v2 Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on contributing to the `tradescreen-ai-v2` codebase, a TypeScript project using the Vite framework. It covers coding conventions, common workflows for adding pages and updating legal/footer links, and testing patterns. By following these patterns, contributors can ensure consistency and maintainability across the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `appLayout.tsx`, `landingPage.tsx`, `tradeScreen.tsx`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { AppLayout } from '@/components/AppLayout';
    import { Landing } from '@/pages/Landing';
    ```

### Export Style
- Use **named exports** for components and utilities.
  - Example:
    ```typescript
    // In client/src/components/AppLayout.tsx
    export const AppLayout = () => { /* ... */ };
    ```

### Commit Patterns
- Commits are freeform, sometimes prefixed with `checkpoint`.
- Average commit message length: ~294 characters.

## Workflows

### Add or Update App Page
**Trigger:** When introducing a new page or making significant changes to an existing app page.  
**Command:** `/new-page`

1. **Create or modify a page component**  
   - File location: `client/src/pages/PageName.tsx`
   - Example:
     ```typescript
     // client/src/pages/TradeHistory.tsx
     export const TradeHistory = () => (
       <div>Trade History Page</div>
     );
     ```
2. **Update navigation or layout components**  
   - Edit `client/src/components/AppLayout.tsx` or `client/src/components/shared.tsx` to include the new/updated page in navigation.
   - Example:
     ```typescript
     // Add to navigation array
     { name: 'Trade History', path: '/trade-history' }
     ```
3. **Register the new route**  
   - Update `client/src/App.tsx` to add or adjust routing logic.
   - Example:
     ```typescript
     import { TradeHistory } from '@/pages/TradeHistory';
     // ...
     <Route path="/trade-history" element={<TradeHistory />} />
     ```
4. **(Optional) Update landing page references**  
   - If the landing page links to the new/updated page, update `client/src/pages/Landing.tsx`.

### Update Legal or Footer Links
**Trigger:** When adding or updating legal information (e.g., Disclaimer, Privacy Policy, Terms of Use) and ensuring UI links are correct.  
**Command:** `/update-legal`

1. **Create or update legal page components**  
   - File location: `client/src/pages/LegalPages.tsx` (or similar).
   - Example:
     ```typescript
     // client/src/pages/LegalPages.tsx
     export const PrivacyPolicy = () => (
       <div>Privacy Policy Content</div>
     );
     ```
2. **Update footer links**  
   - Edit `client/src/components/shared.tsx` and/or `client/src/pages/Landing.tsx` to add or update links to legal pages.
   - Example:
     ```typescript
     <a href="/privacy-policy">Privacy Policy</a>
     ```
3. **Update navigation or layout if necessary**  
   - Modify `client/src/components/AppLayout.tsx` to include legal links in navigation if required.
4. **Register new routes for legal pages**  
   - Update `client/src/App.tsx` to add routes for legal pages.
   - Example:
     ```typescript
     import { PrivacyPolicy } from '@/pages/LegalPages';
     <Route path="/privacy-policy" element={<PrivacyPolicy />} />
     ```

## Testing Patterns

- **Test files** follow the pattern: `*.test.*`
  - Example: `tradeScreen.test.tsx`
- **Testing framework** is not explicitly identified; check existing test files for conventions.
- Place tests alongside the files they cover or in a dedicated `__tests__` directory.

## Commands

| Command        | Purpose                                                        |
|----------------|----------------------------------------------------------------|
| /new-page      | Add or update an app page, including navigation and routing    |
| /update-legal  | Add or update legal pages and ensure footer/navigation links   |
```
