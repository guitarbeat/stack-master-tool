import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useFacilitatorSession } from "@/hooks/useFacilitatorSession";

function FacilitatePage() {
  const [meetingCode, setMeetingCode] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    session,
    isLoading,
    hasActiveSession,
    getSessionInfo,
    restoreSession,
  } = useFacilitatorSession();

  // Load session data on component mount
  useEffect(() => {
    if (session) {
      setMeetingCode(session.meetingCode);
      setFacilitatorName(session.facilitatorName);
    }
  }, [session]);

  const handleFacilitate = async () => {
    if (!meetingCode.trim() || !facilitatorName.trim()) {
      setError("Please enter both meeting code and your name");
      return;
    }

    setError("");

    try {
      // Validate meeting code format (should be 6 characters)
      if (meetingCode.trim().length !== 6) {
        setError("Meeting code must be 6 characters long");
        return;
      }

      navigate(`/facilitate/${meetingCode.trim()}`, {
        state: {
          meetingCode: meetingCode.trim(),
          facilitatorName: facilitatorName.trim(),
          meetingName: "Meeting",
        },
      });
    } catch (err) {
      setError("Failed to join meeting. Please try again.");
    }
  };

  const handleRestoreSession = () => {
    if (hasActiveSession()) {
      restoreSession();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-white rounded-2xl shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-zinc-400">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto space-y-6">
        {/* Active Session Card */}
        {hasActiveSession() && (
          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Active Session
                </h3>
              </div>
              {(() => {
                const sessionInfo = getSessionInfo();
                return sessionInfo ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Meeting:</strong> {sessionInfo.meetingCode}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Facilitator:</strong>{" "}
                      {sessionInfo.facilitatorName}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Last active:</strong> {sessionInfo.timeAgo}
                    </p>
                    <Button
                      onClick={handleRestoreSession}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continue Facilitating
                    </Button>
                  </div>
                ) : null;
              })()}
            </CardContent>
          </Card>
        )}

        {/* Main Facilitate Card */}
        <Card className="bg-white rounded-2xl shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
          <CardHeader className="text-center pb-6">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Settings className="w-8 h-8 text-primary mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Facilitate Meeting
            </CardTitle>
            <p className="text-gray-600 dark:text-zinc-400 mt-2">
              Enter the meeting code to take control of the facilitation
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="meetingCode"
                className="text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Meeting Code
              </label>
              <Input
                id="meetingCode"
                type="text"
                placeholder="Enter 6-character meeting code"
                value={meetingCode}
                onChange={e => {
                  setMeetingCode(e.target.value.toUpperCase());
                  setError(""); // Clear error when user types
                }}
                className="rounded-xl"
                onKeyPress={e => e.key === "Enter" && handleFacilitate()}
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="facilitatorName"
                className="text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Your Name
              </label>
              <Input
                id="facilitatorName"
                type="text"
                placeholder="Enter your name"
                value={facilitatorName}
                onChange={e => {
                  setFacilitatorName(e.target.value);
                  setError(""); // Clear error when user types
                }}
                className="rounded-xl"
                onKeyPress={e => e.key === "Enter" && handleFacilitate()}
              />
            </div>

            <Button
              onClick={handleFacilitate}
              disabled={!meetingCode.trim() || !facilitatorName.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Users className="w-4 h-4 mr-2" />
              Start Facilitating
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Don't have a meeting code?{" "}
                <button
                  onClick={() => navigate("/create")}
                  className="text-primary hover:underline font-medium"
                >
                  Create a meeting
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FacilitatePage;
