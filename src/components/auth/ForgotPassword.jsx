import React from 'react';

const ForgotPassword = ({
    view,
    setView,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    handleSendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackToLogin,
    setMessage
}) => {
    return (
        <>
            {/* FORGOT PASSWORD - STEP 1 (EMAIL) */}
            {view === 'forgot_email' && (
                <>
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-6">
                        Reset Password
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Enter your registered email ID to receive an OTP.</p>
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 text-left">Registered Email ID</label>
                            <input
                                type="email"
                                id="reset-email"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter your registered email id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Generate OTP
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <button type="button" onClick={handleBackToLogin} className="font-medium text-pink-600 hover:text-pink-500 text-sm bg-transparent border-none p-0 cursor-pointer">
                                Back to Login
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* FORGOT PASSWORD - STEP 2 (OTP) */}
            {view === 'forgot_otp' && (
                <>
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-6">
                        Verify OTP
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Enter the OTP sent to {email}</p>
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-left">OTP</label>
                            <input
                                type="text"
                                id="otp"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter OTP you received"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Verify OTP
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => { setView('forgot_email'); setMessage({ type: '', text: '' }); }} className="font-medium text-pink-600 hover:text-pink-500 text-sm bg-transparent border-none p-0 cursor-pointer">
                                Resend OTP
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* FORGOT PASSWORD - STEP 3 (RESET) */}
            {view === 'forgot_reset' && (
                <>
                    <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-6">
                        Set New Password
                    </h3>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 text-left">New Password</label>
                            <input
                                type="password"
                                id="new-password"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 text-left">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Submit
                            </button>
                        </div>
                    </form>
                </>
            )}
        </>
    );
};

export default ForgotPassword;
