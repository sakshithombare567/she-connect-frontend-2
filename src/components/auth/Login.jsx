import React from 'react';

const Login = ({ email, setEmail, password, setPassword, handleLogin, setView, setMessage, loading }) => {
    return (
        <>
            <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-6" id="modal-title">
                Welcome Back
            </h3>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">College Email ID</label>
                    <input
                        type="email"
                        id="email"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="Enter your registered email id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">Password</label>
                    <input
                        type="password"
                        id="password"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <button type="button" onClick={() => { setView('forgot_email'); setMessage({ type: '', text: '' }); }} className="font-medium text-pink-600 hover:text-pink-500 bg-transparent border-none p-0 cursor-pointer">
                            Forgot Password?
                        </button>
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-gray-600 text-sm">Don't have an account? </span>
                    <button type="button" onClick={() => { setView('signup_step1'); setMessage({ type: '', text: '' }); }} className="font-medium text-pink-600 hover:text-pink-500 text-sm bg-transparent border-none p-0 cursor-pointer">
                        Create Account
                    </button>
                </div>
            </form>
        </>
    );
};

export default Login;
