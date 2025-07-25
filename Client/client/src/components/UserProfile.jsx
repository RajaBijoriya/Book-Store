import React, { useEffect, useState } from "react";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please login.");
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:7000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to fetch user info");
        } else {
          setUserInfo(data);
        }
      } catch (err) {
        setError("Error fetching user info");
      }
      setLoading(false);
    };
    fetchUserInfo();
  }, []);

  if (loading) return <div style={{ margin: 40, textAlign: 'center' }}>Loading profile...</div>;
  if (error) return <div style={{ margin: 40, color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!userInfo) return null;

  return (
    <div className="profile-container" style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(30,41,59,0.08)', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: 24 }}>User Profile</h2>
      <div style={{ fontSize: 18, marginBottom: 12 }}><b>Name:</b> {userInfo.name}</div>
      <div style={{ fontSize: 18, marginBottom: 12 }}><b>Email:</b> {userInfo.email}</div>
      <div style={{ fontSize: 18, marginBottom: 12 }}><b>Role:</b> {userInfo.role}</div>
      {/* Add more fields as needed */}
    </div>
  );
};

export default UserProfile; 