
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ServicesList from "./pages/ServicesList";
import ServiceDetail from "./pages/ServiceDetail";
import BookingPage from "./pages/BookingPage";
import WaitlistPage from "./pages/WaitlistPage";
import NotFound from "./pages/NotFound";
import BookingsDashboard from "./pages/BookingsDashboard";
import BookingDetail from "./pages/BookingDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/bookings" element={<BookingsDashboard />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/unavailable" element={<WaitlistPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
