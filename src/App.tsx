import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Index from "./pages/Index";
import CalendarPage from "./pages/Calendar";
import LoginPage from "./pages/Login";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useToast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN') {
        try {
          // Ensure profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session?.user?.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            // Create profile if it doesn't exist
            if (profileError.code === 'PGRST116') {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.email?.split('@')[0] || 'User',
                });

              if (insertError) {
                console.error('Profile creation error:', insertError);
                toast({
                  title: "Error",
                  description: "There was an error setting up your profile. Please try again.",
                  variant: "destructive"
                });
                await supabase.auth.signOut();
                return;
              }
            } else {
              toast({
                title: "Error",
                description: "There was an error accessing your profile. Please try again.",
                variant: "destructive"
              });
              await supabase.auth.signOut();
              return;
            }
          }
        } catch (error) {
          console.error('Profile setup error:', error);
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return;
        }
      }
      
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;