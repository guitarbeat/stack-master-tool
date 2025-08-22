import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Circle, Edit, Trash2, Save, X } from "lucide-react";

const MeetingNotes = ({ notes, onUpdateNotes }) => {
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [newActionItem, setNewActionItem] = useState({ text: '', assignee: '', dueDate: '' });

  const addNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date().toISOString(),
        type: 'note'
      };
      onUpdateNotes([...notes, note]);
      setNewNote('');
    }
  };

  const updateNote = (noteId, updatedText) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, text: updatedText } : note
    );
    onUpdateNotes(updatedNotes);
    setEditingNote(null);
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    onUpdateNotes(updatedNotes);
  };

  const addActionItem = () => {
    if (newActionItem.text.trim() && newActionItem.assignee.trim()) {
      const actionItem = {
        id: Date.now().toString(),
        text: newActionItem.text.trim(),
        assignee: newActionItem.assignee.trim(),
        dueDate: newActionItem.dueDate || null,
        completed: false,
        timestamp: new Date().toISOString(),
        type: 'action'
      };
      onUpdateNotes([...notes, actionItem]);
      setNewActionItem({ text: '', assignee: '', dueDate: '' });
    }
  };

  const toggleActionItem = (actionId) => {
    const updatedNotes = notes.map(note => 
      note.id === actionId ? { ...note, completed: !note.completed } : note
    );
    onUpdateNotes(updatedNotes);
  };

  const deleteActionItem = (actionId) => {
    const updatedNotes = notes.filter(note => note.id !== actionId);
    onUpdateNotes(updatedNotes);
  };

  const notesList = notes.filter(note => note.type === 'note');
  const actionItems = notes.filter(note => note.type === 'action');
  const completedActions = actionItems.filter(action => action.completed);
  const pendingActions = actionItems.filter(action => !action.completed);

  return (
    <div className="space-y-6">
      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Note</CardTitle>
          <CardDescription>Capture important information during the meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addNote();
                }
              }}
              rows={2}
            />
            <Button onClick={addNote} disabled={!newNote.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Action Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Action Item</CardTitle>
          <CardDescription>Track tasks and responsibilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="Action item description"
              value={newActionItem.text}
              onChange={(e) => setNewActionItem({...newActionItem, text: e.target.value})}
            />
            <Input
              placeholder="Assignee"
              value={newActionItem.assignee}
              onChange={(e) => setNewActionItem({...newActionItem, assignee: e.target.value})}
            />
            <Input
              type="date"
              value={newActionItem.dueDate}
              onChange={(e) => setNewActionItem({...newActionItem, dueDate: e.target.value})}
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={addActionItem} disabled={!newActionItem.text.trim() || !newActionItem.assignee.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Action Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {notesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Notes ({notesList.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notesList.map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {editingNote === note.id ? (
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={note.text}
                      onChange={(e) => {
                        const updatedNotes = notes.map(n => 
                          n.id === note.id ? { ...n, text: e.target.value } : n
                        );
                        onUpdateNotes(updatedNotes);
                      }}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateNote(note.id, note.text)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(note.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items</CardTitle>
            <CardDescription>
              {pendingActions.length} pending • {completedActions.length} completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Pending Actions */}
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActionItem(action.id)}
                >
                  <Circle className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <p className="font-medium">{action.text}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Assigned to: {action.assignee}</span>
                    {action.dueDate && (
                      <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                    )}
                    <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteActionItem(action.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Completed Actions */}
            {completedActions.map((action) => (
              <div key={action.id} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActionItem(action.id)}
                  className="text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <p className="font-medium line-through text-green-700 dark:text-green-300">{action.text}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Assigned to: {action.assignee}</span>
                    {action.dueDate && (
                      <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                    )}
                    <span>Completed: {new Date(action.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteActionItem(action.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No notes or action items yet. Start adding them above!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingNotes;