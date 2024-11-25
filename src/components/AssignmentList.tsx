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

interface AssignmentListProps {
  assignments: Assignment[];
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onCreateClick: () => void;
  isAdmin: boolean;
}

const AssignmentList = ({ assignments, onStatusChange, onDeleteAssignment, onCreateClick, isAdmin }: AssignmentListProps) => {
  const getPriorityColor = (priority: Assignment["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
    }
  };

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your project tasks</p>
        </div>
        {isAdmin && (
          <Button
            onClick={onCreateClick}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Assignment
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No assignments created yet. {isAdmin && "Create your first assignment to get started!"}
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      onClick={() => onDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <Badge className={getPriorityColor(assignment.priority)}>
                    {assignment.priority}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {assignment.assignees.map((assignee) => (
                    <img
                      key={assignee.id}
                      src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}`}
                      alt={assignee.name}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      title={assignee.name}
                    />
                  ))}
                </div>

                <Select
                  value={assignment.status}
                  onValueChange={(value: Assignment["status"]) =>
                    onStatusChange(assignment.id, value)
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentList;