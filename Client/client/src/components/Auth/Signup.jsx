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

const Signup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
    if (user.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    try {
      let res = await fetch("http://localhost:7000/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      res = await res.json();
      setUser({ name: "", email: "", password: "", role: "user" });
      setConfirmPassword("");
      navigate("/login");
      setToast({ message: 'Signup successful!', type: 'success' });
    } catch (error) {
      console.log(error);
      setToast({ message: 'Signup failed. Email or username might be in use.', type: 'error' });
    }
  };

  return (
    <div className="auth-container" style={{ animation: 'fadeInToast 0.5s' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <h2 className="auth-title">Sign Up</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            className="form-input"
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={user.role}
            onChange={handleChange}
            className="form-input"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {passwordError && <div style={{ color: 'red', marginBottom: '10px' }}>{passwordError}</div>}
        <button type="submit" className="auth-btn">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
