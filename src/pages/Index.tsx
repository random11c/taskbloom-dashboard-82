import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import AssignmentList from "@/components/AssignmentList";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import DashboardStats from "@/components/DashboardStats";
import ProjectList from "@/components/ProjectList";
import Sidebar from "@/components/Sidebar";
import TeamManagement from "@/components/TeamManagement";
import { Assignment } from "@/types/assignment";
import { supabase } from "@/integrations/supabase/client";
import { useAssignments } from "@/hooks/useAssignments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useQuery } from "@tanstack/react-query";
import ProjectActions from "@/components/ProjectActions";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: assignments = [], isLoading: isLoadingAssignments } = useAssignments(selectedProjectId);
  const { data: teamMembers = [] } = useTeamMembers(selectedProjectId);

  const { data: isAdmin = false } = useQuery({
    queryKey: ['is-admin', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return false;
      console.log('Checking admin status for project:', selectedProjectId);
      const { data, error } = await supabase
        .rpc('is_project_admin', { p_project_id: selectedProjectId });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      console.log('Admin status:', data);
      return data;
    },
    enabled: !!selectedProjectId,
  });

  const handleCreateAssignment = async (assignment: Assignment) => {
    try {
      console.log('Creating new assignment:', assignment);
      const { error } = await supabase
        .from('assignments')
        .insert([{
          title: assignment.title,
          description: assignment.description,
          project_id: selectedProjectId,
          due_date: assignment.dueDate.toISOString(),
          status: assignment.status,
          priority: assignment.priority,
        }]);

      if (error) throw error;
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      console.log('Updating assignment status:', { assignmentId, newStatus });
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
      console.log('Deleting assignment:', assignmentId);
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Project Dashboard
          </h1>

          <div className="grid grid-cols-12 gap-6 mt-8">
            <div className="col-span-12 md:col-span-3">
              <ProjectList
                onSelectProject={setSelectedProjectId}
                selectedProjectId={selectedProjectId}
              />
            </div>

            <div className="col-span-12 md:col-span-9">
              {selectedProjectId ? (
                <>
                  <ProjectActions
                    projectId={selectedProjectId}
                    isAdmin={isAdmin}
                    onCreateClick={() => setIsCreateDialogOpen(true)}
                    onProjectDeleted={() => setSelectedProjectId(undefined)}
                  />

                  <DashboardStats assignments={assignments} />

                  <div className="mt-8">
                    <AssignmentList 
                      assignments={assignments}
                      onStatusChange={handleStatusChange}
                      onDeleteAssignment={handleDeleteAssignment}
                      isAdmin={isAdmin}
                    />
                  </div>

                  <div className="mt-8">
                    <TeamManagement
                      projectId={selectedProjectId}
                      isAdmin={isAdmin}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] bg-white rounded-lg border border-gray-100">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Project Selected
                    </h3>
                    <p className="text-gray-500">
                      Select a project from the sidebar or create a new one to get
                      started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default Index;