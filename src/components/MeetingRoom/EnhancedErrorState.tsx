import { useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Clock,
  HelpCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedErrorStateProps {
  error: string | Error;
  errorCode?: string;
  onRetry: () => void;
  onGoHome: () => void;
  meetingCode?: string;
  participantName?: string;
  isRetrying?: boolean;
  retryCount?: number;
  lastConnected?: Date;
}

export const EnhancedErrorState = ({
  error,
  errorCode,
  onRetry,
  onGoHome,
  meetingCode,
  participantName,
  isRetrying = false,
  retryCount = 0,
  lastConnected,
}: EnhancedErrorStateProps) => {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyMeetingCode = async () => {
    if (meetingCode) {
      try {
        await navigator.clipboard.writeText(meetingCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error("Failed to copy meeting code:", err);
      }
    }
  };

  const getErrorType = () => {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorLower = errorMessage.toLowerCase();

    if (errorLower.includes("network") || errorLower.includes("connection")) {
      return "network";
    }
    if (errorLower.includes("timeout")) {
      return "timeout";
    }
    if (
      errorLower.includes("not found") ||
      errorLower.includes("invalid") ||
      errorLower.includes("failed to get meeting")
    ) {
      return "meeting";
    }
    if (
      errorLower.includes("unauthorized") ||
      errorLower.includes("permission")
    ) {
      return "permission";
    }
    return "unknown";
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case "network":
        return <WifiOff className="w-8 h-8 text-red-500" />;
      case "timeout":
        return <Clock className="w-8 h-8 text-orange-500" />;
      case "meeting":
        return <XCircle className="w-8 h-8 text-red-500" />;
      case "permission":
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorTitle = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case "network":
        return "Connection Lost";
      case "timeout":
        return "Request Timeout";
      case "meeting":
        return "Meeting Not Found";
      case "permission":
        return "Access Denied";
      default:
        return "Connection Error";
    }
  };

  const getErrorDescription = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case "network":
        return "Your internet connection was interrupted. Please check your network and try again.";
      case "timeout":
        return "The request took too long to complete. The server might be busy or your connection is slow.";
      case "meeting":
        return "The meeting code you entered doesn't exist or the meeting has ended. Please verify the code with the facilitator.";
      case "permission":
        return "You don't have permission to join this meeting. Please check with the facilitator.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const getTroubleshootingSteps = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case "network":
        return [
          "Check your internet connection",
          "Try refreshing the page",
          "Disable VPN if you're using one",
          "Check if your firewall is blocking the connection",
        ];
      case "timeout":
        return [
          "Check your internet speed",
          "Try again in a few moments",
          "Close other tabs/applications using bandwidth",
          "Check if the meeting is still active",
        ];
      case "meeting":
        return [
          "Verify the meeting code is correct",
          "Ask the facilitator to confirm the meeting is active",
          "Check if the meeting has ended",
          "Try joining from a different device",
        ];
      case "permission":
        return [
          "Contact the meeting facilitator",
          "Verify you're using the correct meeting code",
          "Check if the meeting allows new participants",
          "Try joining with a different name",
        ];
      default:
        return [
          "Refresh the page and try again",
          "Clear your browser cache",
          "Try a different browser",
          "Contact support if the problem persists",
        ];
    }
  };

  const troubleshootingSteps = getTroubleshootingSteps();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center pb-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              {getErrorIcon()}
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {getErrorTitle()}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {getErrorDescription()}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Error Details:</div>
                  <div className="text-sm font-mono bg-muted p-2 rounded">
                    {typeof error === "string" ? error : error.message}
                  </div>
                  {errorCode && (
                    <div className="text-xs text-muted-foreground">
                      Error Code: {errorCode}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Meeting Info */}
            {meetingCode && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Meeting Code</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyMeetingCode}
                    className="text-xs"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="font-mono text-lg font-bold">{meetingCode}</div>
                {participantName && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Attempting to join as: {participantName}
                  </div>
                )}
              </div>
            )}

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Retry Information</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div>Attempts made: {retryCount}</div>
                  {lastConnected && (
                    <div>
                      Last connected: {lastConnected.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Troubleshooting */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="w-full"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showTroubleshooting ? "Hide" : "Show"} Troubleshooting Steps
              </Button>

              {showTroubleshooting && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">
                    Try these steps:
                  </div>
                  <ol className="space-y-2 text-sm">
                    {troubleshootingSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex-1"
                size="lg"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
              <Button
                onClick={onGoHome}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Go Home
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Still having trouble?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open("mailto:support@example.com", "_blank")
                  }
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Contact Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open("/help", "_blank")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Help Center
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
