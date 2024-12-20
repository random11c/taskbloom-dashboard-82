import { Assignment } from "@/types/assignment";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import CommentSection from "./CommentSection";
import { useState } from "react";
import { AssignmentDetails } from "./AssignmentDetails";

interface AssignmentCardProps {
  assignment: Assignment;
  isAdmin: boolean;
  getPriorityColor: (priority: Assignment["priority"]) => string;
  getStatusColor: (status: Assignment["status"]) => string;
  onStatusChange: (assignmentId: string, newStatus: Assignment["status"]) => Promise<void>;
  onDelete: (assignmentId: string) => Promise<void>;
}

const DeleteButton = ({ onDelete }: { onDelete: () => Promise<void> }) => (
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
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AssignmentHeader = ({ 
  title, 
  description, 
  priority, 
  getPriorityColor 
}: { 
  title: string;
  description: string;
  priority: Assignment["priority"];
  getPriorityColor: (priority: Assignment["priority"]) => string;
}) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-[#1A1F2C] leading-tight">
      {title}
    </h3>
    <p className="text-sm text-[#8E9196] line-clamp-2">
      {description}
    </p>
    <Badge className={`${getPriorityColor(priority)} px-2 py-0.5`}>
      {priority}
    </Badge>
  </div>
);

const AssignmentCard = ({
  assignment,
  isAdmin,
  getPriorityColor,
  getStatusColor,
  onStatusChange,
  onDelete,
}: AssignmentCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-[#E5DEFF] rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <AssignmentHeader
            title={assignment.title}
            description={assignment.description}
            priority={assignment.priority}
            getPriorityColor={getPriorityColor}
          />
          {isAdmin && <DeleteButton onDelete={() => onDelete(assignment.id)} />}
        </div>

        <AssignmentDetails assignment={assignment} isAdmin={isAdmin} />

        <AssignmentStatusSelect
          status={assignment.status}
          onStatusChange={(value) => onStatusChange(assignment.id, value)}
          getStatusColor={getStatusColor}
        />

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-[#6E59A5] hover:text-[#7E69AB] transition-colors">
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            Comments
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <CommentSection assignmentId={assignment.id} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AssignmentCard;