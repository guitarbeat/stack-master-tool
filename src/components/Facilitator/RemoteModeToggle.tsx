import { useState } from 'react';
import { Wifi, WifiOff, Copy, QrCode, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface RemoteModeToggleProps {
  isRemoteEnabled: boolean;
  meetingCode: string | null;
  meetingTitle: string;
  isCreatingMeeting: boolean;
  onEnableRemote: (title: string) => Promise<string>;
  onDisableRemote: () => void;
  facilitatorName: string;
}

export const RemoteModeToggle = ({
  isRemoteEnabled,
  meetingCode,
  meetingTitle,
  isCreatingMeeting,
  onEnableRemote,
  onDisableRemote,
  facilitatorName,
}: RemoteModeToggleProps) => {
  const [title, setTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEnableRemote = async () => {
    const meetingTitle = title.trim() || `${facilitatorName}'s Meeting`;
    await onEnableRemote(meetingTitle);
    setDialogOpen(false);
    setTitle('');
  };

  const copyCode = () => {
    if (meetingCode) {
      navigator.clipboard.writeText(meetingCode);
    }
  };

  const copyJoinLink = () => {
    if (meetingCode) {
      const link = `${window.location.origin}/join/${meetingCode}`;
      navigator.clipboard.writeText(link);
    }
  };

  if (!isRemoteEnabled) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-muted-foreground" />
            Manual Mode
          </CardTitle>
          <CardDescription>
            Currently managing participants locally. Enable remote access to allow participants to join with a meeting code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Wifi className="w-4 h-4 mr-2" />
                Enable Remote Participants
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Remote Access</DialogTitle>
                <DialogDescription>
                  Create a meeting code that remote participants can use to join
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-title">Meeting Title (Optional)</Label>
                  <Input
                    id="meeting-title"
                    placeholder="e.g., Weekly Team Meeting"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isCreatingMeeting}
                  />
                </div>
                <Button
                  onClick={handleEnableRemote}
                  disabled={isCreatingMeeting}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingMeeting ? 'Creating Meeting...' : 'Create Meeting Code'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            <CardTitle>Remote Access Enabled</CardTitle>
          </div>
          <Badge variant="default" className="animate-pulse">
            <Users className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
        <CardDescription>{meetingTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Meeting Code</Label>
              <div className="text-2xl font-bold tracking-wider text-primary">
                {meetingCode}
              </div>
            </div>
            <Button onClick={copyCode} variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={copyJoinLink}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-2" />
              Copy Join Link
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <QrCode className="w-3 h-3 mr-2" />
              Show QR
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Participants can join at: <span className="font-mono">{window.location.origin}/join</span>
        </div>

        <Button
          onClick={onDisableRemote}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <WifiOff className="w-3 h-3 mr-2" />
          Disable Remote Access
        </Button>
      </CardContent>
    </Card>
  );
};
