## 2026-02-04 - Interactive Component Accessibility
**Learning:** `EditableField` component exposed a pattern where icon-only buttons (Save, Cancel, Edit) lacked ARIA labels, making them invisible to screen readers despite being interactive.
**Action:** Always inspect reusable UI components (`src/components/ui/*`) for missing `aria-label`s on icon buttons when using them in new contexts.
