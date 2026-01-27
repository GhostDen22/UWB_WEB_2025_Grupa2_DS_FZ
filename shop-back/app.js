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
    
    let products = db.data.products;
    
    const { name, price_sort, _page, _limit } = req.query; 

    if (name) {
        products = products.filter(p => 
            p.Name.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (price_sort) {
        if (price_sort === 'asc') {
            products.sort((a, b) => a.Price - b.Price);
        } else if (price_sort === 'desc') {
            products.sort((a, b) => b.Price - a.Price);
        }
    }

    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = products.length;

    const paginatedProducts = products.slice(startIndex, endIndex);

    res.set('X-Total-Count', totalCount);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');

    res.send(paginatedProducts);
});

app.get('/orders', async (req, res) => {
    const db = await dbAdapter.JSONFilePreset('db.json', {
        products: [], orders: []
    });
    
    let orders = [...db.data.orders];
    
    const { date_sort, _page, _limit } = req.query;

    if (date_sort) {
        if (date_sort === 'asc') {
            orders.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (date_sort === 'desc') {
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = orders.length;

    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.set('X-Total-Count', totalCount);
    res.set('Access-Control-Expose-Headers', 'X-Total-Count');

    res.send(paginatedOrders);
});

app.get('/products/:id', async (req, res) => {
    const db = await dbAdapter.JSONFilePreset('db.json', { products: [], orders: [] });
    const id = parseInt(req.params.id);
    
    const product = db.data.products.find(p => p.Id === id);

    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ error: "Produkt nie znaleziony" });
    }
});

// --- POST ---
app.post('/orders', async (req, res) => {
    const cart = req.body; 
    const db = await dbAdapter.JSONFilePreset('db.json', { products: [], orders: [] });

    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        if (!productInDb || productInDb.Qty < cartItem.count) {
            return res.status(400).json({ error: `Brak towaru: ${cartItem.Name}` });
        }
    }

    for (const cartItem of cart) {
        const productInDb = db.data.products.find(p => p.Id === cartItem.Id);
        productInDb.Qty -= cartItem.count; 
    }

    const orderedProducts = cart.map(item => ({
        Id: item.Id,
        Name: item.Name,
        Description: item.Description,
        Image: item.Image,
        Price: item.Price,
        Qty: item.count 
    }));

    const newOrder = {
        id: crypto.randomUUID(), 
        date: new Date().toISOString(), 
        status: "new", 
        totalPrice: Number(cart.reduce((sum, item) => sum + (Number(item.Price) * item.count), 0).toFixed(2)),
        products: orderedProducts
    };

    db.data.orders.push(newOrder);
    await db.write();

    res.json({ message: "Zamówienie przyjęte", orderId: newOrder.id });
});

// --- URUCHOMIENIE SERWERA ---
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})