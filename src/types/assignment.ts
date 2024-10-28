export type AssignmentStatus = "pending" | "in-progress" | "completed";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  assignee: Coworker;
  dueDate: Date;
  status: AssignmentStatus;
  priority: "low" | "medium" | "high";
}

export interface Coworker {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}