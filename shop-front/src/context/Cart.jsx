import React from 'react';
import { useShop } from '../context/ShopContext';

const Cart = () => {
    const { addOrder } = useShop();

    const handleCreateOrder = () => {
        const newOrder = {
            title: "Nowy zakup " + new Date().toLocaleTimeString(),
            price: Math.floor(Math.random() * 500) + 50
        };

        addOrder(newOrder);
    };

    return (
        <div style={{ border: '2px solid green', padding: '15px', margin: '10px' }}>
            <h3>Twój Koszyk</h3>
            <button onClick={handleCreateOrder}>Złóż nowe zamówienie</button>
        </div>
    );
};

export default Cart;