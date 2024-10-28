export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}