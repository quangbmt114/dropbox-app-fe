/**
 * Auth Store Actions
 * Now using Redux persist to handle tokens instead of localStorage
 */

import { actions as A } from '.';
import { api, type RegisterRequest } from '@/api-service';
import type { AppDispatch } from '@/store';

/**
 * Initialize Auth
 * Check và fetch current user nếu có token
 */
const initAuth = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const result = await dispatch(fetchCurrentUser());
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
      };
    }
  };
};

const login = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await api.auth.login(email, password);

      // Generated API returns Axios response directly
      const data = response.data as any;
      const token = data?.data?.accessToken || data?.accessToken;
      const user = data?.data?.user || data?.user;

      if (token && user) {
        dispatch(
          A.setAuth({
            user,
            token,
          })
        );

        return { success: true };
      }

      return { success: false, error: 'No token or user received' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Login failed',
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

      const response = await api.auth.register(data.email, data.password, data.name);

      // Generated API returns Axios response directly
      const responseData = response.data as any;
      const token = responseData?.data?.accessToken || responseData?.accessToken;
      const user = responseData?.data?.user || responseData?.user;

      if (token && user) {
        // Store token and user in Redux (will be persisted automatically)
        dispatch(
          A.setAuth({
            user,
            token,
          })
        );

        return { success: true };
      }

      return { success: false, error: 'No token or user received' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Registration failed',
      };
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const logout = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(A.clearAuth());
  };
};

const fetchCurrentUser = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await api.users.getCurrentUser();

      // Generated API returns Axios response
      const data = response.data as any;
      const user = data?.data || data;

      if (user) {
        dispatch(A.setUser(user));
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      dispatch(A.popLoading());
    }
  };
};

export const extendActions = {
  initAuth,
  login,
  register,
  logout,
  fetchCurrentUser,
};
