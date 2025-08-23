export type QueueType = 'direct-response' | 'point-of-info' | 'clarification'

export const QUEUE_TYPE_LABELS: Record<QueueType, string> = {
  'direct-response': 'Direct Response',
  'point-of-info': 'Point of Info',
  'clarification': 'Clarification'
}

export const QUEUE_TYPE_COLORS: Record<QueueType, string> = {
  'direct-response': 'bg-orange-100 text-orange-800',
  'point-of-info': 'bg-blue-100 text-blue-800',
  'clarification': 'bg-purple-100 text-purple-800'
}

const DEFAULT_LABEL = 'Speak'
const DEFAULT_COLOR = 'bg-sage-green/20 text-moss-green'

export const getQueueTypeLabel = (type?: string) =>
  QUEUE_TYPE_LABELS[type as QueueType] ?? DEFAULT_LABEL

export const getQueueTypeColor = (type?: string) =>
  QUEUE_TYPE_COLORS[type as QueueType] ?? DEFAULT_COLOR
