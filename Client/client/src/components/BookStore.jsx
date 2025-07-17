import React, { useEffect, useState } from "react";

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
        setMessage(
          editMode ? "Book updated successfully!" : "Book added successfully!"
        );
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
        setMessage(data.message || "Failed to save book");
      }
    } catch (error) {
      setMessage("Error saving book");
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
        setMessage("Book deleted successfully!");
        fetchBooks();
      } else {
        setMessage(data.message || "Failed to delete book");
      }
    } catch (error) {
      setMessage("Error deleting book");
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

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bookstore-container min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 overflow-x-hidden">
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
      {!showAddForm && !editMode && (
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
      {/* Book List */}
      <div className="book-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8 px-2 w-full">
        {filteredBooks.length === 0 ? (
          <div>No books found.</div>
        ) : (
          filteredBooks.map((b) => (
            <div
              key={b._id}
              className="book-card w-full bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center min-h-[340px] transition-transform duration-200 hover:-translate-y-1 hover:scale-105 cursor-pointer font-sans p-5"
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
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
              <div style={{ display: 'flex', gap: 10, marginTop: 'auto', width: '100%' }}>
                <button
                  onClick={() => handleEdit(b)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 1px 4px rgba(99,102,241,0.08)'
                  }}
                >Edit</button>
                <button
                  onClick={() => handleDelete(b._id)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(90deg, #ef4444 60%, #f87171 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 1px 4px rgba(239,68,68,0.08)'
                  }}
                >Delete</button>
              </div>
            </div>
          ))
        )}
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
