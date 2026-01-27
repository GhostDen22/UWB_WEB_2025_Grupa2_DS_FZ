import React from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from './ShopContext';

export default function Cart() {
  const { cart, totalSum, updateCartQuantity, removeFromCart, handlePlaceOrder } = useShop();
  const navigate = useNavigate();

  return (
    <div className="cart-container" style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "left", marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>
        Twój Koszyk
      </h2>

      {cart.length === 0 ? (
        <p>Koszyk jest pusty...</p>
      ) : (
        <div style={{ display: "block" }}>
          <hr style={{ border: "none", borderTop: "3px solid #000", margin: "0 0 20px 0", opacity: 1 }} />

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {cart.map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: "350px" }}>
                  <div
                    style={{ width: "60px", height: "60px", flexShrink: 0, display: "flex", alignItems: "center" }}
                    dangerouslySetInnerHTML={{ __html: item.Image }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "bold", fontSize: "18px" }}>{item.Name}</div>
                    <div style={{ fontSize: "13px", color: "#888" }}>
                      Cena jedn.: {Number(item.Price).toFixed(2)} €
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div style={{ width: "100px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Ilość:</span>
                    <input
                      type="number"
                      value={item.count}
                      min="1"
                      max={item.Qty}
                      onChange={(e) => updateCartQuantity(index, e.target.value)}
                      style={{ width: "50px", textAlign: "center" }}
                    />
                  </div>

                  <div style={{ width: "140px", textAlign: "left", paddingLeft: "15px" }}>
                    <span style={{ fontWeight: "bold" }}>
                      Razem: {(Number(item.Price) * item.count).toFixed(2)} €
                    </span>
                  </div>

                  <div style={{ width: "90px", textAlign: "right" }}>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(index)}
                      style={{
                        backgroundColor: "#d9534f",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ textAlign: "right", marginTop: "40px" }}>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
              Do zapłaty: {totalSum.toFixed(2)} €
            </h3>

            <button
              className="checkout-btn"
              onClick={() => handlePlaceOrder(() => navigate("/orders"))}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "15px 50px",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Złóż zamówienie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
