import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, AssignmentStatus, AssignmentPriority } from "@/types/assignment";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import CalendarAssignmentCard from "@/components/CalendarAssignmentCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CommentSection from "@/components/CommentSection";
import { Badge } from "@/components/ui/badge";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetchAssignments();
    
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
          console.log('Assignment changes detected, refreshing...');
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

      // Fetch all projects the user has access to
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.user.id);

      const { data: ownedProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.user.id);

      // Combine project IDs from both owned and member projects
      const projectIds = [
        ...(memberProjects?.map(p => p.project_id) || []),
        ...(ownedProjects?.map(p => p.id) || [])
      ];

      if (projectIds.length === 0) return;

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

      console.log('Fetched assignments:', assignmentsData);

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

  // Function to modify calendar day content
  const modifyDay = (date: Date) => {
    const dayAssignments = getDayAssignments(date);
    if (dayAssignments.length > 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 bg-[#E5DEFF] rounded-md opacity-50" />
          <span className="relative text-[#7E69AB] font-medium">
            {dayAssignments.length}
          </span>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Calendar</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasAssignment: (date) => getDayAssignments(date).length > 0
                }}
                modifiersStyles={{
                  hasAssignment: { 
                    backgroundColor: '#F1F0FB',
                    color: '#1A1F2C',
                    fontWeight: 'bold'
                  }
                }}
                className="rounded-md border shadow bg-white p-4"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Assignments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
              </h2>
              
              <div className="space-y-4">
                {selectedDate && getDayAssignments(selectedDate).map(assignment => (
                  <CalendarAssignmentCard key={assignment.id} assignment={assignment} />
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
