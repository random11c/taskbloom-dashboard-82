import { Assignment } from "@/types/assignment";
import { format } from "date-fns";
import AssigneeDisplay from "./AssigneeDisplay";

interface AssignmentDetailsProps {
  assignment: Assignment;
  isAdmin: boolean;
}

export const AssignmentDetails = ({ assignment }: AssignmentDetailsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <AssigneeDisplay assignees={assignment.assignees} />
        <span className="text-sm text-gray-500">
          Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
        </span>
      </div>
    </div>
  );
};