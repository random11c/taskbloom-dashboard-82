import { Coworker } from "@/types/assignment";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssigneeDisplayProps {
  assignees: Coworker[];
  className?: string;
}

const AssigneeDisplay = ({ assignees, className = "" }: AssigneeDisplayProps) => {
  if (assignees.length === 0) return null;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {assignees.map(assignee => (
        <TooltipProvider key={assignee.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-white hover:z-10">
                <AvatarImage
                  src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}`}
                  alt={assignee.name}
                />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{assignee.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default AssigneeDisplay;