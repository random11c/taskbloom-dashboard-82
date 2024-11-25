import { Assignment } from "@/types/assignment";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import AssigneeDisplay from "./AssigneeDisplay";

interface CalendarAssignmentCardProps {
  assignment: Assignment;
}

const CalendarAssignmentCard = ({ assignment }: CalendarAssignmentCardProps) => {
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
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{assignment.title}</h3>
        <AssigneeDisplay assignees={assignment.assignees} />
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        {assignment.description}
      </p>

      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            Due {format(assignment.dueDate, 'h:mm a')}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
          {assignment.status}
        </span>
      </div>
    </div>
  );
};

export default CalendarAssignmentCard;