export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "editor" | "viewer";
  createdAt: Date;
}

export interface TeamMember extends User {
  projectIds: string[];
}