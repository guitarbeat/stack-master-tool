export function getQueueTypeDisplay(type: string): string {
  switch (type) {
    case 'direct-response':
      return 'Direct Response'
    case 'point-of-info':
      return 'Point of Info'
    case 'clarification':
      return 'Clarification'
    default:
      return 'Speak'
  }
}

export function getQueueTypeColor(type: string): string {
  switch (type) {
    case 'direct-response':
      return 'bg-orange-100 text-orange-800'
    case 'point-of-info':
      return 'bg-blue-100 text-blue-800'
    case 'clarification':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-sage-green/20 text-moss-green'
  }
}

