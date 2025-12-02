export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    displayName?: string;
    bio?: string;
    createdAt: string;
    updatedAt: string;
    isOnline?: boolean;
}

export interface UserSettings {
    notifications: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark';
    language: string;
}

export interface UpdateUserRequest {
    displayName?: string;
    bio?: string;
    avatar?: string;
}