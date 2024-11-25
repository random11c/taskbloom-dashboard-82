import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectActionsProps {
  projectId: string;
  isAdmin: boolean;
  onProjectDeleted: () => void;
}

const ProjectActions = ({ projectId, isAdmin, onProjectDeleted }: ProjectActionsProps) => {
  const { toast } = useToast();

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      onProjectDeleted();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 truncate">
        Project Overview
      </h2>
      {isAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteProject}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Delete Project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ProjectActions;