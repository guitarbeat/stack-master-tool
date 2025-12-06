import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedToastProvider } from "@/components/shared/UnifiedToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import MeetingRoom from "./pages/MeetingRoom";
import Rooms from "./pages/Rooms";
import FacilitatorDashboard from "./pages/FacilitatorDashboard";
import AppLayout from "./components/layout/AppLayout";
import { SupabaseConnectionProvider } from "@/integrations/supabase/connection-context";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UnifiedToastProvider>
          <SupabaseConnectionProvider>
            <AppLayout>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/facilitator" element={<FacilitatorDashboard />} />
              <Route path="/meeting" element={<MeetingRoom />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/watch/:code" element={<MeetingRoom />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </SupabaseConnectionProvider>
          <Analytics />
        </UnifiedToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
