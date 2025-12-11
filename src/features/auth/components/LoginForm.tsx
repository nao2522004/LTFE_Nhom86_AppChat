import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { login, clearError } from '../authSlice';
import styles from './AuthForm.module.css';

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState({
        user: '',
        pass: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.user || !formData.pass) {
            return;
        }

        await dispatch(login(formData));
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Đăng nhập</h1>
                <p className={styles.subtitle}>Chào mừng bạn trở lại!</p>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="user" className={styles.label}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="user"
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Nhập username của bạn (vd: long)"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="pass" className={styles.label}>
                            Mật khẩu
                        </label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="pass"
                                name="pass"
                                value={formData.pass}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Nhập mật khẩu (vd: 12345)"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '20px' }}>
                        💡 Hint: Username: <strong>long</strong>, Password: <strong>12345</strong>
                    </p>
                    <p>
                        Chưa có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className={styles.linkButton}
                        >
                            Đăng ký ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;