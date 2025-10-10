import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UnifiedToastProvider } from "@/components/shared/UnifiedToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import MeetingRoom from "./pages/MeetingRoom";
import Rooms from "./pages/Rooms";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UnifiedToastProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/meeting" element={<MeetingRoom />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/watch/:code" element={<MeetingRoom />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </UnifiedToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
