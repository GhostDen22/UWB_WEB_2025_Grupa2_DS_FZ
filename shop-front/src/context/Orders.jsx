import { useEffect, useMemo, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // ---------------- FETCH ----------------
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/orders");
      if (!res.ok) throw new Error("Nie udało się pobrać zamówień");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ---------------- FILTER + SORT ----------------
  const filteredAndSortedOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    let copy = [...orders];

    // FILTR: tylko po ID
    if (q) {
      copy = copy.filter(o =>
        String(o?.id ?? "").toLowerCase().includes(q)
      );
    }

    // SORT: po dacie
    copy.sort((a, b) => {
      const da = new Date(a?.date || 0).getTime();
      const db = new Date(b?.date || 0).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });

    return copy;
  }, [orders, sortDir, query]);

  // ---------------- HELPERS ----------------
  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  const calcTotal = (order) => {
    if (typeof order?.totalPrice === "number") return order.totalPrice;

    const prods = Array.isArray(order?.products) ? order.products : [];
    return prods.reduce((sum, p) => {
      const qty = Number(p?.qty ?? p?.Qty ?? p?.count ?? 0);
      const price = Number(p?.Price ?? p?.price ?? 0);
      return sum + qty * price;
    }, 0);
  };

  const getItems = (order) => {
    return Array.isArray(order?.products) ? order.products : [];
  };

  // ---------------- UI ----------------
  return (
    <div
      className="orders-container"
      style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px" }}
    >
      {/* HEADER + SEARCH + SORT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <h2 style={{ textAlign: "left", marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>
          Twoje Zamówienia
        </h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            className="filters-input"
            type="text"
            placeholder="Szukaj po ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            className="filters-btn filters-btn-secondary"
            onClick={() => setQuery("")}
          >
            Wyczyść
          </button>

          <button className="filters-btn" onClick={() => setSortDir("asc")}>
            Data ↑
          </button>
          <button className="filters-btn" onClick={() => setSortDir("desc")}>
            Data ↓
          </button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "3px solid #000", margin: "10px 0 20px 0", opacity: 1 }} />

      {/* CONTENT */}
      {loading ? (
        <p>Ładowanie...</p>
      ) : filteredAndSortedOrders.length === 0 ? (
        <p>Brak zamówień.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredAndSortedOrders.map((order) => {
            const total = calcTotal(order);
            const isOpen = expandedOrderId === order.id;

            return (
              <li key={order.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Zamówienie nr {order.id}
                    </div>

                    <div style={{ fontSize: "13px", color: "#888" }}>
                      Data: {formatDate(order.date)}
                    </div>

                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#007bff",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "13px",
                        marginTop: "5px",
                      }}
                    >
                      {isOpen ? "↑ Ukryj szczegóły" : "↓ Pokaż szczegóły"}
                    </button>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                      Razem: {Number(total).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      backgroundColor: "#f9f9f9",
                      padding: "20px",
                      marginTop: "10px",
                      borderRadius: "8px",
                      border: "1px solid #eee",
                    }}
                  >
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {getItems(order).map((item, idx) => {
                        const qty = Number(item?.qty ?? item?.Qty ?? item?.count ?? 0);
                        const hasFull = item?.Name || item?.Price || item?.Image;

                        return (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "15px 0",
                              borderBottom:
                                idx !== getItems(order).length - 1 ? "1px solid #ddd" : "none",
                              gap: "20px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
                              {hasFull ? (
                                <>
                                  <div
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      flexShrink: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      overflow: "hidden",
                                    }}
                                    dangerouslySetInnerHTML={{ __html: item.Image }}
                                  />
                                  <div style={{ textAlign: "left" }}>
                                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                                      {item.Name}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#888" }}>
                                      Cena jedn.: {Number(item.Price).toFixed(2)} €
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div style={{ textAlign: "left" }}>
                                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                                    Produkt ID: {item?.id ?? item?.Id ?? "—"}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#888" }}>
                                    (Backend zwraca tylko id / qty)
                                  </div>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", textAlign: "right" }}>
                              <div style={{ width: "110px", fontSize: "15px", textAlign: "left" }}>
                                Ilość: <strong>{qty}</strong>
                              </div>

                              {hasFull && (
                                <div style={{ width: "170px" }}>
                                  <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                                    Razem: {(Number(item.Price) * qty).toFixed(2)} €
                                  </span>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
