import { useState } from "react";
import { Plus, ListTodo, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AssignmentList from "@/components/AssignmentList";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import DashboardStats from "@/components/DashboardStats";
import { Assignment } from "@/types/assignment";

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateAssignment = (assignment: Assignment) => {
    setAssignments((prev) => [...prev, assignment]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Assignment Created",
      description: "The assignment has been successfully created.",
    });
  };

  const handleStatusChange = (assignmentId: string, newStatus: Assignment["status"]) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, status: newStatus }
          : assignment
      )
    );
    toast({
      title: "Status Updated",
      description: "The assignment status has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Assignment
          </Button>
        </div>

        <DashboardStats assignments={assignments} />

        <div className="mt-8">
          <AssignmentList
            assignments={assignments}
            onStatusChange={handleStatusChange}
          />
        </div>

        <CreateAssignmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateAssignment={handleCreateAssignment}
        />
      </div>
    </div>
  );
};

export default Index;