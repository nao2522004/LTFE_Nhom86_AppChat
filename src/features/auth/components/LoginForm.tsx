import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { login, clearError } from '../authSlice';
import styles from './LoginForm.module.css';

interface LoginFormProps {
    onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        user: '',
        pass: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

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
            <div className={styles.loginContainer}>
                {/* Left Panel */}
                <div className={styles.leftPanel}>
                    <div className={styles.logo}>
                        <img src="/images/auth/logo.png" alt="Logo" className={styles.logoImage} />
                        <div className={styles.logoText}>
                            <span>Nong Lam University</span>
                            <span>Faculty of Information Technology</span>
                            <span>DH22DTA</span>
                        </div>
                    </div>

                    <div className={styles.illustration}>
                        <img src="/images/auth/tree.png" alt="Christmas Tree" className={styles.treeImage} />
                    </div>

                    <div className={styles.leftFooter}>
                        <p>&copy; 2025 Nong Lam University</p>
                        <p>Powered by Nhom86</p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className={styles.rightPanel}>
                    <div className={styles.loginFormWrapper}>
                        <h2>Login</h2>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="user">Username</label>
                                <input
                                    type="text"
                                    id="user"
                                    name="user"
                                    value={formData.user}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="pass">Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="pass"
                                        name="pass"
                                        value={formData.pass}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`${showPassword ? "fas fa-eye-slash" : "fas fa-eye"} ${styles.showPasswordIcon}`}></i>
                                    </button>
                                </div>
                            </div>

                            <p className={styles.forgotPass}>Forgot Password?</p>

                            <button
                                type="submit"
                                className={styles.btnLogin}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <div className={styles.registerLink}>
                                Don't have an account?{' '}
                                <button type="button" className={styles.switchRegisterBtn} onClick={onSwitchToRegister}>
                                    Register Now
                                </button>
                            </div>
                        </form>

                        <div className={styles.rightFooter}>
                            <p>Terms and Services</p>
                            <div className={styles.contactInfo}>
                                Have a problem? Contact us at<br />
                                <a href="mailto:22130157@st.hcmuaf.edu.vn">22130157@st.hcmuaf.edu.vn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;