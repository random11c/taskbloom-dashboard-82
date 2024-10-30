import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CalendarPage from "./pages/Calendar";
import { useState, useEffect } from "react";
import { Assignment } from "./types/assignment";

const queryClient = new QueryClient();

const App = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const savedAssignments = localStorage.getItem('assignments');
    return savedAssignments ? JSON.parse(savedAssignments) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedAssignments = localStorage.getItem('assignments');
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<CalendarPage assignments={assignments} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;