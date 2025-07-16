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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bookstore-container">
      <h2 className="bookstore-title">Book Store</h2>
      {/* Add/Edit Book Form */}
      <form
        className="book-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data">
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
      {/* Book List */}
      <div className="book-list">
        {books.map((b) => (
          <div key={b._id} className="book-card">
            <img
              src={`http://localhost:7000/uploads/${b.bookImage}`}
              alt={b.bookName}
              className="book-image"
            />
            <h3 className="book-name">{b.bookName}</h3>
            <p className="book-author">Author: {b.bookAuthor}</p>
            <p className="book-price">Price: ₹{b.bookPrice}</p>
            <div className="book-actions">
              <button
                className="book-btn edit-btn"
                onClick={() => handleEdit(b)}>
                Edit
              </button>
              <button
                className="book-btn delete-btn"
                onClick={() => handleDelete(b._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookStore;
