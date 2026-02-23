import React from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const Login = ({ email, setEmail, password, setPassword, handleLogin, setView, setMessage, loading }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-gray-900 text-center mb-1">
                Welcome Back
            </h3>
            <p className="text-gray-400 text-center text-sm mb-8 font-medium">Log in to your SheConnect account</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">College Email ID</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                        <input
                            type="email"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                            placeholder="yourname@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="group">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-left">Password</label>
                        <button type="button" onClick={() => { setView('forgot_email'); setMessage({ type: '', text: '' }); }} className="text-xs font-bold text-pink-600 hover:text-pink-500 bg-transparent border-none p-0 cursor-pointer">
                            Forgot?
                        </button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={18} />
                        <input
                            type="password"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 transition-all font-medium text-gray-900 placeholder:text-gray-300"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">
                            {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
                        </span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button type="button" onClick={() => { setView('signup_step1'); setMessage({ type: '', text: '' }); }} className="text-gray-400 font-bold text-sm hover:text-pink-600 transition-colors">
                        Don't have an account? <span className="text-pink-600">Create Account</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;
