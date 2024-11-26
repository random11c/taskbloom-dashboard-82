import { useState } from "react";
import ProjectList from "@/components/ProjectList";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import PendingInvitations from "@/components/PendingInvitations";
import ProjectView from "@/components/ProjectView";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  const handleBackToProjects = () => {
    setSelectedProjectId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2 md:hidden">
          <MobileNav />
        </div>
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <PendingInvitations />
            
            {selectedProjectId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToProjects}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Projects
                  </Button>
                </div>
                <ProjectView 
                  projectId={selectedProjectId} 
                  onProjectDeleted={handleBackToProjects}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Project Dashboard
                </h1>
                <ProjectList
                  onSelectProject={setSelectedProjectId}
                  selectedProjectId={selectedProjectId}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;