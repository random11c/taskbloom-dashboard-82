import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Assignment } from "@/types/assignment";
import { format } from "date-fns";

interface CalendarPageProps {
  assignments: Assignment[];
}

const CalendarPage = ({ assignments }: CalendarPageProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dueTasks = assignments.filter(
    (assignment) =>
      date &&
      assignment.dueDate.toDateString() === date.toDateString()
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border bg-white p-4"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tasks Due {date ? format(date, "MMMM d, yyyy") : ""}
          </h2>
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
      </div>
    </div>
  );
};

export default CalendarPage;