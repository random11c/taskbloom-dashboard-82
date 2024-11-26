import { useState, useEffect } from "react";
import { Plus, Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CreateProjectDialog from "./CreateProjectDialog";
import { createProject } from "@/utils/projectMutations";
import { useToast } from "./ui/use-toast";

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
}

const ProjectList = ({
  onSelectProject,
  selectedProjectId,
}: ProjectListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add query to check if user is admin
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch projects with owner information
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner_id
        `)
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
    mutationFn: (variables: { name: string; description: string }) => 
      createProject(variables),
    onSuccess: (data) => {
      console.log('Project creation mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateDialogOpen(false);
    },
  });

  // Set up realtime subscription for projects and invitations
  useEffect(() => {
    console.log('Setting up realtime subscription for projects and invitations...');
    const projectsChannel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
      )
      .subscribe();

    const invitationsChannel = supabase
      .channel('invitations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invitations'
        },
        (payload) => {
          console.log('Invitation change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(invitationsChannel);
    };
  }, [queryClient]);

  const handleCreateProject = (name: string, description: string) => {
    createProjectMutation.mutate({ name, description });
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is the owner
    const project = projects.find(p => p.id === projectId);
    if (!project || project.owner_id !== currentUser?.id) {
      toast({
        title: "Permission Denied",
        description: "Only project owners can delete projects",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this project?")) return;

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
      
      if (selectedProjectId === projectId) {
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

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        <Button
          size="sm"
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`relative p-6 rounded-lg border transition-all cursor-pointer ${
              selectedProjectId === project.id
                ? "border-primary/50 bg-primary/5 shadow-md"
                : "border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Folder className={`h-5 w-5 ${
                  selectedProjectId === project.id ? "text-primary" : "text-gray-400"
                }`} />
                <h3 className="font-medium text-gray-900">{project.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => handleDeleteProject(project.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {project.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                {project.description}
              </p>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        )}
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