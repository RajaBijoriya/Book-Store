import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setMessage("Item removed from cart.");
    setTimeout(() => setMessage(""), 1500);
  };

  // Optional: Update quantity
  const updateQuantity = (id, delta) => {
    const updatedCart = cart.map((item) => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  if (cart.length === 0) {
    return <div style={{ margin: 40, textAlign: 'center', fontWeight: 500 }}>Your cart is empty.</div>;
  }

  return (
    <div className="cart-container" style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px rgba(30,41,59,0.08)', padding: 32 }}>
      <h2 style={{ textAlign: 'center', color: '#4f46e5', marginBottom: 24 }}>Your Cart</h2>
      {message && <div style={{ color: '#22c55e', marginBottom: 16, textAlign: 'center' }}>{message}</div>}
      {cart.map((item) => (
        <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, borderBottom: '1px solid #e0e7ff', paddingBottom: 12 }}>
          {item.bookImage && (
            <img src={`http://localhost:7000/uploads/${item.bookImage}`} alt={item.bookName} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{item.bookName}</div>
            <div style={{ color: '#6366f1', fontWeight: 500 }}>Author: {item.bookAuthor}</div>
            <div style={{ color: '#059669', fontWeight: 600 }}>₹{item.bookPrice}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => updateQuantity(item._id, -1)} style={{ padding: '2px 8px', fontSize: 18, borderRadius: 6 }}>-</button>
            <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item._id, 1)} style={{ padding: '2px 8px', fontSize: 18, borderRadius: 6 }}>+</button>
          </div>
          <button onClick={() => removeFromCart(item._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 500, marginLeft: 10 }}>Remove</button>
        </div>
      ))}
      <div style={{ textAlign: 'right', marginTop: 24, fontWeight: 600, fontSize: 18 }}>
        Total: ₹{cart.reduce((sum, item) => sum + Number(item.bookPrice) * item.quantity, 0)}
      </div>
    </div>
  );
};

export default Cart; 