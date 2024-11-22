import { Calendar, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Error signing out",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully signed out');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <nav className="space-y-2 flex-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/calendar"
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Calendar className="h-5 w-5" />
          <span>Calendar</span>
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;