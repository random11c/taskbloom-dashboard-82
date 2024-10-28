import { ListTodo, Users, CheckCircle } from "lucide-react";
import { Assignment } from "@/types/assignment";

interface DashboardStatsProps {
  assignments: Assignment[];
}

const DashboardStats = ({ assignments }: DashboardStatsProps) => {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  ).length;
  const inProgressAssignments = assignments.filter(
    (a) => a.status === "in-progress"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Assignments</p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalAssignments}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Users className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-gray-900">
              {inProgressAssignments}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-semibold text-gray-900">
              {completedAssignments}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;