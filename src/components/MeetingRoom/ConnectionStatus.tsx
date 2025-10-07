import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  RefreshCw,
  Signal,
  Activity,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  lastConnected?: Date;
  reconnectAttempts?: number;
  onReconnect?: () => void;
  connectionQuality?: "excellent" | "good" | "fair" | "poor" | "disconnected";
  participantCount?: number;
  meetingDuration?: number;
}

export const ConnectionStatus = ({
  isConnected,
  isConnecting,
  error,
  lastConnected,
  reconnectAttempts = 0,
  onReconnect,
  connectionQuality = "disconnected",
  participantCount = 0,
  meetingDuration = 0,
}: ConnectionStatusProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [timeSinceLastConnected, setTimeSinceLastConnected] =
    useState<string>("");

  // Update time since last connected
  useEffect(() => {
    if (!lastConnected) return;

    const updateTime = () => {
      const now = new Date();
      const diff = now.getTime() - lastConnected.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setTimeSinceLastConnected(`${minutes}m ${seconds}s ago`);
      } else {
        setTimeSinceLastConnected(`${seconds}s ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastConnected]);

  const getConnectionIcon = () => {
    if (isConnecting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isConnected) return <WifiOff className="w-4 h-4" />;

    switch (connectionQuality) {
      case "excellent":
        return <Zap className="w-4 h-4 text-green-500" />;
      case "good":
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case "fair":
        return <Signal className="w-4 h-4 text-orange-500" />;
      case "poor":
        return <Wifi className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getConnectionColor = () => {
    if (isConnecting) return "text-blue-500";
    if (!isConnected) return "text-red-500";

    switch (connectionQuality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      case "fair":
        return "text-orange-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getConnectionText = () => {
    if (isConnecting) return "Connecting...";
    if (!isConnected) return "Disconnected";

    switch (connectionQuality) {
      case "excellent":
        return "Excellent connection";
      case "good":
        return "Good connection";
      case "fair":
        return "Fair connection";
      case "poor":
        return "Poor connection";
      default:
        return "Connected";
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getConnectionColor()}`}>
              {getConnectionIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {getConnectionText()}
                </span>
                {isConnected && (
                  <Badge variant="outline" className="text-xs">
                    {participantCount} online
                  </Badge>
                )}
              </div>
              {meetingDuration > 0 && isConnected && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Meeting running for {formatDuration(meetingDuration)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isConnected && onReconnect && (
              <Button
                size="sm"
                variant="outline"
                onClick={onReconnect}
                disabled={isConnecting}
                className="text-xs"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reconnect
                  </>
                )}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? "Hide" : "Details"}
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-red-700 dark:text-red-300">
                    Connection Error
                  </div>
                  <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {lastConnected && !isConnected && (
              <div className="text-sm text-muted-foreground">
                Last connected: {timeSinceLastConnected}
              </div>
            )}

            {reconnectAttempts > 0 && (
              <div className="text-sm text-muted-foreground">
                Reconnection attempts: {reconnectAttempts}
              </div>
            )}

            {isConnected && connectionQuality !== "excellent" && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Connection quality: {connectionQuality}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Signal strength</span>
                    <span>{connectionQuality}</span>
                  </div>
                  <Progress
                    value={
                      connectionQuality === "good"
                        ? 75
                        : connectionQuality === "fair"
                          ? 50
                          : connectionQuality === "poor"
                            ? 25
                            : 0
                    }
                    className="h-1"
                  />
                </div>
              </div>
            )}

            {isConnected && (
              <div className="text-xs text-muted-foreground">
                💡 Tip: Keep this tab active for the best experience
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
