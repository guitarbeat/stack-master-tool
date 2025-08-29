import { useState, useCallback } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { InterventionNode } from './InterventionNode'
import { StackDropZone } from './StackDropZone'
import { Participant, SpecialIntervention, INTERVENTION_TYPES } from '@/types'

interface InterventionFlowProps {
  participants: Participant[]
  onIntervention: (type: SpecialIntervention['type'], participantName: string) => void
}

const nodeTypes: NodeTypes = {
  intervention: InterventionNode,
  dropzone: StackDropZone,
}

const initialNodes: Node[] = [
  {
    id: 'dropzone',
    type: 'dropzone',
    position: { x: 350, y: 50 },
    data: { label: 'Speaking Queue' },
    draggable: false,
  },
  {
    id: 'direct-response',
    type: 'intervention',
    position: { x: 100, y: 200 },
    data: { 
      type: 'direct-response',
      label: 'Direct Response',
      emoji: '↩️',
      description: 'Immediate reply needed'
    },
  },
  {
    id: 'clarifying-question',
    type: 'intervention',
    position: { x: 350, y: 200 },
    data: { 
      type: 'clarifying-question',
      label: 'Clarifying Question',
      emoji: '❓',
      description: 'Need more information'
    },
  },
  {
    id: 'point-of-process',
    type: 'intervention',
    position: { x: 600, y: 200 },
    data: { 
      type: 'point-of-process',
      label: 'Point of Process',
      emoji: '⚖️',
      description: 'Procedural concern'
    },
  },
]

export const InterventionFlow = ({ participants, onIntervention }: InterventionFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')

  const onConnect = useCallback(
    (params: Connection) => {
      // When connecting intervention to dropzone
      if (params.target === 'dropzone' && params.source) {
        const interventionNode = nodes.find(n => n.id === params.source)
        if (interventionNode && selectedParticipant) {
          onIntervention(
            interventionNode.data.type as SpecialIntervention['type'],
            selectedParticipant
          )
          // Don't actually create the edge, just trigger the intervention
          return
        }
      }
      setEdges((eds) => addEdge(params, eds))
    },
    [nodes, selectedParticipant, onIntervention, setEdges]
  )

  // Update dropzone with participant selection
  const updatedNodes = nodes.map(node => {
    if (node.id === 'dropzone') {
      return {
        ...node,
        data: {
          ...node.data,
          participants,
          selectedParticipant,
          onParticipantSelect: setSelectedParticipant
        }
      }
    }
    return node
  })

  return (
    <div className="h-96 w-full">
      <ReactFlow
        nodes={updatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background rounded-xl border border-border/50"
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}