import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, FileText, Download, Upload, Save, FileText as FileTextIcon, StickyNote } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import MeetingTemplates from '@/components/MeetingTemplates';
import MeetingNotes from '@/components/MeetingNotes';

const ManualMeeting = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    facilitator: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  // Load meetings from localStorage on component mount
  useEffect(() => {
    const savedMeetings = localStorage.getItem('manualMeetings');
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  // Save meetings to localStorage whenever meetings change
  useEffect(() => {
    localStorage.setItem('manualMeetings', JSON.stringify(meetings));
  }, [meetings]);

  const handleCreateMeeting = () => {
    const newMeeting = {
      id: Date.now().toString(),
      code: generateMeetingCode(),
      ...formData,
      participants: [],
      queue: [],
      notes: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setMeetings([...meetings, newMeeting]);
    setFormData({
      title: '',
      facilitator: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    });
    setShowCreateForm(false);
  };

  const handleTemplateSelect = (templateData) => {
    setFormData(templateData);
    setShowTemplates(false);
    setShowCreateForm(true);
  };

  const generateMeetingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const addParticipant = (meetingId, name) => {
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        const newParticipant = {
          id: Date.now().toString(),
          name,
          joinedAt: new Date().toISOString(),
          isSpeaking: false
        };
        return {
          ...meeting,
          participants: [...meeting.participants, newParticipant]
        };
      }
      return meeting;
    });
    setMeetings(updatedMeetings);
  };

  const addToQueue = (meetingId, participantId) => {
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        const participant = meeting.participants.find(p => p.id === participantId);
        if (participant && !meeting.queue.find(q => q.participantId === participantId)) {
          const queueItem = {
            id: Date.now().toString(),
            participantId,
            participantName: participant.name,
            addedAt: new Date().toISOString(),
            order: meeting.queue.length + 1
          };
          return {
            ...meeting,
            queue: [...meeting.queue, queueItem]
          };
        }
      }
      return meeting;
    });
    setMeetings(updatedMeetings);
  };

  const removeFromQueue = (meetingId, queueItemId) => {
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        return {
          ...meeting,
          queue: meeting.queue.filter(item => item.id !== queueItemId)
        };
      }
      return meeting;
    });
    setMeetings(updatedMeetings);
  };

  const updateMeetingNotes = (meetingId, notes) => {
    const updatedMeetings = meetings.map(meeting => {
      if (meeting.id === meetingId) {
        return {
          ...meeting,
          notes
        };
      }
      return meeting;
    });
    setMeetings(updatedMeetings);
  };

  const exportMeetingData = (meeting) => {
    const dataStr = JSON.stringify(meeting, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-${meeting.code}-${meeting.date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importMeetingData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMeeting = JSON.parse(e.target.result);
          importedMeeting.id = Date.now().toString();
          importedMeeting.code = generateMeetingCode();
          // Ensure notes array exists for imported meetings
          if (!importedMeeting.notes) {
            importedMeeting.notes = [];
          }
          setMeetings([...meetings, importedMeeting]);
        } catch (error) {
          alert('Error importing meeting data');
        }
      };
      reader.readAsText(file);
    }
  };

  const deleteMeeting = (meetingId) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manual Meeting Management</h1>
          <p className="text-muted-foreground">Manage meetings offline without real-time backend</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplates(true)} variant="outline">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('importFile').click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            id="importFile"
            type="file"
            accept=".json"
            onChange={importMeetingData}
            className="hidden"
          />
        </div>
      </div>

      {/* Meeting Templates */}
      {showTemplates && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Meeting Templates</CardTitle>
                <CardDescription>Choose from pre-defined meeting structures</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowTemplates(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MeetingTemplates onSelectTemplate={handleTemplateSelect} />
          </CardContent>
        </Card>
      )}

      {/* Create Meeting Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Create New Meeting</CardTitle>
                <CardDescription>Set up a new meeting with manual management</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter meeting title"
                />
              </div>
              <div>
                <Label htmlFor="facilitator">Facilitator</Label>
                <Input
                  id="facilitator"
                  value={formData.facilitator}
                  onChange={(e) => setFormData({...formData, facilitator: e.target.value})}
                  placeholder="Enter facilitator name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter meeting description"
                rows={3}
              />
            </div>
            {formData.structure && (
              <div>
                <Label>Meeting Structure (from template)</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <ul className="space-y-1 text-sm">
                    {formData.structure.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-xs bg-background px-1.5 py-0.5 rounded text-muted-foreground">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateMeeting} disabled={!formData.title || !formData.facilitator}>
                Create Meeting
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Notes */}
      {showNotes && currentMeeting && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Meeting Notes & Action Items</CardTitle>
                <CardDescription>
                  {currentMeeting.title} • {currentMeeting.code}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowNotes(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MeetingNotes 
              notes={currentMeeting.notes || []}
              onUpdateNotes={(notes) => updateMeetingNotes(currentMeeting.id, notes)}
            />
          </CardContent>
        </Card>
      )}

      {/* Meetings List */}
      <div className="grid gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {meeting.title}
                    <Badge variant="secondary">{meeting.code}</Badge>
                    {meeting.template && (
                      <Badge variant="outline" className="text-xs">
                        {meeting.template}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Facilitated by {meeting.facilitator} • {meeting.date} at {meeting.time}
                  </CardDescription>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground mt-2">{meeting.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentMeeting(meeting);
                      setShowNotes(true);
                    }}
                  >
                    <StickyNote className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportMeetingData(meeting)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMeeting(meeting)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMeeting(meeting.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {meeting.participants.length} participants
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {meeting.queue.length} in queue
                </div>
                <div className="flex items-center gap-1">
                  <StickyNote className="w-4 h-4" />
                  {(meeting.notes || []).length} notes/actions
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Created {new Date(meeting.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first meeting to get started with manual management
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowTemplates(true)} variant="outline">
                <FileTextIcon className="w-4 h-4 mr-2" />
                Use Template
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Management Modal */}
      {currentMeeting && !showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Managing: {currentMeeting.title}
                <Badge variant="secondary">{currentMeeting.code}</Badge>
              </CardTitle>
              <CardDescription>
                Manage participants and queue for this meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Participant */}
              <div>
                <h3 className="font-semibold mb-2">Add Participant</h3>
                <div className="flex gap-2">
                  <Input
                    id="newParticipant"
                    placeholder="Enter participant name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        addParticipant(currentMeeting.id, e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById('newParticipant');
                      if (input.value.trim()) {
                        addParticipant(currentMeeting.id, input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Participants List */}
              <div>
                <h3 className="font-semibold mb-2">Participants ({currentMeeting.participants.length})</h3>
                <div className="space-y-2">
                  {currentMeeting.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{participant.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToQueue(currentMeeting.id, participant.id)}
                        disabled={currentMeeting.queue.find(q => q.participantId === participant.id)}
                      >
                        Add to Queue
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue Management */}
              <div>
                <h3 className="font-semibold mb-2">Speaking Queue ({currentMeeting.queue.length})</h3>
                <div className="space-y-2">
                  {currentMeeting.queue.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span>{item.participantName}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromQueue(currentMeeting.id, item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNotes(true);
                  }}
                >
                  <StickyNote className="w-4 h-4 mr-2" />
                  View Notes
                </Button>
                <Button variant="outline" onClick={() => setCurrentMeeting(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManualMeeting;