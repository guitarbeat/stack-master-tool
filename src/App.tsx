import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ManualStack from "./pages/ManualStack";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import CreateOrJoinMeeting from "./pages/CreateOrJoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import FacilitatorView from "./pages/FacilitatorView";
import CollapsibleCardDemo from "./pages/CollapsibleCardDemo";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle any potential routing errors
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('manual:1') || event.message.includes('404')) {
        console.warn('Routing error detected, attempting to recover...');
        // Force a clean navigation to the current route
        window.history.replaceState({}, '', location.pathname);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/manual" element={<ManualStack />} />
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path="/create-or-join" element={<CreateOrJoinMeeting />} />
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
            <Route path="/facilitate/:meetingId" element={<FacilitatorView />} />
            <Route path="/demo/collapsible-card" element={<CollapsibleCardDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


