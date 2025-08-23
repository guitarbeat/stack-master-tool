# Accordion Card Example

This example demonstrates wrapping sets of cards in an accordion so that only one section expands at a time. The accordion uses the project's green and brown color palette for headers and content areas.

```tsx
import { CardAccordion } from "@/components/CardAccordion";

export default function Demo() {
  return <CardAccordion />;
}
```

The `Accordion` component is configured with `type="single"` and `collapsible` to ensure only one section can be open. Each section groups related cards, providing an organized and consistent experience.
