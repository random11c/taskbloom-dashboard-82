import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import ProjectList from "@/components/ProjectList";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import PendingInvitations from "@/components/PendingInvitations";
import ProjectDetailsSection from "@/components/ProjectDetailsSection";
import { Assignment } from "@/types/assignment";
import { supabase } from "@/integrations/supabase/client";
import { useAssignments } from "@/hooks/useAssignments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  useEffect(() => {
    console.log('Setting up realtime subscription for projects...');
    const channel = supabase
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

    return () => {
      console.log('Cleaning up projects subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Set up realtime subscription for assignments
  useEffect(() => {
    if (!selectedProjectId) return;

    console.log('Setting up realtime subscription for assignments...');
    const channel = supabase
      .channel('assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `project_id=eq.${selectedProjectId}`
        },
        (payload) => {
          console.log('Assignment change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['assignments', selectedProjectId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up assignments subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId, queryClient]);

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
      
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2 md:hidden">
          <MobileNav />
        </div>
        
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <PendingInvitations />
            
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Project Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <ProjectList
                  onSelectProject={setSelectedProjectId}
                  selectedProjectId={selectedProjectId}
                />
              </div>

              <div className="md:col-span-9">
                {selectedProjectId ? (
                  <ProjectDetailsSection
                    projectId={selectedProjectId}
                    isAdmin={isAdmin}
                    assignments={assignments}
                    onCreateClick={() => setIsCreateDialogOpen(true)}
                    onProjectDeleted={() => setSelectedProjectId(undefined)}
                    onStatusChange={handleStatusChange}
                    onDeleteAssignment={handleDeleteAssignment}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[400px] bg-white rounded-lg border border-gray-100 p-8">
                    <div className="text-center max-w-md">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No Project Selected
                      </h3>
                      <p className="text-gray-500">
                        Select a project from the sidebar or create a new one to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
