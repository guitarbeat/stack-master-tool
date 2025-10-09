import { Toggle } from "@/components/ui/toggle";
import QRCode from "qrcode";

interface HostSettingsPanelProps {
  isLiveMeeting: boolean;
  setIsLiveMeeting: (live: boolean) => void;
  remoteEnabled: boolean;
  setRemoteEnabled: (enabled: boolean) => void;
  meetingCode: string;
  onQrGenerate: (url: string, type: 'join' | 'watch') => void;
  onScannerOpen: () => void;
}

/**
 * * Component for host meeting settings and controls
 * Provides toggles for meeting settings and sharing options
 */
export function HostSettingsPanel({
  isLiveMeeting,
  setIsLiveMeeting,
  remoteEnabled,
  setRemoteEnabled,
  meetingCode,
  onQrGenerate,
  onScannerOpen,
}: HostSettingsPanelProps) {
  const handleCopyLink = (type: 'join' | 'watch') => {
    const link = `${window.location.origin}/meeting?mode=${type}&code=${meetingCode}`;
    navigator.clipboard.writeText(link);
  };

  const handleGenerateQr = async (type: 'join' | 'watch') => {
    if (!meetingCode) return;
    
    const link = `${window.location.origin}/meeting?mode=${type}&code=${meetingCode}`;
    const dataUrl = await QRCode.toDataURL(link, {
      width: 256,
      margin: 2,
    });
    onQrGenerate(dataUrl, type);
  };

  return (
    <div className="bg-muted/30 text-muted-foreground rounded-lg p-3 border border-border/50 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
        <h3 className="text-sm font-medium text-foreground">Meeting Settings</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Toggle
              checked={isLiveMeeting}
              onCheckedChange={setIsLiveMeeting}
              size="sm"
              aria-label="Toggle live meeting mode"
            />
            <span className="text-sm font-medium">Live Meeting</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={remoteEnabled}
              onCheckedChange={setRemoteEnabled}
              size="sm"
              aria-label="Toggle remote joining"
            />
            <span className="text-sm font-medium">Enable remote joining</span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p><strong>Live Meeting:</strong> Meeting is active and participants can join remotely</p>
        <p><strong>Local/Manual:</strong> Meeting is for in-person facilitation only</p>
      </div>
      
      {isLiveMeeting && remoteEnabled && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Join link</span>
            <button
              className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100"
              aria-label="Copy join link to clipboard"
              onClick={() => handleCopyLink('join')}
            >
              Copy
            </button>
          </div>
          <code className="block break-all p-2 rounded bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-100">
            {`${window.location.origin}/meeting?mode=join&code=${meetingCode}`}
          </code>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Watch link</span>
            <button
              className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100"
              aria-label="Copy watch link to clipboard"
              onClick={() => handleCopyLink('watch')}
            >
              Copy
            </button>
          </div>
          <code className="block break-all p-2 rounded bg-slate-100 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-100">
            {`${window.location.origin}/meeting?mode=watch&code=${meetingCode}`}
          </code>
          
          <div className="pt-2 space-y-2">
            <div className="flex gap-2">
              <button
                className="flex-1 py-1.5 px-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-xs font-medium transition-colors"
                disabled={!meetingCode}
                aria-label="Generate QR code for joining this meeting"
                onClick={() => handleGenerateQr('join')}
              >
                📱 Join QR
              </button>
              <button
                className="flex-1 py-1.5 px-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 text-xs font-medium transition-colors"
                disabled={!meetingCode}
                aria-label="Generate QR code for watching this meeting"
                onClick={() => handleGenerateQr('watch')}
              >
                👁️ Watch QR
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isLiveMeeting && (
        <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded">
          <p><strong>Local Meeting Mode:</strong> This meeting is set to local/manual mode. Enable "Live Meeting" to allow remote participants to join.</p>
        </div>
      )}
    </div>
  );
}