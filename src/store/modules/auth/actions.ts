/**
 * Auth Store Actions
 * Now using Redux persist to handle tokens instead of localStorage
 */

import { actions as A } from ".";
import { authApi, RegisterRequest } from "@/api-service";
import type { AppDispatch } from "@/store";

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
        error:
          error instanceof Error ? error.message : "Failed to initialize auth",
      };
    }
  };
};

const login = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await authApi.login({ email, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data?.accessToken && response.data.user) {
        dispatch(
          A.setAuth({
            user: response.data.user,
            token: response.data.accessToken,
          }),
        );

        return { success: true };
      }

      return { success: false, error: "No token or user received" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
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
        dispatch(
          A.setAuth({
            user: response.data.user,
            token: response.data.accessToken,
          }),
        );

        return { success: true };
      }

      return { success: false, error: "No token or user received" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
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

      const response = await authApi.getCurrentUser();

      if (response.data) {
        dispatch(A.setUser(response.data));
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
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
