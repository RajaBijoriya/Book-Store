import React from "react";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import BookStore from "./components/BookStore";
import AddBook from "./components/AddBook";
import NavBar from "./components/NavBar";

import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <NavBar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bookstore" element={<BookStore />} />
        <Route path="/addbook" element={<AddBook />} />
        
      </Routes>
    </div>
  );
};

export default App;
