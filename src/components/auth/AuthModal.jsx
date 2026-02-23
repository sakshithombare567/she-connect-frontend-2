import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
import { loginUser, signupUser, verifySignupOtp, forgotPassword, verifyForgotOtp, resetPassword } from "../../services/authService";

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
    const [gender, setGender] = useState('');

    const [emergency1, setEmergency1] = useState({ name: '', phone: '', gender: '' });
    const [emergency2, setEmergency2] = useState({ name: '', phone: '', gender: '' });

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
        setGender('');
        setEmergency1({ name: '', phone: '', gender: '' });
        setEmergency2({ name: '', phone: '', gender: '' });
        setMessage({ type: '', text: '' });
        onClose();
    };

    const handleBackToLogin = () => {
        setView('login');
        setMessage({ type: '', text: '' });
    };

    // --- Login Handler ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(email, password);

            // Backend sends: { message: "...", access_token: "...", token_type: "...", first_login: ... }
            const { access_token, first_login } = response.data;

            if (access_token) {
                await login(response.data);
                setMessage({
                    type: "success",
                    text: "Login successful!"
                });

                setTimeout(() => {
                    resetState();
                    navigate("/home");
                }, 1500);
            } else if (first_login) {
                // If not verified, backend sends otp_token
                setOtpToken(response.data.otp_token);
                setMessage({
                    type: "success",
                    text: "Email not verified. OTP sent."
                });
                setView('signup_step4');
            }

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Login failed"
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Sign Up Flow Handlers ---
    const handleSignUpStep1 = (e) => {
        e.preventDefault();
        setView('signup_step2');
        setMessage({ type: '', text: '' });
    };

    const handleSignUpStep2 = (e) => {
        e.preventDefault();
        setView('signup_step3');
        setMessage({ type: '', text: '' });
    };

    const handleSignUpStep3 = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match!" });
            return;
        }

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
                        phone_no: emergency1.phone,
                        gender: emergency1.gender
                    },
                    {
                        emergency_name: emergency2.name,
                        phone_no: emergency2.phone,
                        gender: emergency2.gender
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

        try {
            await verifySignupOtp(email, otp, otpToken);

            setMessage({ type: 'success', text: "Account created successfully! Please log in with your credentials." });

            setTimeout(() => {
                setPassword(''); // Clear password to require manual entry
                setConfirmPassword('');
                setOtp('');
                setView('login');
            }, 2000);

        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Verification failed"
            });
        }
    };

    // --- Forgot Password Handlers ---
    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await forgotPassword(email);
            setOtpToken(response.data.otp_token);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setView('forgot_otp');
            }, 2000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Request failed"
            });
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            await verifyForgotOtp(email, otp, otpToken);
            setMessage({ type: 'success', text: 'OTP Verified!' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setView('forgot_reset');
            }, 1000);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Invalid OTP"
            });
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match!" });
            return;
        }
        try {
            await resetPassword({
                email,
                otp,
                otp_token: otpToken,
                new_password: password
            });
            setMessage({ type: 'success', text: "Password reset successfully!" });
            setTimeout(() => handleBackToLogin(), 1500);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Reset failed"
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" aria-hidden="true" onClick={resetState}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-[48px] text-left overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative border border-white">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40 -z-10"></div>
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={resetState}>
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start justify-center">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                {message.text && (
                                    <div className={`mb-4 p-3 rounded text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {message.text}
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
                                        gender={gender}
                                        setGender={setGender}
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
