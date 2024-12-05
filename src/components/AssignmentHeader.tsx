import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface AssignmentHeaderProps {
  isAdmin: boolean;
  onCreateClick: () => void;
}

const AssignmentHeader = ({ isAdmin, onCreateClick }: AssignmentHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-[#1A1F2C]">Assignments</h2>
        <p className="text-sm text-[#8E9196]">Manage your project tasks</p>
      </div>
      {isAdmin && (
        <Button 
          onClick={onCreateClick} 
          className="bg-[#9b87f5] hover:bg-[#7E69AB] transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      )}
    </div>
  );
};

export default AssignmentHeader;