import { Assignment } from "@/types/assignment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignmentStatusSelectProps {
  status: Assignment["status"];
  onStatusChange: (value: Assignment["status"]) => Promise<void>;
  getStatusColor: (status: Assignment["status"]) => string;
}

const AssignmentStatusSelect = ({
  status,
  onStatusChange,
  getStatusColor,
}: AssignmentStatusSelectProps) => {
  return (
    <Select
      value={status}
      onValueChange={onStatusChange}
    >
      <SelectTrigger 
        className="w-[140px]"
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue>
          <span
            className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="in-progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default AssignmentStatusSelect;