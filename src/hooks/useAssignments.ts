import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment } from "@/types/assignment";

export const useAssignments = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['assignments', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_assignees (
            user:profiles(*)
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      return assignmentsData.map((assignment): Assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || "",
        dueDate: new Date(assignment.due_date),
        status: assignment.status,
        priority: assignment.priority,
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