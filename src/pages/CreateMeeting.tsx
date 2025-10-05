// @ts-nocheck - Legacy API service during migration
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Copy,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import apiService from "../services/api";
import { toast } from "@/hooks/use-toast";
import { playBeep } from "../utils/sound.js";
import Confetti from "../components/ui/Confetti.jsx";
import { AppError, getErrorDisplayInfo } from "../utils/errorHandling";
import { useFacilitatorSession } from "@/hooks/useFacilitatorSession";

interface MeetingData {
  name: string;
  facilitatorName: string;
  meetingCode: string;
  meetingId: string;
  shareableLink: string;
}

function CreateMeeting(): JSX.Element {
  const navigate = useNavigate();
  const { saveSession } = useFacilitatorSession();
  const notify = (
    _type: "success" | "error" | "info",
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
      setMeetingData((prev: MeetingData) => ({
        ...prev,
        meetingCode: response.meetingCode,
        meetingId: response.meetingId,
        shareableLink,
      }));

      setStep(2);

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

      // Save facilitator session for persistence
      saveSession({
        meetingCode: response.meetingCode,
        facilitatorName: meetingData.facilitatorName,
        meetingTitle: meetingData.name,
      });

      // Generate QR in background
      (async () => {
        try {
          const qrUrl = await QRCode.toDataURL(shareableLink);
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error("Failed to generate QR code:", err);
        }
      })();

      playBeep(800, 200);
      setConfettiKey(prev => prev + 1);
      notify("success", "Meeting created successfully!");
    } catch (err) {
      const appError = err as AppError;
      const errorInfo = getErrorDisplayInfo(appError);
      setError(errorInfo.description);
      notify("error", errorInfo.title, errorInfo.description);
      playBeep(220, 200);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("success", `${label} copied to clipboard!`);
      playBeep(600, 100);
    } catch (err) {
      notify("error", "Failed to copy to clipboard");
      playBeep(220, 200);
    }
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
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
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
                Host Meeting
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Set up your meeting and share the invitation link
              </p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="meetingName"
                    className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2"
                  >
                    Meeting Name
                  </label>
                  <input
                    id="meetingName"
                    type="text"
                    value={meetingData.name}
                    onChange={e =>
                      setMeetingData(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                    placeholder="Enter meeting name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="facilitatorName"
                    className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2"
                  >
                    Your Name (Facilitator)
                  </label>
                  <input
                    id="facilitatorName"
                    type="text"
                    value={meetingData.facilitatorName}
                    onChange={e =>
                      setMeetingData(prev => ({
                        ...prev,
                        facilitatorName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !meetingData.name.trim() ||
                  !meetingData.facilitatorName.trim()
                }
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Hosting Meeting...
                  </>
                ) : (
                  "Host Meeting"
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                Meeting Created!
              </h1>
              <p className="text-gray-600 dark:text-zinc-400">
                Share this code or link with participants
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Meeting Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={meetingData.meetingCode}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 font-mono text-lg text-center"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(meetingData.meetingCode, "Meeting code")
                    }
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-xl transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-4">
                    QR Code
                  </h3>
                  <div className="inline-block p-4 bg-white rounded-xl shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="Meeting QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={meetingData.shareableLink}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 text-sm"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        meetingData.shareableLink,
                        "Shareable link"
                      )
                    }
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-xl transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={startMeeting}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:from-primary/90 hover:to-accent/90 transition-all duration-200 flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
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
