import { useState, useEffect } from 'react';
import './style.css';

// --- KARTA PRODUKTU (Bez większych zmian, tylko logika dodawania) ---
const ProductCard = ({ product, cart, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddClick = () => {
    // Sprawdzamy, ile TEGO produktu jest już w koszyku
    const existingItem = cart.find(item => item.Id === product.Id);
    const currentQtyInCart = existingItem ? existingItem.count : 0;

    const totalRequested = currentQtyInCart + Number(quantity);

    if (totalRequested > product.Qty) {
      alert(`Błąd! Mamy tylko ${product.Qty} sztuk tego towaru. Masz już ${currentQtyInCart} w koszyku.`);
      return;
    }

    if (quantity < 1) {
      alert("Musisz wybrać przynajmniej 1 sztukę.");
      return;
    }

    onAddToCart(product, Number(quantity));
    setQuantity(1);
  };

  return (
    <div className="product-card">
      <h3>{product.Name}</h3>
      <div className="product-image" dangerouslySetInnerHTML={{ __html: product.Image }} />
      <p className="product-description">{product.Description}</p>
      <p style={{ color: '#666', fontSize: '12px', margin: '5px 0' }}>
        Dostępne: <strong>{product.Qty}</strong> szt.
      </p>
      <p className="product-price">{Number(product.Price).toFixed(2)} zł</p>

      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '10px' }}>
        <input
          type="number"
          min="1"
          max={product.Qty}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ width: '50px', padding: '5px', textAlign: 'center' }}
        />
        <button className="add-btn" onClick={handleAddClick}>
          Dodaj
        </button>
      </div>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Błąd:', error));
  }, []);

  const showNotificationMessage = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // --- NOWA FUNKCJA: DODAWANIE Z GRUPOWANIEM ---
  const addToCart = (product, quantity) => {
    // Sprawdzamy, czy produkt już jest w koszyku
    const existingItemIndex = cart.findIndex(item => item.Id === product.Id);

    if (existingItemIndex !== -1) {
      // SCENARIUSZ A: Produkt już jest -> Zwiększamy jego 'count'
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].count += quantity;
      setCart(updatedCart);
    } else {
      // SCENARIUSZ B: Produktu nie ma -> Dodajemy nowy obiekt z polem 'count'
      // Tworzymy nowy obiekt, żeby nie modyfikować oryginału (best practice)
      const newItem = { ...product, count: quantity };
      setCart([...cart, newItem]);
    }

    showNotificationMessage(`Dodano do koszyka: ${product.Name} (${quantity} szt.)`);
  };

  // --- NOWA FUNKCJA: EDYCJA ILOŚCI W KOSZYKU ---
  const updateCartQuantity = (index, newQuantity) => {
    const item = cart[index];
    const parsedQty = Number(newQuantity);

    // Walidacja 1: Nie mniej niż 1
    if (parsedQty < 1) return;

    // Walidacja 2: Nie więcej niż stan magazynowy
    if (parsedQty > item.Qty) {
      alert(`Mamy tylko ${item.Qty} sztuk tego produktu w magazynie!`);
      return; // Przerywamy, nie aktualizujemy
    }

    // Aktualizacja stanu
    const updatedCart = [...cart];
    updatedCart[index].count = parsedQty;
    setCart(updatedCart);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  // --- FUNKCJA WYSYŁANIA ZAMÓWIENIA ---
  const handlePlaceOrder = () => {
    // Proste zabezpieczenie
    if (cart.length === 0) return;

    // Wysyłamy zapytanie POST do serwera
    fetch('http://localhost:5000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Mówimy serwerowi: "wysyłam JSON"
      },
      body: JSON.stringify(cart), // Pakujemy nasz koszyk do paczki
    })
      .then(async (response) => {
        if (!response.ok) {
          // Jeśli serwer zgłosił błąd (np. brak towaru), rzuć wyjątek
          const errData = await response.json();
          throw new Error(errData.error || 'Błąd zamówienia');
        }
        return response.json();
      })
      .then((data) => {
        // SUKCES!
        showNotificationMessage(`Sukces! Zamówienie nr ${data.orderId} zostało złożone.`);

        // 1. Wyczyść koszyk w stanie
        setCart([]);
        // 2. Wyczyść koszyk w pamięci przeglądarki
        localStorage.removeItem('shopping-cart');
        // 3. Zamknij widok koszyka (wróć do sklepu)
        setShowCart(false);

        // 4. Odśwież listę produktów (żeby zobaczyć zaktualizowane stany magazynowe!)
        return fetch('http://localhost:5000/products');
      })
      .then(res => res.json())
      .then(updatedProducts => setProducts(updatedProducts)) // Zaktualizuj widok produktów
      .catch((error) => {
        alert(error.message); // Wyświetl alert z błędem (np. "Brak towaru")
      });
  };
  // --- NOWE LICZENIE SUMY: Cena * Ilość (count) ---
  const totalSum = cart.reduce((sum, item) => sum + (Number(item.Price) * item.count), 0);
  // Liczymy też łączną ilość produktów do wyświetlenia na przycisku
  const totalItemsCount = cart.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="App">

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <header className="App-header">
        <h1>Mój Sklep</h1>
        <button
          className="cart-toggle-btn"
          onClick={() => setShowCart(!showCart)}
        >
          {showCart ? 'Wróć do Sklepu' : `Koszyk (${totalItemsCount})`}
        </button>
      </header>

      <main className="main-content">
        {!showCart && (
          <div className="products-container">
            {products.map((product) => (
              <ProductCard
                key={product.Id}
                product={product}
                cart={cart}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {showCart && (
          <div className="cart-container">
            <h2>Twój Koszyk</h2>
            {cart.length === 0 ? (
              <p>Koszyk jest pusty...</p>
            ) : (
              <div>
                <ul className="cart-list">
                  {cart.map((item, index) => (
                    <li key={index} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-image" dangerouslySetInnerHTML={{ __html: item.Image }} />
                        <div>
                          <span style={{ fontWeight: 'bold', display: 'block' }}>{item.Name}</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>Cena jedn.: {Number(item.Price).toFixed(2)} zł</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* --- EDYCJA ILOŚCI W KOSZYKU --- */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <label>Ilość:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.Qty}
                            value={item.count}
                            onChange={(e) => updateCartQuantity(index, e.target.value)}
                            style={{ width: '50px', padding: '5px', textAlign: 'center' }}
                          />
                        </div>

                        {/* SUMA ZA TEN KONKRETNY TOWAR */}
                        <span className="cart-item-price">
                          Razem: {(Number(item.Price) * item.count).toFixed(2)} zł
                        </span>

                        <button className="remove-btn" onClick={() => removeFromCart(index)}>Usuń</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="cart-summary">
                  <h3>Do zapłaty: {totalSum.toFixed(2)} zł</h3>
                  <button className="checkout-btn" onClick={handlePlaceOrder}>
                    Złóż zamówienie
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;