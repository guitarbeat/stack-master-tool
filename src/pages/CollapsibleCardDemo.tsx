import { CollapsibleCard } from "@/components/ui/CollapsibleCard"

const CollapsibleCardDemo = () => (
  <div className="p-6 space-y-4">
    <CollapsibleCard title="Collapsible Card">
      <p className="text-sm text-[hsl(var(--earthy-brown))]">
        This is the collapsible content inside the card.
      </p>
    </CollapsibleCard>
  </div>
)

export default CollapsibleCardDemo
