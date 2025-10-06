import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import MeetingRoom from "./pages/MeetingRoom";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import WatchMeeting from "./pages/WatchMeeting";
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
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path="/watch" element={<WatchMeeting />} />
            <Route path="/meeting" element={<MeetingRoom />} />
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
