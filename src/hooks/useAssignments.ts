import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, AssignmentStatus, AssignmentPriority } from "@/types/assignment";
import { useEffect } from "react";

export const useAssignments = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    console.log('Setting up realtime subscription for assignments...');
    
    const channel = supabase
      .channel('assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Assignment change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['assignments', projectId] });
        }
      )
      .subscribe();

    // Also listen for changes in assignment assignees
    const assigneesChannel = supabase
      .channel('assignment_assignees_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_assignees'
        },
        (payload) => {
          console.log('Assignment assignees change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['assignments', projectId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up assignments subscriptions');
      supabase.removeChannel(channel);
      supabase.removeChannel(assigneesChannel);
    };
  }, [projectId, queryClient]);

  return useQuery({
    queryKey: ['assignments', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('Fetching assignments for project:', projectId);
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_assignees (
            user:profiles(*)
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      console.log('Assignments fetched successfully:', assignmentsData);
      return assignmentsData.map((assignment): Assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || "",
        dueDate: new Date(assignment.due_date),
        status: assignment.status as AssignmentStatus,
        priority: assignment.priority as AssignmentPriority,
        assignees: assignment.assignment_assignees?.map((aa: any) => ({
          id: aa.user.id,
          name: aa.user.name,
          email: aa.user.email,
          avatar: aa.user.avatar
        })) || []
      }));
    },
    enabled: !!projectId,
  });
};