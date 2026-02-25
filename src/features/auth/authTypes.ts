export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  qrCodeToken: string;
  notificationToken?: string[] | null;
}

export interface AuthResponse {
  authenticationToken: string;
  refreshToken: string;
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  refreshToken: string | null;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RefreshResponse {
  authenticationToken: string;
  refreshToken: string;
}
