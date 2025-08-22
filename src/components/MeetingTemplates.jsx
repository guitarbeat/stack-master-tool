import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target, Calendar } from "lucide-react";

const MeetingTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 'brainstorming',
      name: 'Brainstorming Session',
      description: 'Open discussion for generating ideas and creative solutions',
      duration: '60 min',
      participants: '5-15',
      structure: [
        'Ice breaker (5 min)',
        'Problem statement (10 min)',
        'Individual ideation (15 min)',
        'Group sharing (20 min)',
        'Voting and selection (10 min)'
      ],
      tags: ['Creative', 'Collaboration', 'Problem-solving']
    },
    {
      id: 'decision-making',
      name: 'Decision Making Meeting',
      description: 'Structured meeting to reach consensus on important decisions',
      duration: '45 min',
      participants: '3-8',
      structure: [
        'Agenda review (5 min)',
        'Options presentation (15 min)',
        'Discussion and questions (15 min)',
        'Decision and action items (10 min)'
      ],
      tags: ['Decision', 'Consensus', 'Action-oriented']
    },
    {
      id: 'retrospective',
      name: 'Team Retrospective',
      description: 'Reflect on past work and identify improvements',
      duration: '90 min',
      participants: '5-12',
      structure: [
        'Set the stage (10 min)',
        'Gather data (20 min)',
        'Generate insights (25 min)',
        'Decide what to do (25 min)',
        'Close (10 min)'
      ],
      tags: ['Reflection', 'Improvement', 'Team building']
    },
    {
      id: 'planning',
      name: 'Project Planning',
      description: 'Plan upcoming work and assign responsibilities',
      duration: '75 min',
      participants: '4-10',
      structure: [
        'Project overview (10 min)',
        'Task breakdown (25 min)',
        'Resource allocation (20 min)',
        'Timeline and milestones (15 min)',
        'Next steps (5 min)'
      ],
      tags: ['Planning', 'Project management', 'Execution']
    },
    {
      id: 'standup',
      name: 'Daily Standup',
      description: 'Quick status update and coordination meeting',
      duration: '15 min',
      participants: '3-8',
      structure: [
        'What I did yesterday (5 min)',
        'What I\'m doing today (5 min)',
        'Blockers and help needed (5 min)'
      ],
      tags: ['Daily', 'Status update', 'Quick']
    },
    {
      id: 'review',
      name: 'Code/Work Review',
      description: 'Review completed work and provide feedback',
      duration: '30 min',
      participants: '2-6',
      structure: [
        'Work presentation (10 min)',
        'Review and feedback (15 min)',
        'Action items and approval (5 min)'
      ],
      tags: ['Review', 'Feedback', 'Quality']
    }
  ];

  const handleTemplateSelect = (template) => {
    const templateData = {
      title: template.name,
      description: template.description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      facilitator: '',
      template: template.id,
      structure: template.structure,
      estimatedDuration: template.duration,
      maxParticipants: template.participants
    };
    onSelectTemplate(templateData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Meeting Templates</h2>
        <p className="text-muted-foreground">
          Choose from pre-defined meeting structures for common scenarios
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant="outline">{template.duration}</Badge>
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {template.participants}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.duration}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Structure:</h4>
                <ul className="text-sm space-y-1">
                  {template.structure.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                onClick={() => handleTemplateSelect(template)}
                className="w-full"
                variant="outline"
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingTemplates;