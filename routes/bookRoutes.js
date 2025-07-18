import express from "express";
import {
  upload,
  addBook,
  editBook,
  deleteBook,
  verifyToken,
  isAdmin,
} from "../controller/bookController.js";
import Book from "../models/bookModel.js";

const router = express.Router();

// Get all books (BookStore UI)
router.get("/", verifyToken, async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Add book (with image upload)
router.post("/add", verifyToken, isAdmin, upload.single("bookImage"), addBook);

// Edit book (with image upload)
router.put("/edit/:id", verifyToken, isAdmin, upload.single("bookImage"), editBook);

// Delete book
router.delete("/delete/:id", verifyToken, isAdmin, deleteBook);

export default router;
