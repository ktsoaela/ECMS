export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface AuthDetailsError {
  error: string;
  details: Record<string, string>;
}
