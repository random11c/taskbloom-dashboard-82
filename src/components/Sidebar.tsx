import { Calendar, LayoutDashboard, Settings, Users } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Assignment } from "@/types/assignment";

interface SidebarProps {
  assignments: Assignment[];
}

const Sidebar = ({ assignments }: SidebarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Filter assignments due on selected date
  const dueTasks = assignments.filter(
    (assignment) =>
      date &&
      assignment.dueDate.toDateString() === date.toDateString()
  );

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <nav className="space-y-2 mb-8">
        <a
          href="#"
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Users className="h-5 w-5" />
          <span>Team</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </a>
      </nav>

      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Calendar</h3>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />

        {dueTasks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Tasks Due Today
            </h3>
            <div className="space-y-2">
              {dueTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2 bg-gray-50 rounded-md text-sm"
                >
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-gray-500 text-xs">{task.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;