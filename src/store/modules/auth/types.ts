/**
 * Auth Store Types
 */

export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  loadingCount: number;
}

