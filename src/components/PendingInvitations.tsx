import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

interface Invitation {
  id: string;
  project_id: string;
  inviter_id: string;
  status: string;
  created_at: string;
  project: {
    name: string;
  };
  inviter: {
    name: string;
  };
}

const PendingInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Fetching invitations...');
    fetchInvitations();
  }, []);

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

      // If accepted, add user to project members
      if (accept) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: invitation.project_id,
            user_id: user.user.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You have joined ${invitation.project.name}`
          : `You have declined the invitation to join ${invitation.project.name}`,
      });
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
    return <div>Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-lg font-semibold">Pending Invitations</h3>
      <div className="space-y-2">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div>
              <p className="font-medium">
                {invitation.inviter.name} invited you to join {invitation.project.name}
              </p>
              <p className="text-sm text-gray-500">
                Sent {new Date(invitation.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleInvitation(invitation.id, true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
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