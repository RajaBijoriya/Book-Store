 import Book from "../models/bookModel.js";
 import multer from "multer";
 import path from "path";
 import jwt from "jsonwebtoken";
 import secretKey from "../config/authConfig.js";

 // Multer setup
 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, "uploads/");
   },
   filename: function (req, file, cb) {
     cb(null, Date.now() + path.extname(file.originalname));
   },
 });

 export const upload = multer({ storage: storage });

 export const verifyToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];
   if (!token) {
     return res.status(401).json({ message: "No token provided" });
   }
   jwt.verify(token, secretKey.secret_jwt, (err, user) => {
     if (err) {
       return res.status(403).json({ message: "Invalid token" });
     }
     req.user = user;
     next();
   });
 };

 export const isAdmin = (req, res, next) => {
   if (req.user && req.user.role === 'admin') {
     return next();
   }
   return res.status(403).json({ message: 'Access denied: Admins only.' });
 };

 // Add Book
 export const addBook = async (req, res) => {
   try {
     const { bookName, bookAuthor, bookPrice } = req.body;
     const bookImage = req.file ? req.file.filename : null;
     if (!bookImage) {
       return res.status(400).json({ message: "Book image is required" });
     }
     const book = new Book({
       bookName,
       bookAuthor,
       bookPrice,
       bookImage,
     });
     await book.save();
     res.status(201).json({ message: "Book added successfully", book });
   } catch (error) {
     res
       .status(500)
       .json({ message: "Error adding book", error: error.message });
   }
 };

 // Edit Book
 export const editBook = async (req, res) => {
   try {
     const { id } = req.params;
     const { bookName, bookAuthor, bookPrice } = req.body;
     let updateData = { bookName, bookAuthor, bookPrice };
     if (req.file) {
       updateData.bookImage = req.file.filename;
     }
     const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
     if (!book) {
       return res.status(404).json({ message: "Book not found" });
     }
     res.status(200).json({ message: "Book updated successfully", book });
   } catch (error) {
     res
       .status(500)
       .json({ message: "Error updating book", error: error.message });
   }
 };

 // Delete Book
 export const deleteBook = async (req, res) => {
   try {
     const { id } = req.params;
     const book = await Book.findByIdAndDelete(id);
     if (!book) {
       return res.status(404).json({ message: "Book not found" });
     }
     res.status(200).json({ message: "Book deleted successfully" });
   } catch (error) {
     res
       .status(500)
       .json({ message: "Error deleting book", error: error.message });
   }
 };