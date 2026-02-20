
import api from "../api/axios";

/*export const loginUser = (email_id, password) =>
  api.post("/auth/login", { email_id, password });*/

export const loginUser = (email_id, password) => {
  // 🔥 Development Mode - Skip Backend
  return Promise.resolve({
    data: {
      access_token: "dev-token",
      name: "Sakshi",
      email_id: email_id,
      phone_no: "9876543210",
      password:"123456",
      emergency_contacts: []
    }
  });
};







export const signupUser = (formData) =>
  api.post("/auth/signup", formData);

export const verifySignupOtp = (email, otp, otpToken) =>
  api.post(`/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&otp_token=${encodeURIComponent(otpToken)}`);

export const forgotPassword = (email) =>
  api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);

export const verifyForgotOtp = (email, otp, otpToken) =>
  api.post(`/auth/verify-forgot-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&otp_token=${encodeURIComponent(otpToken)}`);

export const resetPassword = (formData) =>
  api.post("/auth/reset-password", null, {
    params: {
      email: formData.email,
      otp: formData.otp,
      otp_token: formData.otp_token,
      new_password: formData.new_password
    }
  });

export const resendOtp = (email, purpose) =>
  api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}&purpose=${encodeURIComponent(purpose)}`);

export const getProfile = () =>
  api.get("/auth/me");

export const getColleges = () =>
  api.get("/auth/colleges");