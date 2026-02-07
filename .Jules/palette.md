## 2026-02-04 - Interactive Component Accessibility
**Learning:** `EditableField` component exposed a pattern where icon-only buttons (Save, Cancel, Edit) lacked ARIA labels, making them invisible to screen readers despite being interactive.
**Action:** Always inspect reusable UI components (`src/components/ui/*`) for missing `aria-label`s on icon buttons when using them in new contexts.

## 2026-02-04 - Context-Aware ARIA Labels
**Learning:** Generic components like `EditableField` often default to generic ARIA labels ("Edit", "Save"), which are confusing in lists. Passing a context-specific `ariaLabel` prop (e.g., the item name) makes the interface much more navigable for screen readers.
**Action:** When creating or modifying generic action components, always add an optional `ariaLabel` or `context` prop to override default labels.
