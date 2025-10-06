import { useState } from "react";
import { Wifi, WifiOff, Copy, QrCode, Users } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);

  const handleEnableRemote = () => {
    const meetingTitle = `${facilitatorName}'s Meeting`;
    void onEnableRemote(meetingTitle);
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

  const handleShowQR = async () => {
    if (!meetingCode) return;

    setQrLoading(true);
    setQrDialogOpen(true);

    try {
      const joinLink = `${window.location.origin}/join/${meetingCode}`;
      const qrUrl = await QRCode.toDataURL(joinLink, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setQrLoading(false);
    }
  };

  if (!isRemoteEnabled) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            Manual Mode
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Currently managing participants locally. Enable remote access to
            allow participants to join with a meeting code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            onClick={handleEnableRemote}
            disabled={isCreatingMeeting}
          >
            <Wifi className="w-4 h-4 mr-2" />
            {isCreatingMeeting
              ? "Creating Meeting..."
              : "Enable Remote Participants"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">
                Remote Access Enabled
              </CardTitle>
            </div>
            <Badge
              variant="default"
              className="animate-pulse self-start sm:self-auto"
            >
              <Users className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {meetingTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 sm:p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <Label className="text-xs text-muted-foreground">
                  Meeting Code
                </Label>
                <div className="text-xl sm:text-2xl font-bold tracking-wider text-primary truncate">
                  {meetingCode}
                </div>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="shrink-0 ml-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyJoinLink}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
              >
                <Copy className="w-3 h-3 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Copy Join Link</span>
                <span className="sm:hidden">Link</span>
              </Button>
              <Button
                onClick={handleShowQR}
                variant="secondary"
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                disabled={!meetingCode}
              >
                <QrCode className="w-3 h-3 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Show QR</span>
                <span className="sm:hidden">QR</span>
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center break-all px-2">
            Participants can join at:{" "}
            <span className="font-mono">{window.location.origin}/join</span>
          </div>

          <Button
            onClick={onDisableRemote}
            variant="outline"
            size="sm"
            className="w-full text-xs sm:text-sm"
          >
            <WifiOff className="w-3 h-3 mr-2" />
            Disable Remote Access
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meeting QR Code</DialogTitle>
            <DialogDescription>
              Participants can scan this QR code to join the meeting
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {qrLoading ? (
              <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">
                    Generating QR code...
                  </p>
                </div>
              </div>
            ) : qrCodeUrl ? (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Meeting QR Code"
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Failed to generate QR code
                </p>
              </div>
            )}
            {meetingCode && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Meeting Code:
                </p>
                <p className="text-lg font-mono font-bold text-primary">
                  {meetingCode}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
