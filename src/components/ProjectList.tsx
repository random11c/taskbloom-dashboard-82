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
import { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
  onCreateProject: (project: Project) => void;
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
}

const ProjectList = ({
  projects,
  onCreateProject,
  onSelectProject,
  selectedProjectId,
}: ProjectListProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: "1", // In a real app, this would be the current user's ID
      assignments: [],
    };
    onCreateProject(newProject);
    setIsCreateDialogOpen(false);
    setName("");
    setDescription("");
  };

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
                required
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
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectList;