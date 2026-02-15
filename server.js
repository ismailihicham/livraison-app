const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/*
====================================
DATA EN MEMOIRE (PAS DE BDD)
====================================
*/

const products = [
  { id: 1, name: "Burger", price: 8, category: "food", stock: 20 },
  { id: 2, name: "Pizza", price: 10, category: "restaurant", stock: 15 },
  { id: 3, name: "Marteau", price: 15, category: "outils", stock: 5 },
  { id: 4, name: "Tacos", price: 9, category: "food", stock: 0 }
];

const stores = [
  { id: 1, name: "Food Express", city: "Paris", address: "10 rue Rivoli" },
  { id: 2, name: "Pizza City", city: "Paris", address: "25 avenue Italie" },
  { id: 3, name: "Outils Pro", city: "Lyon", address: "12 rue République" },
  { id: 4, name: "Burger House", city: "Marseille", address: "5 vieux port" }
];

// Stockage des commandes en mémoire
let orders = [];
let orderIdCounter = 1;

/*
====================================
ROUTES API
====================================
*/

// GET produits disponibles
app.get("/api/products", (req, res) => {
  const { category } = req.query;
  let availableProducts = products.filter(p => p.stock > 0);
  if (category) {
    availableProducts = availableProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  res.status(200).json({ success: true, count: availableProducts.length, data: availableProducts });
});

// GET magasins proches
app.get("/api/stores", (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ success: false, message: "Le paramètre 'city' est obligatoire" });
  }
  const nearbyStores = stores.filter(s => s.city.toLowerCase() === city.toLowerCase());
  res.status(200).json({ success: true, count: nearbyStores.length, data: nearbyStores });
});

/**
 * POST /api/orders
 * Crée une commande depuis le panier
 * Body:
 * {
 *   "items": [
 *     { "id": 1, "quantity": 2 },
 *     { "id": 2, "quantity": 1 }
 *   ]
 * }
 */
app.post("/api/orders", (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Panier vide" });
  }

  // Vérifier la disponibilité
  const unavailable = [];
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      unavailable.push(`Produit ID ${item.id} introuvable`);
      continue;
    }
    if (product.stock < item.quantity) {
      unavailable.push(`${product.name} stock insuffisant`);
      continue;
    }
    // Décrémenter le stock
    product.stock -= item.quantity;

    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      total: product.price * item.quantity
    });
  }

  if (unavailable.length > 0) {
    return res.status(400).json({ success: false, message: "Certains produits indisponibles", errors: unavailable });
  }

  const newOrder = {
    id: orderIdCounter++,
    items: orderItems,
    totalAmount: orderItems.reduce((sum, i) => sum + i.total, 0),
    status: "En attente",
    createdAt: new Date()
  };

  orders.push(newOrder);

  res.status(201).json({ success: true, data: newOrder });
});

/*
====================================
HEALTH CHECK
====================================
*/
app.get("/", (req, res) => {
  res.status(200).json({ status: "API Livraison running" });
});

/*
====================================
START SERVER
====================================
*/
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
