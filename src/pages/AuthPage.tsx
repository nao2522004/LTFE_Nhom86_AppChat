import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const mode = searchParams.get('mode') || 'login';
    const isLoginMode = mode === 'login';

    const switchToRegister = () => {
        navigate('/auth?mode=register');
    };

    const switchToLogin = () => {
        navigate('/auth?mode=login');
    };

    return (
        <>
            {isLoginMode ? (
                <LoginForm onSwitchToRegister={switchToRegister} />
            ) : (
                <RegisterForm onSwitchToLogin={switchToLogin} />
            )}
        </>
    );
}

export default AuthPage;