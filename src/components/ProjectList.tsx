import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateProjectDialog from "./CreateProjectDialog";
import { createProject } from "@/utils/projectMutations";

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
}

const ProjectList = ({
  onSelectProject,
  selectedProjectId,
}: ProjectListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Projects fetched successfully:', data);
      return data;
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      console.log('Project creation mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Project creation mutation error:', error);
      toast({
        title: "Error",
        description: error?.message || "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = (name: string, description: string) => {
    createProjectMutation.mutate(name, description);
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        <Button
          size="sm"
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              selectedProjectId === project.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Folder className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">{project.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {project.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
        isLoading={createProjectMutation.isPending}
      />
    </div>
  );
};

export default ProjectList;