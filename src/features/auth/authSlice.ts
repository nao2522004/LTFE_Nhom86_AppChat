import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../shared/types/user';
import websocketService, {ReLoginData} from "../../services/websocket/MainService";
import { decryptToken } from '../../shared/utils/encryption';

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
            websocketService.connect();
            await websocketService.waitForConnection(300000);
            
            const response = await websocketService.login(credentials);

            return {
                ...response,
                username: credentials.user
            };
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
            await websocketService.waitForConnection(300000);

            const response = await websocketService.reLogin(credentials);

            if (!response.data.RE_LOGIN_CODE) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                websocketService.disconnect();
                return rejectWithValue("Token timeout or invalid");
            }

            // decrypt user
            let decryptedUser = credentials.user
            try {
                decryptedUser = await decryptToken(credentials.user);
                console.log("Token decrypted for relogin");
            } catch (error) {
                console.warn("Token decryption failed, using original token");
            }

            return {
                ...response,
                username: decryptedUser
            };
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
            websocketService.connect();
            await websocketService.waitForConnection(300000);
            
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
            websocketService.disconnect();
        } catch (error: any) {
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
                state.user = {
                    id: action.payload.username,
                    username: action.payload.username,
                    email: '',
                    displayName: action.payload.username,
                    avatar: `https://i.pravatar.cc/150?u=${action.payload.username}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isOnline: true
                };
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
                state.user = {
                    id: action.payload.username,
                    username: action.payload.username,
                    email: '',
                    displayName: action.payload.username,
                    avatar: `https://i.pravatar.cc/150?u=${action.payload.username}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isOnline: true
                };
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