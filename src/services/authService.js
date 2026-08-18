import api from "../api/axios";

// ─────────────────────────────────────────────────────────
//  LOGIN  (POST /auth/login)
// ─────────────────────────────────────────────────────────
export const loginUser = async (email_id, password) => {
  return api.post("/auth/login", { email_id, password });
};

// ─────────────────────────────────────────────────────────
//  SIGNUP  (POST /auth/signup)
// ─────────────────────────────────────────────────────────
export const signupUser = async (formData) => {
  return api.post("/auth/signup", {
    name: formData.name,
    email_id: formData.email_id,
    phone_no: formData.phone_no,
    password: formData.password,
    confirm_password: formData.confirm_password,
    college_id: formData.college_id,
    emergency_contacts: formData.emergency_contacts,
  });
};

// ─────────────────────────────────────────────────────────
//  VERIFY SIGNUP OTP  (POST /auth/verify-otp)
// ─────────────────────────────────────────────────────────
export const verifySignupOtp = async (email, otp, otpToken) => {
  return api.post('/auth/verify-otp', {
    email,
    otp,
    otp_token: otpToken,
  });
};

// ─────────────────────────────────────────────────────────
//  FORGOT PASSWORD  (POST /auth/forgot-password)
// ─────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
   return api.post(`/auth/forgot-password`, { email });
};

// ─────────────────────────────────────────────────────────
//  VERIFY FORGOT-PASSWORD OTP  (POST /auth/verify-forgot-otp)
// ─────────────────────────────────────────────────────────
export const verifyForgotOtp = async (email, otp, otpToken) => {
  return api.post('/auth/verify-forgot-otp', {
    email,
    otp,
    otp_token: otpToken,
  });
};

// ─────────────────────────────────────────────────────────
//  RESET PASSWORD  (POST /auth/reset-password)
// ─────────────────────────────────────────────────────────
export const resetPassword = async (formData) => {
  return api.post('/auth/reset-password', {
    email: formData.email,
    otp: formData.otp,
    otp_token: formData.otp_token,
    new_password: formData.new_password,
    confirm_password: formData.confirm_password,
  });
};

// ─────────────────────────────────────────────────────────
//  RESEND OTP  (POST /auth/resend-otp)
// ─────────────────────────────────────────────────────────
export const resendOtp = async (email, purpose) => {
  return api.post('/auth/resend-otp', {
    email,
    purpose,
  });
};

// ─────────────────────────────────────────────────────────
//  GET PROFILE  (GET /auth/me)
// ─────────────────────────────────────────────────────────
export const getProfile = async () => {
  return api.get("/auth/me");
};

// ─────────────────────────────────────────────────────────
//  GET COLLEGES  (GET /auth/colleges)
// ─────────────────────────────────────────────────────────
export const getColleges = async () => {
  return api.get("/auth/colleges");
};