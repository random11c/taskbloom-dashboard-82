export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "editor" | "viewer";
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "editor" | "viewer";
  isOwner: boolean;
}