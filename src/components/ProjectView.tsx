import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProjectDetailsSection from "./ProjectDetailsSection";
import CreateAssignmentDialog from "./CreateAssignmentDialog";
import { useAssignments } from "@/hooks/useAssignments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useState } from "react";
import { Assignment } from "@/types/assignment";
import { useToast } from "./ui/use-toast";

interface ProjectViewProps {
  projectId: string;
  onProjectDeleted: () => void;
}

const ProjectView = ({ projectId, onProjectDeleted }: ProjectViewProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: assignments = [], isLoading: isLoadingAssignments } = useAssignments(projectId);
  const { data: teamMembers = [] } = useTeamMembers(projectId);
  
  const { data: isAdmin = false } = useQuery({
    queryKey: ['is-admin', projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: projectData } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (projectData?.owner_id === user.id) return true;

      const { data: memberData } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      return memberData?.role === 'editor';
    },
    enabled: !!projectId,
  });

  const handleCreateAssignment = async (assignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .insert([{
          title: assignment.title,
          description: assignment.description,
          project_id: projectId,
          due_date: assignment.dueDate.toISOString(),
          status: assignment.status,
          priority: assignment.priority,
        }]);

      if (error) throw error;
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectDetailsSection
        projectId={projectId}
        isAdmin={isAdmin}
        assignments={assignments}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        onProjectDeleted={onProjectDeleted}
        onStatusChange={handleStatusChange}
        onDeleteAssignment={handleDeleteAssignment}
      />

      {isAdmin && (
        <CreateAssignmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateAssignment={handleCreateAssignment}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
};

export default ProjectView;