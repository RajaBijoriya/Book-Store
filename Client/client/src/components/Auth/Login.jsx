import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>{message}</div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const { darkMode, setDarkMode } = useDarkMode();

  useEffect(() => {
    document.body.style.background = darkMode
      ? 'linear-gradient(135deg, #18181b 0%, #312e81 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)';
  }, [darkMode]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      let res = await fetch("http://localhost:7000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      let data = await res.json();
      if (!res.ok || data.message === "password not matched ..") {
        setLoginError("Please enter correct password.");
        setToast({ message: "Please enter correct password.", type: 'error' });
        return;
      }
      setUser({ email: "", password: "" });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role.toLowerCase()); // Store role for UI, always lowercase
      navigate("/bookstore");
      setToast({ message: "Login successful!", type: 'success' });
    } catch (error) {
      setLoginError("An error occurred. Please try again.");
      setToast({ message: "An error occurred. Please try again.", type: 'error' });
    }
  };

  // Add state and handlers for forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotMsgColor, setForgotMsgColor] = useState("green");
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    try {
      const res = await fetch("http://localhost:7000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("OTP sent! Check your email.");
        setForgotMsgColor("green");
        setStep(2);
      } else {
        setForgotMsg(data.message || "Failed to send OTP.");
        setForgotMsgColor("red");
      }
    } catch (err) {
      setForgotMsg("Error sending email.");
      setForgotMsgColor("red");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    try {
      const res = await fetch("http://localhost:7000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("OTP verified! Enter your new password.");
        setForgotMsgColor("green");
        setStep(3);
      } else {
        setForgotMsg(data.message || "Invalid OTP.");
        setForgotMsgColor("red");
      }
    } catch (err) {
      setForgotMsg("Error verifying OTP.");
      setForgotMsgColor("red");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    if (newPassword !== confirmPassword) {
      setForgotMsg("Passwords do not match.");
      setForgotMsgColor("red");
      return;
    }
    try {
      const res = await fetch("http://localhost:7000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("Password reset successful! You can now log in.");
        setForgotMsgColor("green");
        setTimeout(() => {
          setShowForgot(false);
          setStep(1);
          setForgotEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setForgotMsg("");
        }, 2000);
      } else {
        setForgotMsg(data.message || "Failed to reset password.");
        setForgotMsgColor("red");
      }
    } catch (err) {
      setForgotMsg("Error resetting password.");
      setForgotMsgColor("red");
    }
  };

  return (
    <div className="auth-container" style={{ animation: 'fadeInToast 0.5s' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="auth-title">Login</h2>
        {loginError && <div style={{ color: 'red', marginBottom: 10 }}>{loginError}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            placeholder="Enter your Email"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="form-input"
          />
        </div>
        <button type="submit" className="auth-btn">
          Login
        </button>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <span
            style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </span>
        </div>
      </form>
      {showForgot && (
        <div className="forgot-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, position: 'relative' }}>
            <button onClick={() => { setShowForgot(false); setStep(1); setForgotEmail(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); setForgotMsg(""); }} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
            <h3>Forgot Password</h3>
            {step === 1 && (
              <form onSubmit={handleForgotSubmit}>
                <input
                  type="email"
                  name="forgotEmail"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />
                <button type="submit" style={{ width: '100%', padding: 8 }}>Send OTP</button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit}>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  placeholder="Enter OTP"
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />
                <button type="submit" style={{ width: '100%', padding: 8 }}>Verify OTP</button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleResetSubmit}>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                />
                <button type="submit" style={{ width: '100%', padding: 8 }}>Reset Password</button>
              </form>
            )}
            {forgotMsg && <div style={{ marginTop: 10, color: forgotMsgColor }}>{forgotMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
