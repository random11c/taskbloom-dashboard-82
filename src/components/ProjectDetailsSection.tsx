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
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <ProjectActions
          projectId={projectId}
          isAdmin={isAdmin}
          onProjectDeleted={onProjectDeleted}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStats assignments={assignments} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <AssignmentList 
          assignments={assignments}
          onStatusChange={onStatusChange}
          onDeleteAssignment={onDeleteAssignment}
          onCreateClick={onCreateClick}
          isAdmin={isAdmin}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TeamManagement
          projectId={projectId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsSection;