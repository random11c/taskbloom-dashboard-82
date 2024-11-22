import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, AssignmentStatus, AssignmentPriority } from "@/types/assignment";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { useQueryClient } from "@tanstack/react-query";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchAssignments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments'
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.user.id);

      const projectIds = memberProjects?.map(p => p.project_id) || [];

      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_assignees (
            user:profiles(*)
          )
        `)
        .in('project_id', projectIds);

      if (error) throw error;

      const formattedAssignments = assignmentsData.map((assignment): Assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || "",
        dueDate: new Date(assignment.due_date),
        status: assignment.status as AssignmentStatus,
        priority: assignment.priority as AssignmentPriority,
        assignees: assignment.assignment_assignees?.map((aa: any) => ({
          id: aa.user.id,
          name: aa.user.name,
          email: aa.user.email,
          avatar: aa.user.avatar
        })) || []
      }));

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayAssignments = (date: Date) => {
    return assignments.filter(assignment => 
      format(assignment.dueDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Calendar</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border shadow bg-white"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Assignments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
              </h2>
              
              <div className="space-y-4">
                {selectedDate && getDayAssignments(selectedDate).map(assignment => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                          assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {assignment.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      {assignment.description}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Due {format(assignment.dueDate, 'h:mm a')}
                      </span>
                    </div>

                    {assignment.assignees.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">Assignees:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.assignees.map(assignee => (
                            <span
                              key={assignee.id}
                              className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-sm"
                            >
                              {assignee.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {selectedDate && getDayAssignments(selectedDate).length === 0 && (
                  <p className="text-gray-500">No assignments due on this date.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;