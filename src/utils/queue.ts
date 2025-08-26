interface QueueTypeInfo {
  display: string
  color: string
}

const queueTypeMap: Record<string, QueueTypeInfo> = {
  'direct-response': {
    display: 'Direct Response',
    color: 'bg-orange-100 text-orange-800'
  },
  'point-of-info': {
    display: 'Point of Info',
    color: 'bg-blue-100 text-blue-800'
  },
  clarification: {
    display: 'Clarification',
    color: 'bg-purple-100 text-purple-800'
  }
}

const defaultQueueType: QueueTypeInfo = {
  display: 'Speak',
  color: 'bg-sage-green/20 text-moss-green'
}

export function getQueueTypeDisplay(type: string): string {
  return (queueTypeMap[type] ?? defaultQueueType).display
}

export function getQueueTypeColor(type: string): string {
  return (queueTypeMap[type] ?? defaultQueueType).color
}

