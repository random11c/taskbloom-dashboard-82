import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Assignment, Coworker } from "@/types/assignment";
import { X } from "lucide-react";

// Mock coworkers data (in a real app, this would come from an API)
const mockCoworkers: Coworker[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com" },
];

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAssignment: (assignment: Assignment) => void;
}

const CreateAssignmentDialog = ({
  open,
  onOpenChange,
  onCreateAssignment,
}: CreateAssignmentDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<Coworker[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Assignment["priority"]>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      assignees: selectedAssignees,
      dueDate: new Date(dueDate),
      status: "pending",
      priority,
    };
    onCreateAssignment(newAssignment);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedAssignees([]);
    setDueDate("");
    setPriority("medium");
  };

  const handleAddAssignee = (assigneeId: string) => {
    const assignee = mockCoworkers.find((c) => c.id === assigneeId);
    if (assignee && !selectedAssignees.find(a => a.id === assignee.id)) {
      setSelectedAssignees([...selectedAssignees, assignee]);
    }
  };

  const handleRemoveAssignee = (assigneeId: string) => {
    setSelectedAssignees(selectedAssignees.filter(a => a.id !== assigneeId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assignment description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Assignees</Label>
            <Select onValueChange={handleAddAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Add assignee" />
              </SelectTrigger>
              <SelectContent>
                {mockCoworkers
                  .filter(c => !selectedAssignees.find(a => a.id === c.id))
                  .map((coworker) => (
                    <SelectItem key={coworker.id} value={coworker.id}>
                      {coworker.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAssignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full"
                >
                  <span className="text-sm">{assignee.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignee(assignee.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value: Assignment["priority"]) => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Assignment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;