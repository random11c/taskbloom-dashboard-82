import { useState } from "react";
import { Assignment } from "@/types/assignment";
import { format } from "date-fns";
import Sidebar from "@/components/Sidebar";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CalendarPageProps {
  assignments: Assignment[];
}

const CalendarPage = ({ assignments }: CalendarPageProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const dueTasks = assignments.filter(
    (assignment) =>
      date &&
      new Date(assignment.dueDate).toDateString() === date.toDateString()
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && assignments.some(a => 
      new Date(a.dueDate).toDateString() === newDate.toDateString()
    )) {
      setIsDetailsOpen(true);
    }
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
                        new Date(assignment.dueDate).toDateString() === date.toDateString()
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

            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    Tasks Due {date ? format(date, "MMMM d, yyyy") : ""}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {dueTasks.length === 0 ? (
                    <p className="text-gray-500">No tasks due on this date.</p>
                  ) : (
                    <div className="space-y-4">
                      {dueTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.assignees.map((assignee) => (
                              <div
                                key={assignee.id}
                                className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm"
                              >
                                <img
                                  src={assignee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}`}
                                  alt={assignee.name}
                                  className="w-4 h-4 rounded-full"
                                />
                                <span>{assignee.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;