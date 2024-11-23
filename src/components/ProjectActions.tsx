import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProjectActionsProps {
  projectId: string;
  isAdmin: boolean;
  onCreateClick: () => void;
  onProjectDeleted: () => void;
}

const ProjectActions = ({ projectId, isAdmin, onCreateClick, onProjectDeleted }: ProjectActionsProps) => {
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Project Details
      </h2>
      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <>
            <Button
              onClick={onCreateClick}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Assignment
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Project
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectActions;