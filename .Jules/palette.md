## 2024-05-22 - Visual Feedback for Async Actions
**Learning:** Users lack confidence when async actions (like saving) don't provide immediate visual feedback. Adding a loading spinner to the "Save" button in `EditableField` significantly improves the perceived responsiveness.
**Action:** Always include a loading state (spinner or text change) for buttons that trigger async operations, especially for inline editing components.

## 2024-05-22 - Context-Aware ARIA Labels
**Learning:** Generic "Edit" buttons in lists (like `ParticipantList`) are confusing for screen reader users. Adding context (e.g., "Edit name for [Participant Name]") is essential.
**Action:** When using reusable components like `EditableField` in a list, always pass a specific `ariaLabel` prop constructed from the item's data.
