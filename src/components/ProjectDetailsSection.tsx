import { Assignment } from "@/types/assignment";
import ProjectActions from "./ProjectActions";
import DashboardStats from "./DashboardStats";
import AssignmentList from "./AssignmentList";
import TeamManagement from "./TeamManagement";

interface ProjectDetailsSectionProps {
  projectId: string;
  isAdmin: boolean;
  assignments: Assignment[];
  onCreateClick: () => void;
  onProjectDeleted: () => void;
  onStatusChange: (assignmentId: string, newStatus: Assignment['status']) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

const ProjectDetailsSection = ({
  projectId,
  isAdmin,
  assignments,
  onCreateClick,
  onProjectDeleted,
  onStatusChange,
  onDeleteAssignment,
}: ProjectDetailsSectionProps) => {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <ProjectActions
        projectId={projectId}
        isAdmin={isAdmin}
        onCreateClick={onCreateClick}
        onProjectDeleted={onProjectDeleted}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardStats assignments={assignments} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <AssignmentList 
          assignments={assignments}
          onStatusChange={onStatusChange}
          onDeleteAssignment={onDeleteAssignment}
          isAdmin={isAdmin}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <TeamManagement
          projectId={projectId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsSection;