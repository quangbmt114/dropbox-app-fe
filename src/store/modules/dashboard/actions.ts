import { authActions } from "@/store/modules/auth";
import { filesActions } from "@/store/modules/dashboard/files";
import type { AppDispatch } from "@/store";

const init = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const [userResult, filesResult] = await Promise.allSettled([
        dispatch(authActions.fetchCurrentUser()),
        dispatch(filesActions.fetchFiles()),
      ]);

      const userSuccess = userResult.status === "fulfilled";
      const filesSuccess = filesResult.status === "fulfilled";

      if (!userSuccess || !filesSuccess) {
        return {
          success: false,
          error: "Failed to initialize dashboard",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize dashboard",
      };
    }
  };
};

/**
 * Cleanup Dashboard
 * Clear files state khi unmount
 */
const destroy = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(filesActions.destroy());
  };
};

export const dashboardActions = {
  initDashboard: init,
  destroyDashboard: destroy,
};
