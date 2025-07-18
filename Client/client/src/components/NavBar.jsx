import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "./DarkModeContext";

const NavBar = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const { darkMode, setDarkMode } = useDarkMode();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Update cart count on mount and when storage changes
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    // Update role on mount and when storage changes
    const updateRole = () => {
      setRole(localStorage.getItem("role") || "user");
    };
    updateRole();
    window.addEventListener("storage", updateRole);
    return () => window.removeEventListener("storage", updateRole);
  }, []);
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#6366f1', color: '#fff',
      padding: '14px 0', marginBottom: 24,
      boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>BookStore App</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {/* Cart link for users only */}
          {role === 'user' && (
            <Link to="/cart" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
              🛒 Cart ({cartCount})
            </Link>
          )}
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          <Link to="/signup" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Sign Up</Link>
          <button
            style={{ background: darkMode ? '#232946' : '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
