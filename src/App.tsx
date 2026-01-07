import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedToastProvider } from "@/components/shared/UnifiedToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import MeetingRoom from "./pages/MeetingRoom";
import FacilitatorDashboard from "./pages/FacilitatorDashboard";
import Health from "./pages/Health";
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
                <Route path="/health" element={<Health />} />
                <Route path="/watch/:code" element={<MeetingRoom />} />
                {/* Redirects for removed routes */}
                <Route path="/enter" element={<Navigate to="/" replace />} />
                <Route path="/rooms" element={<Navigate to="/" replace />} />
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
