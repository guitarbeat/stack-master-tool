import { ExpandableCard } from "@/components/ui/expandable-card"

const CollapsibleCardDemo = () => (
  <div className="p-6 space-y-4">
    <ExpandableCard trigger={<span>Collapsible Card</span>}>
      <p className="text-sm">
        This is the collapsible content inside the card.
      </p>
    </ExpandableCard>
  </div>
)

export default CollapsibleCardDemo
