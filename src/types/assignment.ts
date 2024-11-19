export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';
export type AssignmentPriority = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  assignees: Coworker[];
}

export interface Coworker {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}