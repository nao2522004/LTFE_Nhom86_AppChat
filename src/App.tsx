import React, { useEffect, useRef, useState } from 'react';
import AppRoutes from './routes';
import { useAppDispatch } from './hooks/hooks';
import { reLogin } from './features/auth/authSlice';

function App() {
    const dispatch = useAppDispatch();

    // check auth
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const isAuthChecked = useRef(false);

    useEffect(() => {
        if (isAuthChecked.current) return;

        isAuthChecked.current = true;

        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const user = localStorage.getItem("user");
    
            if (token && user) {
                try {
                    await dispatch(reLogin({ user: user, code: token }));
                } catch(error: any) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }

            setIsCheckingAuth(false);
        }

        checkAuth();
    }, [dispatch]);

    if (isCheckingAuth) {
        return <div className="loading-screen">Đang kết nối lại...</div>;
    }

    return <AppRoutes />;
}

export default App;