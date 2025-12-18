import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import websocketService, { ReLoginData } from '../../services/websocket';
import { User } from '../../types/user';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    wsConnected: boolean;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    wsConnected: false
};

// Login thunk
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { user: string; pass: string }, { rejectWithValue }) => {
        try {
            // Connect WebSocket first
            websocketService.connect();
            
            // Wait a bit for connection to establish
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
                return rejectWithValue("Token timeout or invalid");
            } 

            localStorage.setItem("token", response.RE_LOGIN_CODE);

            return response;
        } catch(error: any) {
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
            
            // Wait a bit for connection to establish
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Send register request
            const response = await websocketService.register(userData);
            
            // Save to localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            
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
            state.wsConnected = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            websocketService.disconnect();
        },
        setWsConnected: (state, action: PayloadAction<boolean>) => {
            state.wsConnected = action.payload;
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
                state.wsConnected = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.wsConnected = false;
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
                state.wsConnected = true;
            })
            .addCase(reLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.wsConnected = false;
            })

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.wsConnected = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.wsConnected = false;
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
                state.wsConnected = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.wsConnected = false;
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
                state.wsConnected = true;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.wsConnected = false;
            });
    }
});

export const { clearError, resetAuth, setWsConnected, updateUserStatus } = authSlice.actions;
export default authSlice.reducer;