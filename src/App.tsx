import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { getCurrentUser } from './features/auth/authSlice';

function App() {
    const dispatch = useAppDispatch();
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // if having token, get current user
        if (token && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);

    return <AppRoutes />;
}

export default App;