import {
  Users,
  QrCode,
  Eye,
  Shield,
  Clock,
  Users2,
  Zap,
  Heart,
  Globe,
  MessageSquare,
  Leaf
} from "lucide-react";

// Shared mode definitions to eliminate redundancy
export const MEETING_MODES = {
  host: {
    id: 'host',
    name: 'HOST',
    emoji: '🎯',
    title: 'HOST a Meeting',
    shortDesc: 'Facilitate & Control',
    fullDesc: 'Take charge as the meeting facilitator. Create your meeting room, manage the speaking queue, and ensure fair participation for all attendees.',
    joinDesc: 'Set up and facilitate',
    features: [
      'Create meeting room with unique code',
      'Control speaking queue manually',
      'Enable/disable remote participation',
      'Monitor speaking time distribution',
      'Full administrative controls'
    ],
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    bgBlob: 'bg-blue-50 dark:bg-blue-950/20',
    color: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverColor: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/50'
  },
  join: {
    id: 'join',
    name: 'JOIN',
    emoji: '🌿',
    title: 'JOIN a Meeting',
    shortDesc: 'Participate & Speak',
    fullDesc: 'Become an active participant in democratic discussions. Join the speaking queue, share your thoughts, and contribute to structured conversations.',
    joinDesc: 'Participate in discussions',
    features: [
      'Enter meeting code to join',
      'Raise hand to join speaking queue',
      'See your position in line',
      'Receive speaking turn notifications',
      'Contribute to group discussions'
    ],
    icon: QrCode,
    gradient: 'from-green-500 to-green-600',
    bgBlob: 'bg-green-50 dark:bg-green-950/20',
    color: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverColor: 'hover:shadow-green-100 dark:hover:shadow-green-900/50'
  },
  watch: {
    id: 'watch',
    name: 'WATCH',
    emoji: '👁️',
    title: 'WATCH a Meeting',
    shortDesc: 'Observe & Display',
    fullDesc: 'Observe meetings passively without participating. Perfect for stakeholders, note-takers, or displaying meetings on large screens.',
    joinDesc: 'Observe and display',
    features: [
      'Enter meeting code as observer',
      'View-only access (no participation)',
      'Optimized for display screens',
      'Real-time queue and speaker tracking',
      'Perfect for large audiences'
    ],
    icon: Eye,
    gradient: 'from-purple-500 to-purple-600',
    bgBlob: 'bg-purple-50 dark:bg-purple-950/20',
    color: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverColor: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/50'
  }
} as const;

export type MeetingMode = keyof typeof MEETING_MODES;

// Shared platform features
export const PLATFORM_FEATURES = [
  {
    icon: Shield,
    title: "Democratic Process",
    description: "Every voice matters with equal opportunity to contribute",
    benefits: ["Equal speaking time", "Transparent queue", "Fair rotation"]
  },
  {
    icon: Clock,
    title: "Sustainable Flow",
    description: "Natural conversation rhythm that respects all participants",
    benefits: ["Organic pacing", "Respectful timing", "Natural breaks"]
  },
  {
    icon: Users2,
    title: "Inclusive Design",
    description: "Accessible to all participants regardless of background",
    benefits: ["Universal access", "Cultural sensitivity", "Language support"]
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Instant updates keep everyone connected and informed",
    benefits: ["Live updates", "Instant notifications", "Seamless sync"]
  },
  {
    icon: Heart,
    title: "Human-centered",
    description: "Designed with empathy and human needs at the core",
    benefits: ["Emotional intelligence", "Compassionate design", "Wellness focus"]
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect participants from anywhere in the world",
    benefits: ["Remote access", "Time zone friendly", "Cross-cultural"]
  }
];

// Shared how it works steps
export const HOW_IT_WORKS_STEPS = [
  {
    icon: MessageSquare,
    title: "HOST a Meeting",
    summary: "Set up and facilitate",
    details: "As a facilitator, create a new meeting room with full control over the speaking queue. Enable remote access for participants to join, manage the discussion flow, and ensure fair participation."
  },
  {
    icon: Users,
    title: "JOIN a Meeting",
    summary: "Participate in discussions",
    details: "Enter a meeting code to join an active discussion. Raise your hand to join the speaking queue, see your position, and contribute to the democratic process with real-time feedback."
  },
  {
    icon: Leaf,
    title: "WATCH a Meeting",
    summary: "Observe and display",
    details: "Perfect for stakeholders and observers. View meetings in read-only mode with display-optimized layouts, speaking analytics, and real-time queue visualization - no participation required."
  }
];

// Shared CTA content
export const CTA_CONTENT = {
  platform: {
    title: "Choose Your Mode",
    description: "HOST to facilitate, JOIN to participate, or WATCH to observe - each mode is designed for your specific role in democratic discussions.",
    emojis: ['🎯', '🌿', '👁️']
  },
  tool: {
    title: "Try the Tool",
    description: "Create a meeting or use the manual stack keeper to facilitate democratic discussions.",
    features: [
      { icon: '⭐', text: 'Open Source' },
      { icon: '👥', text: 'Free to Use' },
      { icon: '❤️', text: 'MIT Licensed' }
    ]
  }
};

// Shared testimonials
export const TESTIMONIALS = [
  {
    name: "Community Feedback",
    role: "User Experience",
    organization: "Open Source Community",
    content: "This tool helps create more inclusive and organized discussions by ensuring everyone has a fair chance to speak.",
    rating: 4,
    avatar: "CF"
  },
  {
    name: "Facilitator Insights",
    role: "Meeting Management",
    organization: "Democratic Process",
    content: "The speaking queue system makes it easier to manage turn-taking and maintain order in group discussions.",
    rating: 4,
    avatar: "FI"
  },
  {
    name: "User Research",
    role: "Accessibility Focus",
    organization: "Inclusive Design",
    content: "The platform's design prioritizes equal participation and helps create more structured, productive conversations.",
    rating: 4,
    avatar: "UR"
  }
];
