import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectActionsProps {
  projectId: string;
  isAdmin: boolean;
  onCreateClick: () => void;
  onProjectDeleted: () => void;
}

const ProjectActions = ({ projectId, isAdmin, onCreateClick, onProjectDeleted }: ProjectActionsProps) => {
  const handleDeleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      onProjectDeleted();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-xl font-semibold text-gray-900">
        Project Details
      </h2>
      {isAdmin && (
        <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
};

export default ProjectActions;