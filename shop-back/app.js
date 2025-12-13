const dbAdapter = require('lowdb/node')
const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto');
const bodyParser = require('body-parser')
const port = 5000

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Default Endpoint')
})

app.get('/products', async (req, res) => {
    const db = await dbAdapter.JSONFilePreset('db.json', {
        products: [], orders: []
    });
    
    const databaseTables = db.data;
    const products = databaseTables.products

    res.send(products)
})

app.get('/orders', async (req, res) => {
    const db = await dbAdapter.JSONFilePreset('db.json', {
        products: [], orders: []
    });
    
    const orders = db.data.orders;

    res.send(orders);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// --- NOWY ENDPOINT: SKŁADANIE ZAMÓWIENIA ---
app.post('/orders', async (req, res) => {
    // 1. Pobieramy dane z żądania (koszyk wysłany z frontendu)
    const cart = req.body; // To jest tablica produktów z frontend'u

    // 2. Ładujemy bazę danych
    const db = await dbAdapter.JSONFilePreset('db.json', {
        products: [], orders: []
    });

    // 3. WALIDACJA (Bezpieczeństwo)
    // Sprawdzamy, czy w bazie jest wystarczająco dużo towaru dla KAŻDEJ pozycji
    // Zanim cokolwiek zmienimy, musimy być pewni, że zamówienie jest możliwe
    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        
        if (!productInDb || productInDb.Qty < cartItem.count) {
            return res.status(400).json({ 
                error: `Brak towaru: ${cartItem.Name}. Dostępne tylko: ${productInDb ? productInDb.Qty : 0}` 
            });
        }
    }

    // 4. AKTUALIZACJA MAGAZYNU (Odejmowanie towaru)
    // Skoro walidacja przeszła, możemy bezpiecznie odjąć towar
    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        productInDb.Qty -= cartItem.count; // Zmniejszamy stan magazynowy
    }

    // 5. TWORZENIE ZAMÓWIENIA
    const newOrder = {
        id: crypto.randomUUID(), // Generujemy unikalny numer zamówienia
        date: new Date().toISOString(), // Data i czas teraz
        status: "new", // Status początkowy
        totalPrice: cart.reduce((sum, item) => sum + (Number(item.Price) * item.count), 0),
        products: cart // Zapisujemy "snapshot" koszyka (ceny i nazwy z momentu zakupu)
    };

    // Dodajemy zamówienie do listy
    db.data.orders.push(newOrder);

    // 6. ZAPIS DO PLIKU
    await db.write();

    // 7. Sukces! Odsyłamy potwierdzenie do frontendu
    res.json({ message: "Zamówienie przyjęte", orderId: newOrder.id });
});