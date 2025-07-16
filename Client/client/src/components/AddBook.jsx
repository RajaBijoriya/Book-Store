import React, { useState } from "react";

const AddBook = () => {
  const [book, setBook] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    bookImage: null,
  });
  const [message, setMessage] = useState("");

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
      setMessage("No token found. Please login.");
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
        setMessage("Book added successfully!");
        setBook({
          bookName: "",
          bookAuthor: "",
          bookPrice: "",
          bookImage: null,
        });
      } else {
        setMessage(data.message || "Failed to add book");
      }
    } catch (error) {
      setMessage("Error adding book");
    }
  };

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Book Name:</label>
          <input
            type="text"
            name="bookName"
            value={book.bookName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Book Author:</label>
          <input
            type="text"
            name="bookAuthor"
            value={book.bookAuthor}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Book Price:</label>
          <input
            type="number"
            name="bookPrice"
            value={book.bookPrice}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Book Image:</label>
          <input
            type="file"
            name="bookImage"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Book</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
};

export default AddBook;
