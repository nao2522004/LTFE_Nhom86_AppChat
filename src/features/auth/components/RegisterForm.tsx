import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { register, clearError } from '../authSlice';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
    onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        user: '',
        pass: '',
        confirmPass: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
     
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Redirect to login after successful registration
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                if (onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    navigate('/auth?mode=login');
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage, navigate, onSwitchToLogin]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setValidationError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.email || !formData.user || !formData.pass || !formData.confirmPass) {
            setValidationError('Please fill in all fields');
            return;
        }

        if (formData.pass !== formData.confirmPass) {
            setValidationError('Passwords do not match');
            return;
        }

        if (!agreedToTerms) {
            setValidationError('Please agree to the Terms & Privacy');
            return;
        }

        // Register
        const result = await dispatch(register({
            user: formData.user,
            pass: formData.pass
        }));

        // check if registration was successful
        if (register.fulfilled.match(result)) {
            setShowSuccessMessage(true);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.registerContainer}>
                {/* Left Section */}
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <img src="/images/auth/logo.png" alt="Logo" className={styles.logoImage} />
                        <div className={styles.logoText}>
                            <span>Nong Lam University</span>
                            <span>Faculty of Information Technology</span>
                            <span>DH22DTA</span>
                        </div>
                    </div>

                    <div className={styles.illustration}>
                        <img src="/images/auth/register_icon.png" alt="Register Illustration" className={styles.illustrationImage} />
                    </div>

                    <div className={styles.leftFooter}>
                        <p>&copy; 2025 Nong Lam University</p>
                        <p>Powered by Nhom86</p>
                    </div>
                </div>

                {/* Right Section */}
                <div className={styles.rightSection}>
                    <div className={styles.formContainer}>
                        <h2>Create Account</h2>

                        {/* Success Message */}
                        {showSuccessMessage && (
                            <div className={styles.successMessage}>
                                Registration successful! Redirecting to login...
                            </div>
                        )}

                        {/* Error Message */}
                        {(error || validationError) && (
                            <div className={styles.errorMessage}>
                                {validationError || error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="user">Username</label>
                                <input
                                    type="text"
                                    id="user"
                                    name="user"
                                    value={formData.user}
                                    onChange={handleChange}
                                    placeholder="Create a username"
                                    required
                                />
                            </div>

                            <div className={styles.rowGroup}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="pass">Password</label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="pass"
                                            name="pass"
                                            value={formData.pass}
                                            onChange={handleChange}
                                            placeholder="Password"
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

                                <div className={styles.inputGroup}>
                                    <label htmlFor="confirmPass">Confirm</label>
                                    <div className={styles.passwordInputWrapper}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPass"
                                            name="confirmPass"
                                            value={formData.confirmPass}
                                            onChange={handleChange}
                                            placeholder="Confirm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.togglePassword}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <i className={`${showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} ${styles.showPasswordIcon}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                />
                                <label htmlFor="terms">
                                    I agree to the <p>Terms & Privacy</p>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={styles.btnRegister}
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <div className={styles.loginLink}>
                                <p>
                                    Already have an account?{' '}
                                    <button type="button" className={styles.switchLoginBtn} onClick={onSwitchToLogin}>
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        </form>

                        <div className={styles.rightFooter}>
                            <p>
                                Have a problem? Contact us at{' '}
                                <a href="mailto:22130157@st.hcmuaf.edu.vn">22130157@st.hcmuaf.edu.vn</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;