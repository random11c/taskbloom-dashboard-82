import { Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: any;
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  currentUser: any;
}

const ProjectCard = ({
  project,
  selectedProjectId,
  onSelectProject,
  currentUser,
}: ProjectCardProps) => {
  const { toast } = useToast();

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      if (selectedProjectId === project.id) {
        onSelectProject('');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const isOwner = currentUser?.id === project.owner_id;

  return (
    <div
      onClick={() => onSelectProject(project.id)}
      className={`relative p-6 rounded-lg border transition-all cursor-pointer ${
        selectedProjectId === project.id
          ? "border-[#9b87f5] bg-[#F1F0FB] shadow-md"
          : "border-gray-200 bg-white hover:border-[#9b87f5] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Folder className={`h-5 w-5 ${
            selectedProjectId === project.id ? "text-[#9b87f5]" : "text-[#8E9196]"
          }`} />
          <h3 className="font-medium text-[#1A1F2C]">{project.name}</h3>
        </div>
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProject}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {project.description && (
        <p className="mt-2 text-sm text-[#8E9196] line-clamp-3">
          {project.description}
        </p>
      )}
      <p className="mt-2 text-xs text-[#8E9196]">
        Created on {format(new Date(project.created_at), "MMM d, yyyy")}
      </p>
    </div>
  );
};

export default ProjectCard;