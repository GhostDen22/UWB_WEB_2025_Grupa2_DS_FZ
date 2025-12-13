import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Tworzymy "pudełko" na nasze produkty (stan)
  const [products, setProducts] = useState([]);

  // 2. Używamy useEffect, żeby pobrać dane raz, po załadowaniu strony
  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(response => response.json()) // Zamień odpowiedź na JSON
      .then(data => setProducts(data))   // Włóż dane do pudełka
      .catch(error => console.error('Błąd pobierania:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mój Sklep</h1>
        
        {/* 3. Wyświetlamy listę produktów */}
        <div className="products-container">
          {products.map((product) => (
            <div key={product.Name} style={{ border: '1px solid white', margin: '10px', padding: '10px' }}>
              <h2>{product.Name}</h2>
              <p>{product.Description}</p>
              <p><strong>Cena: {product.Price} zł</strong></p>
              
              {/* Wyświetlanie obrazka SVG z bazy danych */}
              <div dangerouslySetInnerHTML={{ __html: product.Image }} />
            </div>
          ))}
        </div>

      </header>
    </div>
  );
}

export default App;