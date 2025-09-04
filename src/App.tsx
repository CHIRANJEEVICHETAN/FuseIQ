import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { QueryProvider } from "@/lib/providers/query-provider";
import NotificationSystem from "@/components/ui/notification-system";
import { LandingPage } from "./pages/LandingPage";
import { LoginForm } from "./components/auth/LoginForm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationSystem />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryProvider>
);

export default App;