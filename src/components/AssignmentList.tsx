import { Assignment } from "@/types/assignment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import AssigneeDisplay from "./AssigneeDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import CommentSection from "./CommentSection";

interface AssignmentListProps {
  assignments: Assignment[];
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onCreateClick: () => void;
  isAdmin: boolean;
}

const AssignmentList = ({ assignments, onStatusChange, onDeleteAssignment, onCreateClick, isAdmin }: AssignmentListProps) => {
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
            <div
              key={assignment.id}
              className="flex flex-col p-6 bg-white border border-[#E5DEFF] rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-[#1A1F2C]">{assignment.title}</h3>
                  <p className="text-sm text-[#8E9196] mt-1 line-clamp-2">{assignment.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <Badge className={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                    <span className="text-sm text-[#8E9196]">
                      Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                    </span>
                    <AssigneeDisplay assignees={assignment.assignees} />
                  </div>
                </div>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this assignment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(assignment.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="flex items-center gap-6 mt-4">
                <Select
                  value={assignment.status}
                  onValueChange={(value: Assignment["status"]) =>
                    handleStatusChange(assignment.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add CommentSection component */}
              <CommentSection assignmentId={assignment.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentList;
