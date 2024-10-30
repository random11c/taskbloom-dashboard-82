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
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface AssignmentListProps {
  assignments: Assignment[];
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

const AssignmentList = ({ assignments, onStatusChange, onDeleteAssignment }: AssignmentListProps) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignments</h2>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No assignments created yet. Create your first assignment to get
              started!
            </p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {assignment.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(assignment.priority)}
                    >
                      {assignment.priority}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteAssignment(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentList;