import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(50);

export default function Auth() {
  const navigate = useNavigate();
  const { signInAnonymously, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleJoin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      nameSchema.parse(displayName);
    } catch (err) {
      if (err instanceof z.ZodError) {
        showToast({
          title: "Validation Error",
          message: err.errors[0].message,
          type: "error",
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await signInAnonymously(displayName);
    
    if (error) {
      showToast({
        title: "Failed to Join",
        description: error.message,
        type: "error",
      });
    } else {
      showToast({
        title: `Welcome, ${displayName}!`,
        description: "You're all set to create and join meetings.",
        type: "success",
      });
      navigate("/");
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Stack Keeper</CardTitle>
          <CardDescription>
            Enter your name to get started - no password required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleJoin(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={50}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining..." : "Continue"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
