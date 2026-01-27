import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ShopProvider, useShop } from "./context/ShopContext";

import Orders from "./context/Orders";
import Cart from "./context/Cart";
import ProductDetails from "./context/ProductDetails";

import "./style.css";

/* ========= ProductFilters ========= */
function ProductFilters({ onApply }) {
  const [name, setName] = useState("");

  return (
    <div className="filters-panel">
      <input
        className="filters-input"
        type="text"
        placeholder="Szukaj po nazwie..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onApply({ name });
        }}
      />

      <button className="filters-btn" onClick={() => onApply({ name, price_sort: "" })}>
        Szukaj
      </button>

      <button
        className="filters-btn filters-btn-secondary"
        onClick={() => {
          setName("");
          onApply({});
        }}
      >
        Wyczyść
      </button>

      <button className="filters-btn" onClick={() => onApply({ name, price_sort: "asc" })}>
        Cena ↑
      </button>

      <button className="filters-btn" onClick={() => onApply({ name, price_sort: "desc" })}>
        Cena ↓
      </button>
    </div>
  );
}

/* ========= ProductCard ========= */
function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart } = useShop();
  const navigate = useNavigate();

  const handleAddClick = () => {
    const existingItem = cart.find((item) => item.Id === product.Id);
    const currentInCart = existingItem ? existingItem.count : 0;

    if (currentInCart + Number(quantity) > product.Qty) {
      alert("Brak wystarczającej ilości w magazynie!");
      return;
    }

    addToCart(product, Number(quantity));
    setQuantity(1);
  };

  return (
    <div
      className="product-card"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/product/${product.Id}`)}
    >
      <h3>{product.Name}</h3>

      <div className="product-image" dangerouslySetInnerHTML={{ __html: product.Image }} />

      <p className="product-description">{product.Description}</p>

      <p>
        Dostępne: <strong>{product.Qty}</strong>
      </p>

      <p className="product-price">{Number(product.Price).toFixed(2)} €</p>

      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
        <input
          type="number"
          min="1"
          value={quantity}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ width: "50px" }}
        />

        <button
          className="add-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleAddClick();
          }}
        >
          Dodaj
        </button>
      </div>
    </div>
  );
}

/* ========= AppContent ========= */
function AppContent() {
  const { notification, totalItemsCount, products, fetchProducts } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const isCart = location.pathname === "/cart";
  const isOrders = location.pathname === "/orders";
  const isProductDetails = location.pathname.startsWith("/product/");

  return (
    <div className="App">
      {notification && <div className="notification">{notification}</div>}

      <header className="App-header">
        <h1>Mój Sklep</h1>

        <div style={{ display: "flex", gap: "15px" }}>
          {!isCart && !isOrders && !isProductDetails ? (
            <>
              <button className="cart-toggle-btn" onClick={() => navigate("/orders")}>
                Moje Zamówienia
              </button>

              <button className="cart-toggle-btn" onClick={() => navigate("/cart")}>
                Koszyk ({totalItemsCount})
              </button>
            </>
          ) : (
            <button className="cart-toggle-btn" onClick={() => navigate("/")}>
              Wróć do Sklepu
            </button>
          )}
        </div>
      </header>

      {!isCart && !isOrders && !isProductDetails && (
        <div className="filters-row">
          <ProductFilters onApply={fetchProducts} />
        </div>
      )}

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="products-container">
                {products.map((p) => (
                  <ProductCard key={p.Id} product={p} />
                ))}
              </div>
            }
          />

          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>UWB 2025 • Web Projekt </span>
          <span>© 2026 Mój Sklep</span>
        </div>
      </footer>
    </div>
  );
}

/* ========= App ========= */
export default function App() {
  return (
    <ShopProvider>
      <Router>
        <AppContent />
      </Router>
    </ShopProvider>
  );
}
