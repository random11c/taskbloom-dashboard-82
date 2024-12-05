import { Assignment } from "@/types/assignment";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";
import CommentSection from "./CommentSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AssignmentCard from "./AssignmentCard";

interface AssignmentListProps {
  assignments: Assignment[];
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onCreateClick: () => void;
  isAdmin: boolean;
}

const AssignmentList = ({ 
  assignments, 
  onStatusChange, 
  onDeleteAssignment, 
  onCreateClick, 
  isAdmin 
}: AssignmentListProps) => {
  const queryClient = useQueryClient();

  const getPriorityColor = (priority: Assignment["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-[#7E69AB] bg-[#E5DEFF]";
      case "low":
        return "text-[#6E59A5] bg-[#F1F0FB]";
    }
  };

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-[#E5DEFF] text-[#7E69AB]";
      case "in-progress":
        return "bg-[#F1F0FB] text-[#6E59A5]";
      case "pending":
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: Assignment["status"]) => {
    const oldAssignments = queryClient.getQueryData(['assignments']) as Assignment[];
    queryClient.setQueryData(['assignments'], (old: Assignment[] | undefined) => {
      if (!old) return old;
      return old.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus }
          : assignment
      );
    });

    await onStatusChange(assignmentId, newStatus);
  };

  const handleDelete = async (assignmentId: string) => {
    const oldAssignments = queryClient.getQueryData(['assignments']) as Assignment[];
    queryClient.setQueryData(['assignments'], (old: Assignment[] | undefined) => {
      if (!old) return old;
      return old.filter(assignment => assignment.id !== assignmentId);
    });

    await onDeleteAssignment(assignmentId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1F2C]">Assignments</h2>
          <p className="text-sm text-[#8E9196] mt-1">Manage your project tasks</p>
        </div>
        {isAdmin && (
          <Button onClick={onCreateClick} className="bg-[#9b87f5] hover:bg-[#7E69AB]">
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-[#F1F0FB] rounded-lg">
            <p className="text-[#8E9196]">
              No assignments created yet. {isAdmin && "Create your first assignment to get started!"}
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <Dialog key={assignment.id}>
              <DialogTrigger asChild>
                <div>
                  <AssignmentCard
                    assignment={assignment}
                    isAdmin={isAdmin}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{assignment.title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <p className="text-gray-600 mb-4">{assignment.description}</p>
                  <CommentSection assignmentId={assignment.id} />
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentList;