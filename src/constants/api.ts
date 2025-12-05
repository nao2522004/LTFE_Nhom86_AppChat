export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me'
    },
    USERS: {
        BASE: '/users',
        PROFILE: (id: string) => `/users/${id}`,
        UPDATE: (id: string) => `/users/${id}`,
        SEARCH: '/users/search'
    },
    CONVERSATIONS: {
        BASE: '/conversations',
        DETAIL: (id: string) => `/conversations/${id}`,
        MESSAGES: (id: string) => `/conversations/${id}/messages`
    },
    MESSAGES: {
        BASE: '/messages',
        SEND: '/messages',
        DELETE: (id: string) => `/messages/${id}`
    }
};