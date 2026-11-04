
export type UserRole = "user" | "manager" | "admin";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}
