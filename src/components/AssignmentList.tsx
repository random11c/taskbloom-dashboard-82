import { Assignment } from "@/types/assignment";
import { useQueryClient } from "@tanstack/react-query";
import AssignmentCard from "./AssignmentCard";
import AssignmentHeader from "./AssignmentHeader";

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
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-[#7E69AB] bg-[#E5DEFF]";
      case "low": return "text-[#6E59A5] bg-[#F1F0FB]";
    }
  };

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "completed": return "bg-[#E5DEFF] text-[#7E69AB]";
      case "in-progress": return "bg-[#F1F0FB] text-[#6E59A5]";
      case "pending": return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: Assignment["status"]) => {
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
    queryClient.setQueryData(['assignments'], (old: Assignment[] | undefined) => {
      if (!old) return old;
      return old.filter(assignment => assignment.id !== assignmentId);
    });

    await onDeleteAssignment(assignmentId);
  };

  return (
    <div className="p-6">
      <AssignmentHeader isAdmin={isAdmin} onCreateClick={onCreateClick} />

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-[#F1F0FB] rounded-lg">
            <p className="text-[#8E9196]">
              No assignments created yet. {isAdmin && "Create your first assignment to get started!"}
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              isAdmin={isAdmin}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentList;