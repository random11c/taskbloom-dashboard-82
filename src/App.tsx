import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Index from "./pages/Index";
import CalendarPage from "./pages/Calendar";
import LoginPage from "./pages/Login";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listeners...');
    
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { currentSession, error });
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }

        setSession(currentSession);
      } catch (error: any) {
        console.error('Error checking session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log('Auth state changed:', { event: _event, session: currentSession });
      setSession(currentSession);
      
      if (!currentSession) {
        queryClient.clear();
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={session}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={session ? <Navigate to="/" /> : <LoginPage />} 
            />
            <Route 
              path="/" 
              element={session ? <Index /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/calendar" 
              element={session ? <CalendarPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;