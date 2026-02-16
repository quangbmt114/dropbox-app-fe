/**
 * Auth Store Actions
 */

import { actions as A } from '.';
import { authApi } from '@/api-service';
import { saveToken, removeToken } from '@/utils/auth';
import type { AppDispatch } from '@/store';

const login = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.accessToken) {
        saveToken(response.data.accessToken);

        if (response.data.user) {
          dispatch(A.setUser(response.data.user));
        }

        return { success: true };
      }

      return { success: false, error: 'No token received' };
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

const register = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.register({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.accessToken) {
        saveToken(response.data.accessToken);

        if (response.data.user) {
          dispatch(A.setUser(response.data.user));
        }

        return { success: true };
      }

      return { success: false, error: 'No token received' };
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
    removeToken();
    dispatch(A.clearUser());
  };
};

const fetchCurrentUser = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.getCurrentUser();

      if (response.error) {
        if (response.status === 401) {
          // Unauthorized - clear user
          dispatch(A.clearUser());
          removeToken();
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

