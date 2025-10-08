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
    fullDesc: 'Full facilitator controls with manual stack management and remote access capabilities. Create meetings, manage participants, and control the speaking queue.',
    joinDesc: 'Set up and facilitate',
    features: [
      'Manual stack management',
      'Enable remote access',
      'Full facilitator controls',
      'Real-time participant management',
      'Speaking analytics & distribution'
    ],
    icon: Users,
    gradient: 'from-primary to-accent',
    bgBlob: 'bg-primary/10',
    color: 'text-primary'
  },
  join: {
    id: 'join',
    name: 'JOIN',
    emoji: '🌿',
    title: 'JOIN a Meeting',
    shortDesc: 'Participate & Speak',
    fullDesc: 'Enter a meeting code to participate in an active discussion and join the speaking queue.',
    joinDesc: 'Participate in discussions',
    features: [
      'Enter meeting code',
      'Join active discussion',
      'Raise your hand to speak'
    ],
    icon: QrCode,
    gradient: 'from-accent to-accent/80',
    bgBlob: 'bg-accent/10',
    color: 'text-accent'
  },
  watch: {
    id: 'watch',
    name: 'WATCH',
    emoji: '👁️',
    title: 'WATCH a Meeting',
    shortDesc: 'Observe & Display',
    fullDesc: 'Observe a meeting in read-only mode. Perfect for stakeholders, observers, and display screens.',
    joinDesc: 'Observe and display',
    features: [
      'Enter meeting code',
      'Read-only viewing',
      'No participation needed',
      'Display-optimized layout',
      'Speaking analytics visible'
    ],
    icon: Eye,
    gradient: 'from-primary to-primary/80',
    bgBlob: 'bg-primary/10',
    color: 'text-primary'
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
