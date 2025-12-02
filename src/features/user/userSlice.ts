import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserSettings } from '../../types/user';

interface UserState {
    currentUser: User | null;
    settings: UserSettings;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    currentUser: null,
    settings: {
        notifications: true,
        soundEnabled: true,
        theme: 'light',
        language: 'vi'
    },
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload;
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.currentUser) {
                state.currentUser = { ...state.currentUser, ...action.payload };
            }
        },
        updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        clearUser: (state) => {
            state.currentUser = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { setUser, updateUser, updateSettings, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;