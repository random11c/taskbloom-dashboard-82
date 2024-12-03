import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { TeamMember } from "@/types/user";

interface TeamMemberListProps {
  members: TeamMember[];
  projectId: string;
  isAdmin: boolean;
  currentUserId?: string;
}

const TeamMemberList = ({ members, projectId, isAdmin, currentUserId }: TeamMemberListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return (
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
          ) : isAdmin && currentUserId !== member.id ? (
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
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
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
  );
};

export default TeamMemberList;