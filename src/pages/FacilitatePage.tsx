import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, ArrowRight } from "lucide-react";

function FacilitatePage() {
  const [meetingCode, setMeetingCode] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const navigate = useNavigate();

  const handleFacilitate = () => {
    if (!meetingCode.trim() || !facilitatorName.trim()) {
      return;
    }
    
    navigate(`/facilitate/${meetingCode.trim()}`, {
      state: {
        meetingCode: meetingCode.trim(),
        facilitatorName: facilitatorName.trim(),
        meetingName: "Meeting",
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
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
            <div className="space-y-2">
              <label htmlFor="meetingCode" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Meeting Code
              </label>
              <Input
                id="meetingCode"
                type="text"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleFacilitate()}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="facilitatorName" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Your Name
              </label>
              <Input
                id="facilitatorName"
                type="text"
                placeholder="Enter your name"
                value={facilitatorName}
                onChange={(e) => setFacilitatorName(e.target.value)}
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleFacilitate()}
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