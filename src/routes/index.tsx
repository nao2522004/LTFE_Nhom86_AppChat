import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import AuthPage from '../features/auth/pages/AuthPage';
import WebSocketTestPage from '../features/connection/pages/WebSocketTestPage';
import MainLayout from '../layouts/MainLayout';
import ChatPage from '../features/chat/pages/ChatPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/auth"
                    element={
                        <PublicRoute>
                            <AuthPage />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/websocket-test"
                    element={
                        <ProtectedRoute>
                            <WebSocketTestPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/chat" replace />} />

                    {/* Outlet of MainLayout */}
                    <Route path="chat" element={<ChatPage />} />
                </Route>

                {/* Default Route */}
                {/* <Route path="/" element={<Navigate to="/websocket-test" replace />} /> */}
                
                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;