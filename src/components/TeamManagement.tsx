import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InviteMemberDialog from "./InviteMemberDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isOwner: boolean;
}

interface TeamManagementProps {
  projectId: string;
  isAdmin: boolean;
}

const TeamManagement = ({ projectId, isAdmin }: TeamManagementProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
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

      const { data, error } = await supabase
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

      if (error) throw error;

      return data.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.role as "admin" | "member",
        isOwner: member.user.id === projectData.owner_id
      }));
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
      toast({
        title: "Role Updated",
        description: "Team member's role has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

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
            {member.isOwner ? (
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700">
                Owner
              </span>
            ) : isAdmin && currentUser?.id !== member.id ? (
              <Select
                value={member.role}
                onValueChange={(newRole) => 
                  updateRoleMutation.mutate({ userId: member.id, newRole })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                {member.role}
              </span>
            )}
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