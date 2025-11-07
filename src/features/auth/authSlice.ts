import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginRequest, refreshTokenRequest, signUpRequest } from './authApi';
import { AuthResponse, Credentials, SignUpRequest, User } from './authTypes';

export const loginUser = createAsyncThunk<AuthResponse, Credentials>('auth/login', async (credentials, thunkAPI) => {
  try {
    return await loginRequest(credentials)
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const signUpUser = createAsyncThunk<AuthResponse, SignUpRequest>('auth/signup', async (request, thunkAPI) => {
  try {
    return await signUpRequest(request)
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Sign up failed');
  }
})

export const refreshToken = createAsyncThunk<AuthResponse, string>('auth/refresh', async (refreshToken, thunkAPI) => {
try {
  return await refreshTokenRequest(refreshToken)
} catch (error: any) {
  return thunkAPI.rejectWithValue(error.response?.data || 'Token refresh failed');
}})


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
    refreshToken: null as string | null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    rehydrateAuth: (state) => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (token) state.token = token;
      if (refreshToken) state.refreshToken = refreshToken;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.authenticationToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.authenticationToken;
        state.user = action.payload.user;
        localStorage.setItem('refreshToken', action.payload.refreshToken); 
        localStorage.setItem('token', action.payload.authenticationToken);
      })

      .addCase(refreshToken.fulfilled, (state, action) => {
      state.token = action.payload.authenticationToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('token', action.payload.authenticationToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      });
  },
});
export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;