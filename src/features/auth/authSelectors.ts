import { RootState } from "@/src/store";

export const selectIsAuthenticated = (state: RootState): boolean => !!state.auth.token && !!state.auth.user;
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;