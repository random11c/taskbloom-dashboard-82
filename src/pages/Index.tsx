import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateAssignmentDialog from "@/components/CreateAssignmentDialog";
import DashboardStats from "@/components/DashboardStats";
import ProjectList from "@/components/ProjectList";
import TeamManagement from "@/components/TeamManagement";
import LoginForm from "@/components/LoginForm";
import { Assignment } from "@/types/assignment";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/user";
import { AuthUser, LoginCredentials } from "@/types/auth";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogin = (credentials: LoginCredentials) => {
    // In a real app, this would make an API call
    const mockUser: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: credentials.email,
      name: credentials.email.split('@')[0],
      createdAt: new Date(),
    };
    setCurrentUser(mockUser);
    toast({
      title: "Logged in successfully",
      description: `Welcome back, ${mockUser.name}!`,
    });
  };

  const handleCreateProject = (project: Project) => {
    if (!currentUser) return;
    
    const newProject = {
      ...project,
      ownerId: currentUser.id,
    };
    
    setProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    
    // Add creator as admin member
    const adminMember: TeamMember = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "admin",
      projectIds: [newProject.id],
      createdAt: currentUser.createdAt,
    };
    setTeamMembers((prev) => [...prev, adminMember]);
    
    toast({
      title: "Project Created",
      description: "The project has been successfully created.",
    });
  };

  const handleInviteMember = (email: string) => {
    // In a real app, this would send an email invitation
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${email}`,
    });
  };

  const handleCreateAssignment = (assignment: Assignment) => {
    if (selectedProjectId) {
      setAssignments((prev) => [...prev, assignment]);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProjectId
            ? { ...p, assignments: [...p.assignments, assignment.id] }
            : p
        )
      );
      setIsCreateDialogOpen(false);
      toast({
        title: "Assignment Created",
        description: "The assignment has been successfully created.",
      });
    }
  };

  const handleStatusChange = (
    assignmentId: string,
    newStatus: Assignment["status"]
  ) => {
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

  const currentProjectAssignments = assignments.filter((assignment) =>
    projects
      .find((p) => p.id === selectedProjectId)
      ?.assignments.includes(assignment.id)
  );

  const currentProjectMembers = teamMembers.filter((member) =>
    member.projectIds.includes(selectedProjectId || "")
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as {currentUser.email}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentUser(null)}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3">
            <ProjectList
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={setSelectedProjectId}
              selectedProjectId={selectedProjectId}
            />
          </div>

          <div className="col-span-12 md:col-span-9">
            {selectedProjectId ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {projects.find((p) => p.id === selectedProjectId)?.name}
                  </h2>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Assignment
                  </Button>
                </div>

                <DashboardStats assignments={currentProjectAssignments} />

                <div className="mt-8 space-y-8">
                  <TeamManagement
                    projectId={selectedProjectId}
                    members={currentProjectMembers}
                    onInviteMember={handleInviteMember}
                    currentUser={currentUser}
                  />
                  
                  <AssignmentList
                    assignments={currentProjectAssignments}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] bg-white rounded-lg border border-gray-100">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Project Selected
                  </h3>
                  <p className="text-gray-500">
                    Select a project from the sidebar or create a new one to get
                    started.
                  </p>
                </div>
              </div>
            )}
          </div>
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
