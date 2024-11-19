import { useState } from "react";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { Calendar } from "@/components/ui/calendar";
import CommentSection from "@/components/CommentSection";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', date?.toISOString()],
    queryFn: async () => {
      if (!date) return [];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignees:assignment_assignees(
            user:profiles(*)
          )
        `)
        .gte('due_date', startOfDay.toISOString())
        .lte('due_date', endOfDay.toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border bg-white p-4"
                modifiers={{
                  hasTasks: (date) => 
                    assignments.some(
                      (assignment) => 
                        new Date(assignment.due_date).toDateString() === date.toDateString()
                    )
                }}
                modifiersStyles={{
                  hasTasks: {
                    fontWeight: "bold",
                    backgroundColor: "rgb(219 234 254)",
                  }
                }}
              />
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tasks Due {date ? format(date, "MMMM d, yyyy") : ""}
              </h2>
              {isLoading ? (
                <p className="text-gray-500">Loading assignments...</p>
              ) : assignments.length === 0 ? (
                <p className="text-gray-500">No tasks due on this date.</p>
              ) : (
                <div className="space-y-6">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{assignment.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {assignment.assignees.map(({ user }) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 bg-white px-2 py-1 rounded-full text-sm"
                          >
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                              alt={user.name}
                              className="w-4 h-4 rounded-full"
                            />
                            <span>{user.name}</span>
                          </div>
                        ))}
                      </div>
                      
                      <CommentSection assignmentId={assignment.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;