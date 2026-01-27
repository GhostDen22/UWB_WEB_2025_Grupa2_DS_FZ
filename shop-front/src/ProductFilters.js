import React, { useState } from "react";

export default function ProductFilters({ onApply }) {
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

            <button className="filters-btn" onClick={() => onApply({ name, price_sort: "" })}>Szukaj</button>
            <button className="filters-btn filters-btn-secondary" onClick={() => { setName(""); onApply({}); }}>
                Wyczyść
            </button>
            <button className="filters-btn" onClick={() => onApply({ name, price_sort: "asc" })}>Cena ↑</button>
            <button className="filters-btn" onClick={() => onApply({ name, price_sort: "desc" })}>Cena ↓</button>
        </div>
    );
}
