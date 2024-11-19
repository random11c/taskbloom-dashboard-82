import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteMemberDialog from "./InviteMemberDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface TeamManagementProps {
  projectId: string;
}

const TeamManagement = ({ projectId }: TeamManagementProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          role,
          profiles:user_id (
            id,
            name,
            email,
            avatar
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      return data.map(member => ({
        id: member.profiles.id,
        name: member.profiles.name,
        email: member.profiles.email,
        avatar: member.profiles.avatar,
        role: member.role,
      })) as TeamMember[];
    },
  });

  if (isLoading) {
    return <div>Loading team members...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
          >
            <div className="flex items-center">
              <img
                src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
              {member.role}
            </span>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No team members yet. Invite someone to get started!
          </div>
        )}
      </div>

      <InviteMemberDialog
        projectId={projectId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
};

export default TeamManagement;