import React, { useEffect, useState } from 'react';
import { getColleges } from '../../services/authService';

const Signup = ({
    view,
    setView,
    fullName,
    setFullName,
    collegeName,
    setCollegeName,
    email,
    setEmail,
    phone,
    setPhone,
    gender,
    setGender,
    emergency1,
    setEmergency1,
    emergency2,
    setEmergency2,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otp,
    setOtp,
    handleSignUpStep1,
    handleSignUpStep2,
    handleSignUpStep3,
    handleSignUpStep4,
    handleBackToLogin
}) => {
    // College list state
    const [colleges, setColleges] = useState([]);
    const [collegesLoading, setCollegesLoading] = useState(false);
    const [collegesError, setCollegesError] = useState("");

    useEffect(() => {
        async function fetchColleges() {
            setCollegesLoading(true);
            setCollegesError("");
            try {
                const res = await getColleges();
                setColleges(res.data);
            } catch (e) {
                setCollegesError("Failed to load colleges");
            } finally {
                setCollegesLoading(false);
            }
        }
        if (view === 'signup_step1') fetchColleges();
    }, [view]);

    return (
        <>
            {/* SIGN UP - STEP 1: PERSONAL DETAILS */}
            {view === 'signup_step1' && (
                <>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-4">
                        Step 1: Personal Details
                    </h3>
                    <form onSubmit={handleSignUpStep1} className="space-y-3">
                        <div>
                            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 text-left">Full Name</label>
                            <input
                                type="text"
                                id="fullname"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="college-name" className="block text-sm font-medium text-gray-700 text-left">College Name</label>
                            <select
                                id="college-name"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                value={collegeName}
                                onChange={(e) => setCollegeName(e.target.value)}
                                disabled={collegesLoading || collegesError}
                            >
                                <option value="">{collegesLoading ? "Loading..." : collegesError ? collegesError : "Select College"}</option>
                                {colleges && colleges.map((col) => (
                                    <option key={col.college_id} value={col.college_id}>{col.college_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 text-left">College Email ID</label>
                            <input
                                type="email"
                                id="signup-email"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter your college email id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left">Phone No</label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 text-left">Gender</label>
                            <select
                                id="gender"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Next
                            </button>
                        </div>
                        <div className="text-center">
                            <button type="button" onClick={handleBackToLogin} className="font-medium text-pink-600 hover:text-pink-500 text-sm bg-transparent border-none p-0 cursor-pointer">
                                Already have an account? Log in
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* SIGN UP - STEP 2: EMERGENCY CONTACTS */}
            {view === 'signup_step2' && (
                <>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-4">
                        Step 2: Emergency Contacts
                    </h3>
                    <form onSubmit={handleSignUpStep2} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        {/* Contact 1 */}
                        <div className="border border-gray-200 rounded p-3">
                            <span className="block text-sm font-bold text-gray-700 mb-2 text-left">Emergency Contact 1</span>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency1.name}
                                    onChange={(e) => setEmergency1({ ...emergency1, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone No"
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency1.phone}
                                    onChange={(e) => setEmergency1({ ...emergency1, phone: e.target.value })}
                                />
                                <select
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency1.gender}
                                    onChange={(e) => setEmergency1({ ...emergency1, gender: e.target.value })}
                                >
                                    <option value="">Gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact 2 */}
                        <div className="border border-gray-200 rounded p-3">
                            <span className="block text-sm font-bold text-gray-700 mb-2 text-left">Emergency Contact 2</span>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency2.name}
                                    onChange={(e) => setEmergency2({ ...emergency2, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone No"
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency2.phone}
                                    onChange={(e) => setEmergency2({ ...emergency2, phone: e.target.value })}
                                />
                                <select
                                    required
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                    value={emergency2.gender}
                                    onChange={(e) => setEmergency2({ ...emergency2, gender: e.target.value })}
                                >
                                    <option value="">Gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <button type="button" onClick={() => setView('signup_step1')} className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Back
                            </button>
                            <button type="submit" className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Next
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* SIGN UP - STEP 3: PASSWORD */}
            {view === 'signup_step3' && (
                <>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-4">
                        Step 3: Create Password
                    </h3>
                    <form onSubmit={handleSignUpStep3} className="space-y-4">
                        <div>
                            <label htmlFor="signup-pass" className="block text-sm font-medium text-gray-700 text-left">New Password</label>
                            <input
                                type="password"
                                id="signup-pass"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="signup-confirm-pass" className="block text-sm font-medium text-gray-700 text-left">Confirm Password</label>
                            <input
                                type="password"
                                id="signup-confirm-pass"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button type="button" onClick={() => setView('signup_step2')} className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Back
                            </button>
                            <button type="submit" className="w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                                Generate OTP
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* SIGN UP - STEP 4: VERIFY OTP */}
            {view === 'signup_step4' && (
                <>
                    <h3 className="text-xl leading-6 font-bold text-gray-900 text-center mb-4">
                        Step 4: Verify Email
                    </h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Enter the OTP sent to {email}</p>
                    <form onSubmit={handleSignUpStep4} className="space-y-4">
                        <div>
                            <label htmlFor="signup-otp" className="block text-sm font-medium text-gray-700 text-left">OTP</label>
                            <input
                                type="text"
                                id="signup-otp"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Enter OTP (Try 123456)"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Submit & Create Account
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <button type="button" onClick={() => setView('signup_step3')} className="font-medium text-gray-600 hover:text-gray-500 text-sm bg-transparent border-none p-0 cursor-pointer">
                                Back
                            </button>
                        </div>
                    </form>
                </>
            )}
        </>
    );
};

export default Signup;
