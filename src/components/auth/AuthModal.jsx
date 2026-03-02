import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
import { loginUser, signupUser, verifySignupOtp, forgotPassword, verifyForgotOtp, resetPassword, resendOtp } from "../../services/authService";

const AuthModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [view, setView] = useState('login'); // login, signup_step1, signup_step2, signup_step3, signup_step4, forgot_email, forgot_otp, forgot_reset

    // Login & Common State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'
    const [loading, setLoading] = useState(false);

    // Signup Specific State
    const [fullName, setFullName] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [phone, setPhone] = useState('');

    const [emergency1, setEmergency1] = useState({ name: '', phone: '' });
    const [emergency2, setEmergency2] = useState({ name: '', phone: '' });

    const [fieldErrors, setFieldErrors] = useState({}); // { email: 'Error message', ... }

    // Auto-dismiss message banner after 4 seconds
    useEffect(() => {
        if (!message.text) return;
        const timer = setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 4000);
        return () => clearTimeout(timer);
    }, [message.text]);

    if (!isOpen) return null;

    const resetState = () => {
        setView('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setFullName('');
        setCollegeName('');
        setPhone('');
        setEmergency1({ name: '', phone: '' });
        setEmergency2({ name: '', phone: '' });
        setMessage({ type: '', text: '' });
        setFieldErrors({});
        onClose();
    };

    const handleBackToLogin = () => {
        setView('login');
        setMessage({ type: '', text: '' });
    };

    // --- Validation Helpers ---
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    };

    const validateName = (name) => {
        return /^[a-zA-Z\s]{2,50}$/.test(name);
    };

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "fullName":
            case "emergency1_name":
            case "emergency2_name":
                if (!validateName(value)) error = "Use only letters (2-50 chars)";
                break;
            case "email":
                if (!validateEmail(value)) error = "Invalid email format";
                break;
            case "phone":
            case "emergency1_phone":
            case "emergency2_phone":
                if (!validatePhone(value)) error = "Must be 10 digits (starting 6-9)";
                break;
            case "password":
                const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{8,10}$/;
                if (!passwordRegex.test(value)) {
                    error = "8-10 chars, 1 uppercase, 1 special, 1 number";
                }
                break;
            case "confirmPassword":
                if (value !== password) error = "Passwords do not match";
                break;
            default:
                break;
        }
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return error === "";
    };

    // --- Login Handler ---
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        console.log("Login sequence started...");

        if (loading) {
            console.warn("Login already in progress, skipping.");
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            console.log("Validating credentials:", { email, passwordLength: password?.length });

            if (!email || !password) {
                setMessage({ type: 'error', text: "Please enter both email and password" });
                setLoading(false);
                return;
            }

            if (!validateEmail(email)) {
                setMessage({ type: 'error', text: "Please enter a valid college email format" });
                setLoading(false);
                return;
            }

            console.log("Calling loginUser service...");
            const response = await loginUser(email, password);
            console.log("Service response:", response);

            if (!response || !response.data) {
                throw new Error("No response from authentication service");
            }

            const { access_token, first_login } = response.data;

            if (access_token) {
                console.log("Login success! token found. Updating context...");

                // Show success message immediately before context update to avoid perceived lag
                setMessage({ type: "success", text: "Login successful! Redirecting..." });

                try {
                    await login(response.data);
                    console.log("Context updated successfully");
                } catch (loginError) {
                    console.error("Error during context login:", loginError);
                    // Continue anyway if it's just a profile fetch error in mock mode
                }

                setTimeout(() => {
                    console.log("Redirecting to /home...");
                    navigate("/home");
                    // Delay resetState slightly to ensure navigation starts
                    setTimeout(() => resetState(), 100);
                }, 500); // Reduced delay for faster feedback
            } else if (first_login) {
                console.log("Verification required (first_login). Moving to OTP view.");
                setOtpToken(response.data.otp_token);
                setMessage({ type: "success", text: "Email not verified. OTP sent." });
                setView('signup_step4');
            } else {
                console.error("Unknown response structure:", response.data);
                setMessage({ type: "error", text: "Server returned an unexpected response" });
            }

        } catch (error) {
            console.error("Login catch block triggered:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || error.message || "Login failed"
            });
        } finally {
            setLoading(false);
            console.log("Login sequence finished (loading=false).");
        }
    };

    // --- Sign Up Flow Handlers ---
    const handleSignUpStep1 = (e) => {
        e.preventDefault();

        const isNameValid = validateField("fullName", fullName);
        const isEmailValid = validateField("email", email);
        const isPhoneValid = validateField("phone", phone);

        if (!collegeName) {
            setFieldErrors(prev => ({ ...prev, collegeName: "Please select your college" }));
        } else {
            setFieldErrors(prev => ({ ...prev, collegeName: "" }));
        }

        if (isNameValid && isEmailValid && isPhoneValid && collegeName) {
            setView('signup_step2');
            setMessage({ type: '', text: '' });
        }
    };

    const handleSignUpStep2 = (e) => {
        e.preventDefault();

        const v1_name = validateField("emergency1_name", emergency1.name);
        const v1_phone = validateField("emergency1_phone", emergency1.phone);
        const v2_name = validateField("emergency2_name", emergency2.name);
        const v2_phone = validateField("emergency2_phone", emergency2.phone);

        // Duplicate/Self Checks
        let contactMatchError = "";
        if (emergency1.phone === emergency2.phone) {
            contactMatchError = "Contacts must be different";
        } else if (emergency1.phone === phone || emergency2.phone === phone) {
            contactMatchError = "Cannot use own number";
        }

        setFieldErrors(prev => ({ ...prev, contactMatch: contactMatchError }));

        if (v1_name && v1_phone && v2_name && v2_phone && !contactMatchError) {
            setView('signup_step3');
            setMessage({ type: '', text: '' });
        }
    };

    const handleSignUpStep3 = async (e) => {
        e.preventDefault();

        const isPassValid = validateField("password", password);
        const isConfirmValid = validateField("confirmPassword", confirmPassword);

        if (!isPassValid || !isConfirmValid) return;

        setLoading(true);
        try {
            const payload = {
                name: fullName,
                email_id: email,
                phone_no: phone,
                password: password,
                confirm_password: confirmPassword,
                college_id: parseInt(collegeName),
                emergency_contacts: [
                    {
                        emergency_name: emergency1.name,
                        phone_no: emergency1.phone
                    },
                    {
                        emergency_name: emergency2.name,
                        phone_no: emergency2.phone
                    }
                ]
            };

            const response = await signupUser(payload);
            setOtpToken(response.data.otp_token);

            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setView('signup_step4');
            }, 2000);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Signup failed"
            });
        } finally {
            setLoading(false);
        }
    };



    const handleSignUpStep4 = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await verifySignupOtp(email, otp, otpToken);

            setMessage({ type: 'success', text: "Account created successfully! Please log in with your credentials." });

            setTimeout(() => {
                setPassword(''); // Clear password to require manual entry
                setConfirmPassword('');
                setOtp('');
                setLoading(false);
                setView('login');
            }, 2000);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Verification failed"
            });
            setLoading(false);
        }
    };

    // --- Forgot Password Handlers ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        console.log("Sending OTP to:", email);

        if (!validateEmail(email)) {
            setMessage({ type: 'error', text: "Please enter a valid email address" });
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            setOtpToken(response.data.otp_token);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setLoading(false);
                setView('forgot_otp');
            }, 2000);
        } catch (error) {
            console.error("Forgot password request failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Request failed. Check your connection."
            });
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        console.log("Verifying Forgot OTP...");
        setLoading(true);
        try {
            await verifyForgotOtp(email, otp, otpToken);
            setMessage({ type: 'success', text: 'OTP Verified! Please set your new password.' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setLoading(false);
                setView('forgot_reset');
            }, 1000);
        } catch (error) {
            console.error("Forgot OTP verification failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Invalid OTP. Please check again."
            });
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        console.log("Reset password triggered");

        const isPassValid = validateField("password", password);
        const isConfirmValid = validateField("confirmPassword", confirmPassword);

        if (!isPassValid || !isConfirmValid) return;

        setLoading(true);
        try {
            await resetPassword({
                email,
                otp,
                otp_token: otpToken,
                new_password: password
            });
            setMessage({ type: 'success', text: "Password reset successfully! Redirecting to login..." });
            setTimeout(() => {
                setLoading(false);
                handleBackToLogin();
            }, 1500);
        } catch (error) {
            console.error("Reset password failed:", error);
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Reset failed. Please try again."
            });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" aria-hidden="true" onClick={resetState}></div>
                <div className="relative inline-block w-full max-w-lg bg-white rounded-3xl sm:rounded-[48px] text-left overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform transition-all sm:my-8 border border-white">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    {/* Close Button — sits on the modal corner */}
                    <div className="absolute -top-2 -right-2 sm:top-2 sm:right-2 z-30">
                        <button type="button" className="bg-white shadow-lg rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none transition-all border border-gray-100" onClick={resetState}>
                            <span className="sr-only">Close</span>
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-5 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8">
                        <div className="w-full">
                            <div className="w-full">
                                {message.text && (
                                    <div className={`mb-4 p-3 rounded-2xl text-sm font-semibold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                        <span>{message.text}</span>
                                        <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="shrink-0 p-0.5 rounded-full hover:bg-black/5 transition-colors">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {view === 'login' && (
                                    <Login
                                        email={email}
                                        setEmail={setEmail}
                                        password={password}
                                        setPassword={setPassword}
                                        handleLogin={handleLogin}
                                        setView={setView}
                                        setMessage={setMessage}
                                        loading={loading}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                    />
                                )}

                                {view.startsWith('signup') && (
                                    <Signup
                                        view={view}
                                        setView={setView}
                                        fullName={fullName}
                                        setFullName={setFullName}
                                        collegeName={collegeName}
                                        setCollegeName={setCollegeName}
                                        email={email}
                                        setEmail={setEmail}
                                        phone={phone}
                                        setPhone={setPhone}
                                        emergency1={emergency1}
                                        setEmergency1={setEmergency1}
                                        emergency2={emergency2}
                                        setEmergency2={setEmergency2}
                                        password={password}
                                        setPassword={setPassword}
                                        confirmPassword={confirmPassword}
                                        setConfirmPassword={setConfirmPassword}
                                        otp={otp}
                                        setOtp={setOtp}
                                        handleSignUpStep1={handleSignUpStep1}
                                        handleSignUpStep2={handleSignUpStep2}
                                        handleSignUpStep3={handleSignUpStep3}
                                        handleSignUpStep4={handleSignUpStep4}
                                        handleBackToLogin={handleBackToLogin}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                        onResendOtp={async () => {
                                            try {
                                                const res = await resendOtp(email, 'signup');
                                                setMessage({ type: 'success', text: res.data.message || 'OTP resent successfully!' });
                                            } catch (err) {
                                                setMessage({ type: 'error', text: err?.response?.data?.detail || 'Failed to resend OTP' });
                                                throw err;
                                            }
                                        }}
                                    />
                                )}

                                {view.startsWith('forgot') && (
                                    <ForgotPassword
                                        view={view}
                                        setView={setView}
                                        email={email}
                                        setEmail={setEmail}
                                        password={password}
                                        setPassword={setPassword}
                                        confirmPassword={confirmPassword}
                                        setConfirmPassword={setConfirmPassword}
                                        otp={otp}
                                        setOtp={setOtp}
                                        handleSendOtp={handleSendOtp}
                                        handleVerifyOtp={handleVerifyOtp}
                                        handleResetPassword={handleResetPassword}
                                        handleBackToLogin={handleBackToLogin}
                                        setMessage={setMessage}
                                        fieldErrors={fieldErrors}
                                        validateField={validateField}
                                        loading={loading}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
