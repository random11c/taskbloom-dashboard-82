import { Assignment } from "@/types/assignment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  assignments: Assignment[];
}

const DashboardStats = ({ assignments }: DashboardStatsProps) => {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === "completed").length;
  const inProgressAssignments = assignments.filter(a => a.status === "in-progress").length;
  const pendingAssignments = assignments.filter(a => a.status === "pending").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Assignments</CardTitle>
        </CardHeader>
        <CardContent>{totalAssignments}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Completed Assignments</CardTitle>
        </CardHeader>
        <CardContent>{completedAssignments}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>In Progress Assignments</CardTitle>
        </CardHeader>
        <CardContent>{inProgressAssignments}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Assignments</CardTitle>
        </CardHeader>
        <CardContent>{pendingAssignments}</CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;