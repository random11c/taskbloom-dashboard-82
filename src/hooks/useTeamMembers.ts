import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/user";

export const useTeamMembers = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          user:profiles(
            id,
            name,
            email,
            avatar,
            created_at
          ),
          role,
          project_id
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      return data.map((member): TeamMember => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.role,
        projectIds: [member.project_id],
        createdAt: new Date(member.user.created_at)
      }));
    },
    enabled: !!projectId,
  });
};