/**
 * Auth Store Types
 */

export interface AuthState {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loadingCount: number;
}

