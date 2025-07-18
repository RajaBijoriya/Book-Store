import React, { useState } from "react";
import { useDarkMode } from "./DarkModeContext";

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

const AddBook = () => {
  const [book, setBook] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    bookImage: null,
  });
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const { darkMode, setDarkMode } = useDarkMode();

  const handleChange = (e) => {
    if (e.target.name === "bookImage") {
      setBook({ ...book, bookImage: e.target.files[0] });
    } else {
      setBook({ ...book, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setToast({ message: "No token found. Please login.", type: 'error' });
      return;
    }
    const formData = new FormData();
    formData.append("bookName", book.bookName);
    formData.append("bookAuthor", book.bookAuthor);
    formData.append("bookPrice", book.bookPrice);
    formData.append("bookImage", book.bookImage);
    try {
      const res = await fetch("http://localhost:7000/api/books/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Book added successfully!", type: 'success' });
        setBook({
          bookName: "",
          bookAuthor: "",
          bookPrice: "",
          bookImage: null,
        });
      } else {
        setToast({ message: data.message || "Failed to add book", type: 'error' });
      }
    } catch (error) {
      setToast({ message: "Error adding book", type: 'error' });
    }
  };

  const role = localStorage.getItem("role") || "user";
  if (role !== "admin") {
    return <div style={{ color: 'red', fontWeight: 600, margin: 32 }}>Access denied: Only admins can add books.</div>;
  }

  return (
    <div className="auth-container" style={{ maxWidth: 480, margin: '40px auto', animation: 'fadeInToast 0.5s' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      <h2 className="auth-title">Add Book</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Book Name:</label>
          <input
            type="text"
            name="bookName"
            value={book.bookName}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Book Author:</label>
          <input
            type="text"
            name="bookAuthor"
            value={book.bookAuthor}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Book Price:</label>
          <input
            type="number"
            name="bookPrice"
            value={book.bookPrice}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Book Image:</label>
          <input
            type="file"
            name="bookImage"
            accept="image/*"
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="auth-btn">Add Book</button>
      </form>
    </div>
  );
};

export default AddBook;
