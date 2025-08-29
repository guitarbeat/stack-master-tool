import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, ArrowDown } from 'lucide-react'
import { Participant } from '@/types'

interface StackDropZoneData {
  label: string
  participants?: Participant[]
  selectedParticipant?: string
  onParticipantSelect?: (participantName: string) => void
}

interface StackDropZoneProps {
  data: StackDropZoneData
}

export const StackDropZone = memo(({ data }: StackDropZoneProps) => {
  const { participants = [], selectedParticipant, onParticipantSelect } = data

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-accent !border-accent !w-4 !h-4"
      />
      <Card className="p-6 min-w-[280px] glass-card border-dashed border-2 border-accent/50 hover:border-accent transition-colors">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Users className="w-6 h-6" />
            <ArrowDown className="w-4 h-4" />
          </div>
          <div className="font-semibold text-lg">{data.label}</div>
          
          {participants.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Select participant:</div>
              <Select value={selectedParticipant} onValueChange={onParticipantSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose who to add..." />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.name}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Drag interventions here to add to queue
          </div>
        </div>
      </Card>
    </>
  )
})

StackDropZone.displayName = 'StackDropZone'