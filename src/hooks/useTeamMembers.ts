import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/user";

export const useTeamMembers = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // First get the project owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          owner_id,
          owner:profiles!projects_owner_id_fkey(
            id,
            name,
            email,
            avatar,
            created_at
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Then get all project members
      const { data: memberData, error: memberError } = await supabase
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

      if (memberError) throw memberError;

      // Combine owner and members, ensuring no duplicates
      const allMembers: TeamMember[] = [
        {
          id: projectData.owner.id,
          name: projectData.owner.name,
          email: projectData.owner.email,
          avatar: projectData.owner.avatar,
          role: "editor",
          projectIds: [projectId],
          createdAt: new Date(projectData.owner.created_at)
        },
        ...memberData.map((member): TeamMember => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.role as "editor" | "viewer",
          projectIds: [member.project_id],
          createdAt: new Date(member.user.created_at)
        }))
      ];

      // Remove duplicates based on user ID
      return Array.from(new Map(allMembers.map(member => [member.id, member])).values());
    },
    enabled: !!projectId,
  });
};