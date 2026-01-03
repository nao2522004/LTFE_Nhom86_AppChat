import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../shared/types/user';
import websocketService, {ReLoginData} from "../../services/websocket/MainService";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Login thunk
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { user: string; pass: string }, { rejectWithValue }) => {
        try {
            // Connect WebSocket first
            websocketService.connect();
            
            // Wait a bit for socket to establish
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Send login request
            const response = await websocketService.login(credentials);
            
            // Save to localStorage
            if (response.RE_LOGIN_CODE) {
                localStorage.setItem("user", credentials.user);
                localStorage.setItem("token", response.RE_LOGIN_CODE);
            }
            // if (response.user) {
            //     localStorage.setItem('user', JSON.stringify(response.user));
            // }
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Đăng nhập thất bại');
        }
    }
);

// ReLogin thunk
export const reLogin = createAsyncThunk(
    "auth/reLogin",
    async (credentials: ReLoginData, { rejectWithValue }) => {
        try {
            websocketService.connect();

            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await websocketService.reLogin(credentials);

            if (!response.RE_LOGIN_CODE) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                websocketService.disconnect();
                return rejectWithValue("Token timeout or invalid");
            } 

            localStorage.setItem("token", response.RE_LOGIN_CODE);

            return response;
        } catch(error: any) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            websocketService.disconnect();
            return rejectWithValue(error.message || "ReLogin failed");
        }
    }
);

// Register thunk
export const register = createAsyncThunk(
    'auth/register',
    async (
        userData: { user: string; pass: string; name?: string },
        { rejectWithValue }
    ) => {
        try {
            // Connect WebSocket first
            websocketService.connect();
            
            // Wait a bit for socket to establish
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Send register request
            const response = await websocketService.register(userData);
            
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Đăng ký thất bại');
        }
    }
);

// Logout thunk
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await websocketService.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            websocketService.disconnect();
        } catch (error: any) {
            // Still clear local data even if logout fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            websocketService.disconnect();
            return rejectWithValue(error.message || 'Đăng xuất thất bại');
        }
    }
);

// Get current user thunk
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (!token || !userStr) {
                throw new Error('No token or user found');
            }
            
            const user = JSON.parse(userStr);
            
            // Connect WebSocket
            websocketService.connect();
            
            return { user, token };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Không thể lấy thông tin người dùng');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            websocketService.disconnect();
        },
        updateUserStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
            if (state.user && state.user.id === action.payload.userId) {
                state.user.isOnline = action.payload.isOnline;
            }
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ReLogin
        builder
            .addCase(reLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.RE_LOGIN_CODE;
                state.error = null;
            })
            .addCase(reLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });

        // Get current user
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });
    }
});

export const { clearError, resetAuth, updateUserStatus } = authSlice.actions;
export default authSlice.reducer;