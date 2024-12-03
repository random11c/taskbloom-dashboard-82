import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Invitation {
  id: string;
  project_id: string;
  inviter_id: string;
  status: string;
  created_at: string;
  project: {
    name: string;
  } | null;
  inviter: {
    name: string;
  } | null;
}

const PendingInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up invitations...');
    fetchInvitations();

    // Set up realtime subscription
    const channel = supabase
      .channel('invitations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invitations'
        },
        (payload) => {
          console.log('Invitation change detected:', payload);
          fetchInvitations();
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({ queryKey: ['team-members'] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up invitations subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const fetchInvitations = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('No authenticated user found');
        return;
      }

      console.log('Fetching invitations for user:', user.user.email);
      const { data, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          project_id,
          inviter_id,
          status,
          created_at,
          project:projects(name),
          inviter:profiles!inviter_id(name)
        `)
        .eq('invitee_email', user.user.email)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }
      
      console.log('Fetched invitations:', data);
      setInvitations(data as unknown as Invitation[]);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      console.log('Handling invitation:', { invitationId, accept });
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('project_invitations')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // If accepted, add user to project members with viewer role
      if (accept) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: invitation.project_id,
            user_id: user.user.id,
            role: 'viewer'
          });

        if (memberError) throw memberError;
      }

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You have joined ${invitation.project?.name || 'the project'}`
          : `You have declined the invitation to join ${invitation.project?.name || 'the project'}`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (error) {
      console.error('Error handling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to process invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-20 rounded-lg"></div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-col p-4 border rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {invitation.inviter?.name || 'Someone'} invited you to join {invitation.project?.name || 'a project'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Sent {new Date(invitation.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleInvitation(invitation.id, true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => handleInvitation(invitation.id, false)}
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvitations;