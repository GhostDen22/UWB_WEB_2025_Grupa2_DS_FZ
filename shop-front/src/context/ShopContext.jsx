import React, { createContext, useState, useEffect, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('shopping-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [notification, setNotification] = useState(null);

    useEffect(() => {
        localStorage.setItem('shopping-cart', JSON.stringify(cart));
    }, [cart]);

    // ---------------- PRODUCTS ----------------
    const fetchProducts = async ({ name = "", price_sort = "" } = {}) => {
        try {
            const params = new URLSearchParams();
            if (price_sort) params.set("price_sort", price_sort);
            if (name && name.trim()) params.set("name", name.trim());

            const url = `http://localhost:5000/products?${params.toString()}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Błąd pobierania produktów:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ---------------- NOTIFICATION ----------------
    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // ---------------- CART ----------------
    const addToCart = (product, quantity) => {
        const existingItemIndex = cart.findIndex(item => item.Id === product.Id);

        if (existingItemIndex !== -1) {
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].count += quantity;
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...product, count: quantity }]);
        }

        showNotification(`Dodano: ${product.Name} (${quantity} szt.)`);
    };

    const updateCartQuantity = (index, newQuantity) => {
        const parsedQty = Number(newQuantity);
        if (parsedQty < 1) return;

        if (parsedQty > cart[index].Qty) {
            alert(`Mamy tylko ${cart[index].Qty} sztuk w magazynie!`);
            return;
        }

        const updatedCart = [...cart];
        updatedCart[index].count = parsedQty;
        setCart(updatedCart);
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const totalSum = cart.reduce(
        (sum, item) => sum + (Number(item.Price) * item.count),
        0
    );

    const totalItemsCount = cart.reduce(
        (sum, item) => sum + item.count,
        0
    );

    // ---------------- ORDERS ----------------
    const handlePlaceOrder = async (onSuccess) => {
        if (cart.length === 0) return;

        try {
            const res = await fetch('http://localhost:5000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Błąd zamówienia');
            }

            const data = await res.json();
            showNotification(`Sukces! Zamówienie nr ${data.orderId} złożone.`);

            setCart([]);
            localStorage.removeItem('shopping-cart');

            fetchProducts();

            if (onSuccess) onSuccess();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <ShopContext.Provider value={{
            products,
            cart,
            notification,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            handlePlaceOrder,
            totalSum,
            totalItemsCount,
            fetchProducts
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);
