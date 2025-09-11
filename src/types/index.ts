export interface Participant {
  id: string;
  name: string;
  addedAt: Date;
}

export interface DirectResponseState {
  isActive: boolean;
  participantId: string;
  originalQueue: Participant[];
}

export interface SpecialIntervention {
  id: string;
  type: 'direct-response' | 'clarifying-question';
  participant: string;
  timestamp: Date;
}

export const INTERVENTION_TYPES = {
  'direct-response': 'Direct Response',
  'clarifying-question': 'Clarifying Question'
} as const;
