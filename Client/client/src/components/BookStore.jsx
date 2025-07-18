import React, { useEffect, useState } from "react";
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

const BookStore = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [book, setBook] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    bookImage: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // Filter state
  const [filter, setFilter] = useState({
    name: "",
    author: "",
    minPrice: "",
    maxPrice: "",
  });
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const { darkMode, setDarkMode } = useDarkMode();

  // Remove local darkMode state and useEffect for body background

  // Fetch books
  const fetchBooks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      return;
    }
    try {
      const res = await fetch("http://localhost:7000/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to fetch books");
        return;
      }
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      setError("Error fetching books");
    }
  };

  useEffect(() => {
    fetchBooks();
    // Get role from localStorage (set on login)
    setRole(localStorage.getItem("role") || "user");
    // eslint-disable-next-line
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesName = b.bookName.toLowerCase().includes(filter.name.toLowerCase());
    const matchesAuthor = b.bookAuthor.toLowerCase().includes(filter.author.toLowerCase());
    const price = parseFloat(b.bookPrice);
    const min = filter.minPrice ? parseFloat(filter.minPrice) : -Infinity;
    const max = filter.maxPrice ? parseFloat(filter.maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;
    return matchesName && matchesAuthor && matchesPrice;
  });

  // Handle form changes
  const handleChange = (e) => {
    if (e.target.name === "bookImage") {
      setBook({ ...book, bookImage: e.target.files[0] });
    } else {
      setBook({ ...book, [e.target.name]: e.target.value });
    }
  };

  // Handle form submit (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No token found. Please login.");
      return;
    }
    const formData = new FormData();
    formData.append("bookName", book.bookName);
    formData.append("bookAuthor", book.bookAuthor);
    formData.append("bookPrice", book.bookPrice);
    if (book.bookImage) {
      formData.append("bookImage", book.bookImage);
    }
    try {
      let url = "http://localhost:7000/api/books/add";
      let method = "POST";
      if (editMode && editId) {
        url = `http://localhost:7000/api/books/edit/${editId}`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: editMode ? "Book updated successfully!" : "Book added successfully!", type: 'success' });
        setBook({
          bookName: "",
          bookAuthor: "",
          bookPrice: "",
          bookImage: null,
        });
        setEditMode(false);
        setEditId(null);
        setShowAddForm(false);
        fetchBooks();
      } else {
        setToast({ message: data.message || "Failed to save book", type: 'error' });
      }
    } catch (error) {
      setToast({ message: "Error saving book", type: 'error' });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:7000/api/books/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Book deleted successfully!", type: 'success' });
        fetchBooks();
      } else {
        setToast({ message: data.message || "Failed to delete book", type: 'error' });
      }
    } catch (error) {
      setToast({ message: "Error deleting book", type: 'error' });
    }
  };

  // Handle edit
  const handleEdit = (b) => {
    setBook({
      bookName: b.bookName,
      bookAuthor: b.bookAuthor,
      bookPrice: b.bookPrice,
      bookImage: null, // Don't prefill file input
    });
    setEditMode(true);
    setEditId(b._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add to Cart handler (with localStorage cart logic)
  const handleAddToCart = (book) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Check if book already in cart (by _id)
    if (cart.some(item => item._id === book._id)) {
      setToast({ message: `Book already in cart!`, type: 'error' });
      return;
    }
    cart.push({ ...book, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    setToast({ message: `Added '${book.bookName}' to cart!`, type: 'success' });
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bookstore-container min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 overflow-x-hidden">
      {/* Remove local dark mode toggle button, NavBar handles it */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, message: '' })} />
      <h2 className="bookstore-title">Book Store</h2>
      {/* Filter UI */}
      <div className="book-filter" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
          placeholder="Search by Book Name"
          style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 180 }}
        />
        <input
          type="text"
          name="author"
          value={filter.author}
          onChange={handleFilterChange}
          placeholder="Search by Author"
          style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 180 }}
        />
        <input
          type="number"
          name="minPrice"
          value={filter.minPrice}
          onChange={handleFilterChange}
          placeholder="Min Price"
          style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: 120 }}
        />
        <input
          type="number"
          name="maxPrice"
          value={filter.maxPrice}
          onChange={handleFilterChange}
          placeholder="Max Price"
          style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: 120 }}
        />
      </div>
      {/* Add Book Button */}
      {role === "admin" && !showAddForm && !editMode && (
        <button
          style={{ marginBottom: 24, padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={() => { setShowAddForm(true); setEditMode(false); setBook({ bookName: '', bookAuthor: '', bookPrice: '', bookImage: null }); }}
        >
          Add Book
        </button>
      )}
      {/* Add/Edit Book Form */}
      {(showAddForm || editMode) && (
        <form
          className="book-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          style={{ marginBottom: 32 }}>
          <h3 className="form-title">
            {editMode ? "Edit Book" : "Add a New Book"}
          </h3>
          <div className="form-group">
            <label htmlFor="bookName">Book Name</label>
            <input
              type="text"
              id="bookName"
              name="bookName"
              value={book.bookName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bookAuthor">Book Author</label>
            <input
              type="text"
              id="bookAuthor"
              name="bookAuthor"
              value={book.bookAuthor}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bookPrice">Book Price</label>
            <input
              type="number"
              id="bookPrice"
              name="bookPrice"
              value={book.bookPrice}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bookImage">Book Image</label>
            <input
              type="file"
              id="bookImage"
              name="bookImage"
              accept="image/*"
              onChange={handleChange}
              className="form-input"
              {...(editMode ? {} : { required: true })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="form-btn">
              {editMode ? "Update Book" : "Add Book"}
            </button>
            {editMode && (
              <button
                type="button"
                className="form-btn cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  setEditId(null);
                  setBook({
                    bookName: "",
                    bookAuthor: "",
                    bookPrice: "",
                    bookImage: null,
                  });
                }}>
                Cancel
              </button>
            )}
          </div>
          {message && (
            <div
              className={
                message.includes("success") ? "success-message" : "error-message"
              }>
              {message}
            </div>
          )}
        </form>
      )}
      {/* Book Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {filteredBooks.map((b) => (
          <div key={b._id} className="book-card" style={{ transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(30,41,59,0.06)', background: '#f1f5f9', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            {b.bookImage && (
              <img
                src={`http://localhost:7000/uploads/${b.bookImage}`}
                alt={b.bookName}
                style={{
                  width: '100%',
                  maxWidth: 160,
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginBottom: 18,
                  boxShadow: '0 2px 8px rgba(80,80,180,0.10)'
                }}
              />
            )}
            <h4 style={{
              margin: '8px 0 4px 0',
              color: '#3730a3',
              fontWeight: 700,
              fontSize: 20,
              textAlign: 'center',
              letterSpacing: 0.2
            }}>{b.bookName}</h4>
            <div style={{ color: '#334155', fontSize: 16, marginBottom: 2, fontWeight: 500 }}>Author: <span style={{ color: '#6366f1' }}>{b.bookAuthor}</span></div>
            <div style={{ color: '#64748b', fontSize: 16, marginBottom: 10 }}>Price: <span style={{ color: '#059669', fontWeight: 600 }}>₹{b.bookPrice}</span></div>
            {role === "admin" && (
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto', width: '100%' }}>
                <button onClick={() => handleEdit(b)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }}>Edit</button>
                <button onClick={() => handleDelete(b._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }}>Delete</button>
              </div>
            )}
            {role === "user" && (
              <button
                style={{ marginTop: 12, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                onClick={() => handleAddToCart(b)}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        .bookstore-container {
          background: linear-gradient(120deg, #f1f5f9 0%, #e0e7ff 100%);
          min-height: 100vh;
          padding-bottom: 40px;
        }
      `}</style>
    </div>
  );
};

export default BookStore;
