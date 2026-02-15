// server.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
====================================
DATA EN MEMOIRE (DEMO SANS BDD)
====================================
*/

const products = [
  { id: 1, name: "Burger", price: 8, category: "food", stock: 25 },
  { id: 2, name: "Pizza", price: 10, category: "restaurant", stock: 12 },
  { id: 3, name: "Marteau", price: 15, category: "outils", stock: 7 },
  { id: 4, name: "Tacos", price: 9, category: "food", stock: 0 }
];

const stores = [
  { id: 1, name: "Food Express", city: "Paris", address: "10 rue Rivoli" },
  { id: 2, name: "Pizza City", city: "Paris", address: "25 avenue Italie" },
  { id: 3, name: "Outils Pro", city: "Lyon", address: "12 rue République" },
  { id: 4, name: "Burger House", city: "Marseille", address: "5 vieux port" }
];

/*
====================================
ROUTES API
====================================
*/

/**
 * GET /api/products
 * Retourne les produits disponibles en stock (>0)
 * Filtre optionnel par catégorie ?category=food
 */
app.get("/api/products", (req, res) => {
  const { category } = req.query;

  let availableProducts = products.filter(p => p.stock > 0);

  if (category) {
    availableProducts = availableProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.status(200).json({
    success: true,
    count: availableProducts.length,
    data: availableProducts
  });
});

/**
 * GET /api/stores
 * Retourne les magasins proches par ville
 * Exemple: /api/stores?city=Paris
 */
app.get("/api/stores", (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({
      success: false,
      message: "Le paramètre city est obligatoire"
    });
  }

  const nearbyStores = stores.filter(
    s => s.city.toLowerCase() === city.toLowerCase()
  );

  res.status(200).json({
    success: true,
    count: nearbyStores.length,
    data: nearbyStores
  });
});

/*
====================================
HEALTH CHECK (Azure)
====================================
*/
app.get("/", (req, res) => {
  res.status(200).json({
    status: "API Livraison running",
    environment: process.env.NODE_ENV || "development"
  });
});

/*
====================================
START SERVER (Azure compatible)
====================================
*/
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
