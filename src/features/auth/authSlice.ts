import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import socketService from '../../services/socket';
import { User } from '../../types/user';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    socketConnected: boolean;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    socketConnected: false
};

// Async thunks sử dụng Socket.IO
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            socketService.connect();
            
            const response = await socketService.login(credentials);
            
            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                socketService.disconnect();
                socketService.connect(response.token);
                
                return response;
            } else {
                throw new Error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Đăng nhập thất bại'
            );
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (
        userData: { username: string; email: string; password: string; displayName?: string },
        { rejectWithValue }
    ) => {
        try {
            socketService.connect();
            
            const response = await socketService.register(userData);
            
            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                socketService.disconnect();
                socketService.connect(response.token);
                
                return response;
            } else {
                throw new Error(response.message || 'Đăng ký thất bại');
            }
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Đăng ký thất bại'
            );
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await socketService.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            socketService.disconnect();
        } catch (error: any) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            socketService.disconnect();
            return rejectWithValue(
                error.message || 'Đăng xuất thất bại'
            );
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            
            socketService.connect(token);
            const response = await socketService.getCurrentUser();
            
            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Không thể lấy thông tin người dùng');
            }
        } catch (error: any) {
            return rejectWithValue(
                error.message || 'Không thể lấy thông tin người dùng'
            );
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
            state.socketConnected = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            socketService.disconnect();
        },
        setSocketConnected: (state, action: PayloadAction<boolean>) => {
            state.socketConnected = action.payload;
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
                state.socketConnected = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.socketConnected = false;
            });

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
                state.socketConnected = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.socketConnected = false;
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
                state.socketConnected = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.socketConnected = false;
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
                state.isAuthenticated = true;
                state.socketConnected = true;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.socketConnected = false;
            });
    }
});

export const { clearError, resetAuth, setSocketConnected, updateUserStatus } = authSlice.actions;
export default authSlice.reducer;