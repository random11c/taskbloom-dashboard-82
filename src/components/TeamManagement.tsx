import { useState } from "react";
import { UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMember } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";

interface TeamManagementProps {
  projectId: string;
  members: TeamMember[];
  onInviteMember: (email: string) => void;
  currentUser: { id: string; email: string };
}

const TeamManagement = ({ 
  projectId, 
  members, 
  onInviteMember,
  currentUser 
}: TeamManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInviteMember(inviteEmail);
    setIsDialogOpen(false);
    setInviteEmail("");
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${inviteEmail}`,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
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
              {member.id === currentUser.id ? "Admin" : "Member"}
            </span>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter member email"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invite</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;