import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Copy,
  QrCode as QrCodeIcon,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import apiService from "../services/api";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import Confetti from "../components/ui/Confetti.jsx";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";

interface MeetingData {
  name: string;
  facilitatorName: string;
  meetingCode: string;
  meetingId: string;
  shareableLink: string;
}

function CreateMeeting(): JSX.Element {
  const navigate = useNavigate();
  const notify = (
    type: "success" | "error" | "info",
    title: string,
    description?: string
  ) => {
    toast({ title, description });
  };
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [meetingData, setMeetingData] = useState<MeetingData>({
    name: "",
    facilitatorName: "",
    meetingCode: "",
    meetingId: "",
    shareableLink: "",
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [confettiKey, setConfettiKey] = useState<number>(0);

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiService.createMeeting(
        meetingData.facilitatorName,
        meetingData.name
      );

      const shareableLink = `${window.location.origin}/join?code=${response.meetingCode}`;

      // Set state and advance UI before generating QR to avoid perceived slowness
      setMeetingData(prev => ({
        ...prev,
        meetingCode: response.meetingCode,
        meetingId: response.meetingId,
        shareableLink,
      }));

      // Store meeting data in localStorage for facilitate button access
      localStorage.setItem(
        "currentMeeting",
        JSON.stringify({
          meetingCode: response.meetingCode,
          meetingId: response.meetingId,
          facilitatorName: meetingData.facilitatorName,
          meetingName: meetingData.name,
        })
      );

      setStep(2);

      // Generate QR in background
      (async () => {
        try {
          const qrUrl = await QRCode.toDataURL(shareableLink);
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error("Error generating QR code:", err);
        }
      })();

      notify("success", "Meeting created", `Code: ${response.meetingCode}`);
      playBeep(880, 140);
      setConfettiKey(k => k + 1);
    } catch (err) {
      console.error("Error creating meeting:", err);

      const errorInfo = getErrorDisplayInfo(err as AppError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify("success", "Copied to clipboard");
    playBeep(1200, 80);
  };

  const startMeeting = () => {
    navigate(`/facilitate/${meetingData.meetingCode}`, {
      state: {
        facilitatorName: meetingData.facilitatorName,
        meetingName: meetingData.name,
        meetingCode: meetingData.meetingCode,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Confetti triggerKey={confettiKey} />
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => (step === 1 ? navigate("/") : setStep(1))}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="text-center mb-8">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="w-8 h-8 text-primary mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                Create Meeting
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Set up your meeting and share the invitation link
              </p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900/40">
                  <p className="text-red-600 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Meeting Name
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={meetingData.name}
                  onChange={e =>
                    setMeetingData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground"
                  placeholder="e.g., Weekly Team Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Your Name (Facilitator)
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={meetingData.facilitatorName}
                  onChange={e =>
                    setMeetingData(prev => ({
                      ...prev,
                      facilitatorName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground placeholder:text-muted-foreground"
                  placeholder="Your name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:bg-primary/60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Meeting...
                  </>
                ) : (
                  "Create Meeting"
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="text-center mb-8">
              <div className="bg-accent/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <QrCodeIcon className="w-8 h-8 text-accent mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                Your meeting is ready!
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Share this code or link with participants
              </p>
            </div>

            <div className="space-y-6">
              {/* Meeting Code */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Meeting Code
                </label>
                <div className="bg-gray-50 dark:bg-zinc-950 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {meetingData.meetingCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(meetingData.meetingCode)}
                    className="flex items-center justify-center mx-auto text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Code
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                    QR Code
                  </label>
                  <div className="flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR code to join meeting"
                      className="w-48 h-48 border border-gray-200 dark:border-zinc-800 rounded bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Shareable Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Shareable Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={meetingData.shareableLink}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    onClick={() => copyToClipboard(meetingData.shareableLink)}
                    className="px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={startMeeting}
                className="w-full bg-accent text-white py-3 px-6 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                Start meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateMeeting;
