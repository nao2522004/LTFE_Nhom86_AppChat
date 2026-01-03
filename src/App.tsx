import React, {useEffect, useRef, useState} from 'react';
import AppRoutes from './routes';
import {useAppDispatch} from './hooks/hooks';
import {reLogin} from './features/auth/authSlice';
import {useWebSocketSetup} from './hooks/useWebSocketSetup';
import useConnectionDebug from "./hooks/useConnectionDebug";
import {setConnecting} from "./features/socket/socketSlice";

function App() {
    const dispatch = useAppDispatch();

    // Setup WebSocket event listeners
    useWebSocketSetup();

    // useConnectionDebug();

    // check auth
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const isAuthChecked = useRef(false);

    useEffect(() => {
        if (isAuthChecked.current) return;

        isAuthChecked.current = true;

        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const user = localStorage.getItem("user");

            console.log('%c[App] Checking auth...',
                'background: #3498db; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold',
                { token: token ? '✓ exists' : '✗ missing', user: user ? '✓ exists' : '✗ missing' }
            );

            if (token && user) {
                try {
                    console.log('%c[App] Token found, attempting reLogin...',
                        'background: #f39c12; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold',
                        { user, token: token.substring(0, 20) + '...' }
                    );

                    dispatch(setConnecting());

                    const result = await dispatch(reLogin({user: user, code: token}));

                    console.log('%c[App] reLogin result:',
                        'background: #2ecc71; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold',
                        result
                    );

                    // Check if reLogin failed
                    if (reLogin.rejected.match(result)) {
                        console.error('%c[App] reLogin rejected, clearing storage',
                            'background: #e74c3c; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold'
                        );
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }

                } catch (error: any) {
                    console.error('%c[App] reLogin error:',
                        'background: #e74c3c; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold',
                        error
                    );
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                console.log('%c[App] No token found, skipping reLogin',
                    'background: #95a5a6; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold'
                );
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
                background: 'linear-gradient(135deg, #1a362d 0%, #254e42 100%)',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '50px 40px',
                    borderRadius: '32px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                    width: '320px'
                }}>
                    {/* Icon Chat Animation */}
                    <div className="icon-wrapper">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.8909 4 16.1247L3 21L7.87533 20C9.10911 20.6391 10.5124 21 12 21Z"
                                  stroke="#82e0aa"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="chat-path"
                            />
                        </svg>
                    </div>

                    <h1 style={{
                        color: '#ffffff',
                        fontSize: '32px',
                        fontWeight: '700',
                        margin: '15px 0 5px 0',
                        letterSpacing: '-0.5px'
                    }}>
                        App Chat
                    </h1>

                    <div style={{ marginBottom: '25px' }}>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '15px',
                            fontWeight: '300',
                            margin: 0,
                            letterSpacing: '0.5px'
                        }}>
                            Connecting, please wait...
                        </p>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '3px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div className="progress-fill"></div>
                    </div>
                </div>

                <style>{`
                @keyframes draw {
                    0% { stroke-dashoffset: 80; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -80; }
                }

                .chat-path {
                    stroke-dasharray: 80;
                    animation: draw 2.5s ease-in-out infinite;
                }

                .icon-wrapper {
                    filter: drop-shadow(0 0 12px rgba(130, 224, 170, 0.3));
                }

                .progress-fill {
                    position: absolute;
                    width: 40%;
                    height: 100%;
                    background: #82e0aa;
                    box-shadow: 0 0 10px rgba(130, 224, 170, 0.6);
                    animation: loading-slide 1.8s infinite ease-in-out;
                }

                @keyframes loading-slide {
                    0% { left: -40%; }
                    100% { left: 100%; }
                }
            `}</style>
            </div>
        );
    }

    return <AppRoutes/>;
}

export default App;