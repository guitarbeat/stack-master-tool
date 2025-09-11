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
import MeetingRoom from "./pages/MeetingRoom";
import FacilitatorView from "./pages/FacilitatorView";
import CollapsibleCardDemo from "./pages/CollapsibleCardDemo";
import ReplicateBackgroundRemoval from "./pages/ReplicateBackgroundRemoval";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/facilitate/:meetingId" element={<FacilitatorView />} />
          <Route path="/demo/collapsible-card" element={<CollapsibleCardDemo />} />
          <Route path="/replicate-bg-removal" element={<ReplicateBackgroundRemoval />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


