import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteMemberDialog from "./InviteMemberDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TeamMemberList from "./TeamMemberList";
import { TeamMember } from "@/types/user";
import { useEffect } from "react";

interface TeamManagementProps {
  projectId: string;
  isAdmin: boolean;
}

const TeamManagement = ({ projectId, isAdmin }: TeamManagementProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // First get the owner's profile
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', projectData.owner_id)
        .single();

      if (ownerError) throw ownerError;

      // Then get all project members
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select(`
          role,
          user:profiles(
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('project_id', projectId);

      if (memberError) throw memberError;

      const allMembers: TeamMember[] = [
        {
          id: ownerData.id,
          name: ownerData.name,
          email: ownerData.email,
          avatar: ownerData.avatar,
          role: "editor",
          isOwner: true
        },
        ...memberData.map((member): TeamMember => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.role as "editor" | "viewer",
          isOwner: false
        }))
      ];

      // Remove duplicates based on user ID
      return Array.from(new Map(allMembers.map(member => [member.id, member])).values());
    },
    enabled: !!projectId,
  });

  // Set up realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription for team members...');
    
    const channel = supabase
      .channel('team_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Project members change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up team members subscription');
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  if (isLoading) {
    return <div>Loading team members...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        {isAdmin && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <TeamMemberList 
        members={members}
        projectId={projectId}
        isAdmin={isAdmin}
        currentUserId={currentUser?.id}
      />

      <InviteMemberDialog
        projectId={projectId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
};

export default TeamManagement;