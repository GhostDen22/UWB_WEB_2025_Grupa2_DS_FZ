import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useShop } from "./ShopContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { products, cart, addToCart } = useShop();

  const product = useMemo(() => {
    const pid = Number(id);
    return products.find(p => Number(p.Id) === pid);
  }, [products, id]);

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", textAlign: "left" }}>
        <h2 style={{ marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>Produkt</h2>
        <hr style={{ border: "none", borderTop: "3px solid #000", margin: "0 0 20px 0", opacity: 1 }} />
        <p>Nie znaleziono produktu (albo lista produktów jeszcze się ładuje).</p>
      </div>
    );
  }

  const currentInCart = cart.find(i => i.Id === product.Id)?.count ?? 0;

  const handleAdd = () => {
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 1) return;

    if (currentInCart + q > product.Qty) {
      alert("Brak wystarczającej ilości w magazynie!");
      return;
    }

    addToCart(product, q);
    setQuantity(1);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ textAlign: "left", marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>
        {product.Name}
      </h2>

      <hr style={{ border: "none", borderTop: "3px solid #000", margin: "0 0 20px 0", opacity: 1 }} />

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              border: "1px solid #eee",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              overflow: "hidden",
              flexShrink: 0,
            }}
            dangerouslySetInnerHTML={{ __html: product.Image }}
          />

          <div style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "14px", color: "#333" }}>{product.Description}</div>

            <div style={{ marginBottom: "14px" }}>
              Dostępne: <strong>{product.Qty}</strong>
            </div>

            <div style={{ fontSize: "22px", fontWeight: "800" }}>
              {Number(product.Price).toFixed(2)} €
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <input
            type="number"
            min="1"
            max={product.Qty}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              width: "80px",
              height: "44px",
              textAlign: "center",
              border: "1px solid #777",
              borderRadius: "2px",
              fontSize: "14px",
            }}
          />

          <button
            onClick={handleAdd}
            style={{
              height: "44px",
              padding: "0 28px",
              border: "none",
              borderRadius: "4px",
              background: "#28a745",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
              minWidth: "220px",
            }}
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
  );
}
