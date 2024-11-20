import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
}

const ProjectList = ({
  onSelectProject,
  selectedProjectId,
}: ProjectListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    mutationFn: async (newProject: { name: string; description: string | null }) => {
      console.log('Creating new project:', newProject);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        throw new Error('Not authenticated');
      }

      console.log('Current user:', user.user);

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: newProject.name,
            description: newProject.description,
            owner_id: user.user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Project creation error:', error);
        throw error;
      }

      console.log('Project created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Project creation mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setName("");
      setDescription("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting project creation form:', { name, description });
    createProjectMutation.mutate({ name, description });
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectList;