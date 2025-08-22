export interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

export interface SpecialIntervention {
  id: string;
  type: 'direct-response' | 'clarifying-question' | 'point-of-process';
  participant: string;
  timestamp: Date;
}

export const INTERVENTION_TYPES = {
  'direct-response': 'Direct Response',
  'clarifying-question': 'Clarifying Question', 
  'point-of-process': 'Point of Process'
} as const;