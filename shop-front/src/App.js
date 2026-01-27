import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ShopProvider, useShop } from './ShopContext';
import ProductFilters from "./ProductFilters";
import './style.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart } = useShop();
  const handleAddClick = () => {
    const existingItem = cart.find(item => item.Id === product.Id);
    const currentInCart = existingItem ? existingItem.count : 0;
    if (currentInCart + Number(quantity) > product.Qty) {
      alert("Brak wystarczającej ilości w magazynie!");
      return;
    }
    addToCart(product, Number(quantity));
    setQuantity(1);
  };
  return (
    <div className="product-card">
      <h3>{product.Name}</h3>
      <div className="product-image" dangerouslySetInnerHTML={{ __html: product.Image }} />
      <p className="product-description">{product.Description}</p>
      <p>Dostępne: <strong>{product.Qty}</strong></p>
      <p className="product-price">{Number(product.Price).toFixed(2)} €</p>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '50px' }} />
        <button className="add-btn" onClick={handleAddClick}>Dodaj</button>
      </div>
    </div>
  );
};

const Orders = () => {
  const { orders } = useShop();
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  return (
    <div className="orders-container" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ textAlign: 'left', marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>Twoje Zamówienia</h2>

      <div style={{ display: 'block' }}>
        <hr style={{ border: 'none', borderTop: '3px solid #000', margin: '0 0 20px 0', opacity: 1 }} />

        {orders.length === 0 ? (
          <p>Brak zamówień.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {orders.map((order) => (
              <li key={order.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', cursor: 'pointer' }}
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>

                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{order.title}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>ID transakcji: {order.id}</div>
                    <button style={{ background: 'none', border: 'none', color: '#007bff', padding: 0, cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}>
                      {expandedOrderId === order.id ? '↑ Ukryj szczegóły' : '↓ Pokaż szczegóły'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      Razem: {Number(order.price).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div style={{ backgroundColor: '#f9f9f9', padding: '20px', marginTop: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.items && order.items.map((item, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '15px 0',
                          borderBottom: idx !== order.items.length - 1 ? '1px solid #ddd' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}
                              dangerouslySetInnerHTML={{ __html: item.Image }} />
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.Name}</div>
                              <div style={{ fontSize: '12px', color: '#888' }}>Cena jedn.: {Number(item.Price).toFixed(2)} €</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', textAlign: 'right' }}>
                            <div style={{ width: '100px', fontSize: '15px', textAlign: 'left' }}>
                              Ilość: <strong>{item.count}</strong>
                            </div>
                            <div style={{ width: '150px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                Razem: {(item.Price * item.count).toFixed(2)} €
                              </span>
                            </div>
                            <div style={{ width: '10px' }}></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const CartView = () => {
  const { cart, totalSum, updateCartQuantity, removeFromCart, handlePlaceOrder } = useShop();
  const navigate = useNavigate();

  return (
    <div className="cart-container" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ textAlign: 'left', marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>Twój Koszyk</h2>
      {cart.length === 0 ? <p>Koszyk jest pusty...</p> : (
        <div style={{ display: 'block' }}>
          <hr style={{ border: 'none', borderTop: '3px solid #000', margin: '0 0 20px 0', opacity: 1 }} />
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cart.map((item, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '350px' }}>
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, display: 'flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: item.Image }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.Name}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>Cena jedn.: {Number(item.Price).toFixed(2)} €</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Ilość:</span>
                    <input type="number" value={item.count} min="1" max={item.Qty} onChange={(e) => updateCartQuantity(index, e.target.value)} style={{ width: '50px', textAlign: 'center' }} />
                  </div>
                  <div style={{ width: '140px', textAlign: 'left', paddingLeft: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>Razem: {(item.Price * item.count).toFixed(2)} €</span>
                  </div>
                  <div style={{ width: '90px', textAlign: 'right' }}>
                    <button className="remove-btn" onClick={() => removeFromCart(index)} style={{ backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Usuń</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'right', marginTop: '40px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Do zapłaty: {totalSum.toFixed(2)} €</h3>
            <button className="checkout-btn" onClick={() => handlePlaceOrder(() => navigate('/orders'))} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '15px 50px', borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Złóż zamówienie</button>
          </div>
        </div>
      )}
    </div>
  );
};

function AppContent() {
  const { notification, totalItemsCount, products, fetchProducts } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const isCart = location.pathname === '/cart';
  const isOrders = location.pathname === '/orders';

  return (
    <div className="App">
      {notification && <div className="notification">{notification}</div>}
      <header className="App-header">
        <h1>Mój Sklep</h1>
        <div style={{ display: 'flex', gap: '15px' }}>

          {!isCart && !isOrders ? (
            <>
              <button className="cart-toggle-btn" onClick={() => navigate('/orders')}>
                Moje Zamówienia
              </button>
              <button className="cart-toggle-btn" onClick={() => navigate('/cart')}>
                Koszyk ({totalItemsCount})
              </button>
            </>
          ) : (
            <button className="cart-toggle-btn" onClick={() => navigate('/')}>
              Wróć do Sklepu
            </button>
          )}

        </div>
      </header>
      {!isCart && !isOrders && (
        <div className="filters-row">
          <ProductFilters onApply={fetchProducts} />
        </div>
      )}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<div className="products-container">{products.map(p => <ProductCard key={p.Id} product={p} />)}</div>} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <ShopProvider><Router><AppContent /></Router></ShopProvider>;
}