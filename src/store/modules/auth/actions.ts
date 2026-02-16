/**
 * Auth Store Actions
 * Now using Redux persist to handle tokens instead of localStorage
 */

import { actions as A } from '.';
import { authApi, RegisterRequest } from '@/api-service';
import type { AppDispatch } from '@/store';

const login = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.accessToken && response.data.user) {
        // Store token and user in Redux (will be persisted automatically)
        dispatch(A.setAuth({
          user: response.data.user,
          token: response.data.accessToken,
        }));

        return { success: true };
      }

      return { success: false, error: 'No token or user received' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const register = (data: RegisterRequest) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.register(data);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.accessToken && response.data.user) {
        // Store token and user in Redux (will be persisted automatically)
        dispatch(A.setAuth({
          user: response.data.user,
          token: response.data.accessToken,
        }));

        return { success: true };
      }

      return { success: false, error: 'No token or user received' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const logout = () => {
  return async (dispatch: AppDispatch) => {
    // Clear auth state (redux-persist will handle clearing persisted data)
    dispatch(A.clearAuth());
  };
};

const fetchCurrentUser = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.getCurrentUser();

      if (response.error) {
        if (response.status === 401) {
          // Unauthorized - clear auth
          dispatch(A.clearAuth());
        }
        return;
      }

      if (response.data) {
        dispatch(A.setUser(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      dispatch(A.popLoading());
    }
  };
};

export const extendActions = {
  login,
  register,
  logout,
  fetchCurrentUser,
};
