import React from "react";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import BookStore from "./components/BookStore";
import AddBook from "./components/AddBook";
import NavBar from "./components/NavBar";
import Cart from "./components/Cart";
import UserProfile from "./components/UserProfile";
import { Route, Routes } from "react-router-dom";
import { DarkModeProvider } from "./components/DarkModeContext";

const App = () => {
  return (
    <DarkModeProvider>
      <div className="w-full overflow-x-hidden">
        <NavBar />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookstore" element={<BookStore />} />
          <Route path="/addbook" element={<AddBook />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </DarkModeProvider>
  );
};

export default App;
