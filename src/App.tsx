import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import ManualStack from "./pages/ManualStack";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import WatchMeeting from "./pages/WatchMeeting";
import PublicWatch from "./pages/PublicWatch";
import MeetingRoom from "./pages/MeetingRoom";
import FacilitatorView from "./pages/FacilitatorView";
import FacilitatePage from "./pages/FacilitatePage";
import UnifiedFacilitator from "./pages/UnifiedFacilitator";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/stack" element={<UnifiedFacilitator />} />
            <Route path="/manual" element={<ManualStack />} />
            <Route path="/facilitate" element={<FacilitatePage />} />
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path="/watch" element={<WatchMeeting />} />
            <Route path="/watch/:code" element={<PublicWatch />} />
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
            <Route
              path="/facilitate/:meetingId"
              element={<FacilitatorView />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
