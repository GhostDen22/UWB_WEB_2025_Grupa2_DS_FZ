const dbAdapter = require('lowdb/node')
const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto');
const bodyParser = require('body-parser')
const port = 5000

app.use(bodyParser.json());
app.use(cors());

// --- GET ---

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

// --- POST ---
app.post('/orders', async (req, res) => {
    const cart = req.body; 

    const db = await dbAdapter.JSONFilePreset('db.json', {
        products: [], orders: []
    });

    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        
        if (!productInDb || productInDb.Qty < cartItem.count) {
            return res.status(400).json({ 
                error: `Brak towaru: ${cartItem.Name}. Dostępne tylko: ${productInDb ? productInDb.Qty : 0}` 
            });
        }
    }

    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        productInDb.Qty -= cartItem.count; 
    }

    const newOrder = {
        id: crypto.randomUUID(), 
        date: new Date().toISOString(), 
        status: "new", 
        totalPrice: Number(cart.reduce((sum, item) => sum + (Number(item.Price) * item.count), 0).toFixed(2)),
        products: cart 
    };

    db.data.orders.push(newOrder);

    await db.write();

    res.json({ message: "Zamówienie przyjęte", orderId: newOrder.id });
});

// --- URUCHOMIENIE SERWERA ---
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})