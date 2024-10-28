export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "member";
  createdAt: Date;
}

export interface TeamMember extends User {
  projectIds: string[];
}