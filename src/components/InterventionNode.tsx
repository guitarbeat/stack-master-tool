import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card } from '@/components/ui/card'

interface InterventionNodeData {
  type: string
  label: string
  emoji: string
  description: string
}

interface InterventionNodeProps {
  data: InterventionNodeData
}

export const InterventionNode = memo(({ data }: InterventionNodeProps) => {
  return (
    <>
      <Card className="p-4 min-w-[140px] hover:scale-105 transition-transform duration-200 cursor-grab active:cursor-grabbing glass-card">
        <div className="text-center space-y-2">
          <div className="text-2xl">{data.emoji}</div>
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.description}</div>
        </div>
      </Card>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !border-primary !w-3 !h-3"
      />
    </>
  )
})

InterventionNode.displayName = 'InterventionNode'