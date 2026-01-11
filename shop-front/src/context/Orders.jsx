import React from 'react';
import { useShop } from '../context/ShopContext';

const Orders = () => {
    const { orders = [] } = useShop();

    return (
        <div style={{ border: '2px solid blue', padding: '15px', margin: '10px' }}>
            <h3>Twoje Zamówienia ({orders.length})</h3>
            {orders.length === 0 ? (
                <p>Brak zamówień.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>
                            {order.title} - <strong>{order.price} €</strong>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Orders;