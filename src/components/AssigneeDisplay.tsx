import { Coworker } from "@/types/assignment";
import { Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssigneeDisplayProps {
  assignees: Coworker[];
  className?: string;
}

const AssigneeDisplay = ({ assignees, className = "" }: AssigneeDisplayProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {assignees.length} assignee{assignees.length !== 1 ? 's' : ''}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {assignees.map(assignee => (
              <div key={assignee.id} className="flex items-center gap-2">
                <img
                  src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}`}
                  alt={assignee.name}
                  className="w-5 h-5 rounded-full"
                />
                <span>{assignee.name}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AssigneeDisplay;