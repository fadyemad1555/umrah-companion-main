import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import Visas from "./pages/Visas";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { AuthGuard } from "./components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/customers" element={<AuthGuard><Customers /></AuthGuard>} />
          <Route path="/bookings" element={<AuthGuard><Bookings /></AuthGuard>} />
          <Route path="/visas" element={<AuthGuard><Visas /></AuthGuard>} />
          <Route path="/reports" element={<AuthGuard><Reports /></AuthGuard>} />
          <Route path="/expenses" element={<AuthGuard><Expenses /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
