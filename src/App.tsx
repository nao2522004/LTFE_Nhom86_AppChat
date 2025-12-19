import React, { useEffect, useRef, useState } from 'react';
import AppRoutes from './routes';
import { useAppDispatch } from './hooks/hooks';
import { reLogin } from './features/auth/authSlice';
import { useWebSocketSetup } from './hooks/useWebSocketSetup';

function App() {
    const dispatch = useAppDispatch();

    // Setup WebSocket event listeners
    useWebSocketSetup();

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
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#254e42'
            }}>
                🔄 Đang kết nối lại...
            </div>
        );
    }

    return <AppRoutes />;
}

export default App;