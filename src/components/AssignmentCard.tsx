import { Assignment } from "@/types/assignment";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
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
import AssignmentStatusSelect from "./AssignmentStatusSelect";

interface AssignmentCardProps {
  assignment: Assignment;
  isAdmin: boolean;
  getPriorityColor: (priority: Assignment["priority"]) => string;
  getStatusColor: (status: Assignment["status"]) => string;
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => Promise<void>;
  onDelete: (assignmentId: string) => Promise<void>;
}

const AssignmentCard = ({
  assignment,
  isAdmin,
  getPriorityColor,
  getStatusColor,
  onStatusChange,
  onDelete,
}: AssignmentCardProps) => {
  return (
    <div className="flex flex-col p-6 bg-white border border-[#E5DEFF] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
                onClick={(e) => e.stopPropagation()}
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
                  onClick={() => onDelete(assignment.id)}
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
        <AssignmentStatusSelect
          status={assignment.status}
          onStatusChange={(value) => onStatusChange(assignment.id, value)}
          getStatusColor={getStatusColor}
        />
      </div>
    </div>
  );
};

export default AssignmentCard;