import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AssignmentList from "@/components/AssignmentList";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import DashboardStats from "@/components/DashboardStats";
import ProjectList from "@/components/ProjectList";
import TeamManagement from "@/components/TeamManagement";
import Sidebar from "@/components/Sidebar";
import PendingInvitations from "@/components/PendingInvitations";
import { Assignment } from "@/types/assignment";
import { supabase } from "@/integrations/supabase/client";
import { useAssignments } from "@/hooks/useAssignments";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: assignments = [], isLoading: isLoadingAssignments } = useAssignments(selectedProjectId);
  const { data: teamMembers = [] } = useTeamMembers(selectedProjectId);

  const handleCreateAssignment = async (assignment: Assignment) => {
    try {
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

      toast({
        title: "Assignment Created",
        description: "Your new assignment has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
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

      toast({
        title: "Status Updated",
        description: "Assignment status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Assignment Deleted",
        description: "The assignment has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
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

          <PendingInvitations />

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
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Project Details
                    </h2>
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Assignment
                    </Button>
                  </div>

                  <DashboardStats assignments={assignments} />

                  <div className="mt-8 space-y-8">
                    <TeamManagement projectId={selectedProjectId} />
                    <AssignmentList 
                      assignments={assignments}
                      onStatusChange={handleStatusChange}
                      onDeleteAssignment={handleDeleteAssignment}
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

      <CreateAssignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateAssignment={handleCreateAssignment}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default Index;