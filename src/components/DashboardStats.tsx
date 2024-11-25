import { Assignment } from "@/types/assignment";

interface DashboardStatsProps {
  assignments: Assignment[];
}

const DashboardStats = ({ assignments }: DashboardStatsProps) => {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === "completed").length;
  const inProgressAssignments = assignments.filter(a => a.status === "in-progress").length;
  const pendingAssignments = assignments.filter(a => a.status === "pending").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-4xl font-semibold text-primary mb-2">
            {totalAssignments}
          </span>
          <span className="text-sm text-gray-600">Total Assignments</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-4xl font-semibold text-green-500 mb-2">
            {completedAssignments}
          </span>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-4xl font-semibold text-blue-500 mb-2">
            {inProgressAssignments}
          </span>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-4xl font-semibold text-gray-500 mb-2">
            {pendingAssignments}
          </span>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;