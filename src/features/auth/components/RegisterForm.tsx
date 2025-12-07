import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { register, clearError } from '../authSlice';
import styles from './AuthForm.module.css';

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/chat');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.username.length < 3) {
            errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear validation error for this field
        if (validationErrors[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const { confirmPassword, ...registerData } = formData;
        await dispatch(register(registerData));
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Đăng ký</h1>
                <p className={styles.subtitle}>Tạo tài khoản mới</p>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Tên người dùng *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Nhập tên người dùng"
                            required
                        />
                        {validationErrors.username && (
                            <span className={styles.fieldError}>{validationErrors.username}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="displayName" className={styles.label}>
                            Tên hiển thị
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Nhập tên hiển thị (tùy chọn)"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Nhập email của bạn"
                            required
                        />
                        {validationErrors.email && (
                            <span className={styles.fieldError}>{validationErrors.email}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Mật khẩu *
                        </label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Nhập mật khẩu"
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
                        {validationErrors.password && (
                            <span className={styles.fieldError}>{validationErrors.password}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Xác nhận mật khẩu *
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            required
                        />
                        {validationErrors.confirmPassword && (
                            <span className={styles.fieldError}>{validationErrors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Đã có tài khoản?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className={styles.linkButton}
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;