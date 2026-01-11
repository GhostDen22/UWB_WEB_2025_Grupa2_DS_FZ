import React, { createContext, useState, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const [orders, setOrders] = useState([
        { id: 1, title: "Przykładowy produkt", price: 100 }
    ]);

    const addOrder = (newOrder) => {
        setOrders((prevOrders) => [...prevOrders, { ...newOrder, id: Date.now() }]);
    };

    return (
        <ShopContext.Provider value={{ orders, addOrder }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);