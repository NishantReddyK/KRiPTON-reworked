import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- In-memory portfolio ---
const portfolio = {
  cash: 10000,  // starting cash
  holdings: {}, // coinId: amount
};

// --- Helper function to parse float safely ---
const parseAmount = (value) => {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
};

// --- Crypto API via RapidAPI ---
app.get("/api/cryptos", async (req, res) => {
  const { limit = 50 } = req.query; // default limit
  try {
    const response = await fetch(
      `https://${process.env.CRYPTO_API_HOST}/coins?limit=${limit}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.CRYPTO_API_HOST,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/crypto/:coinId", async (req, res) => {
  const { coinId } = req.params;
  try {
    const response = await fetch(
      `https://${process.env.CRYPTO_API_HOST}/coin/${coinId}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.CRYPTO_API_HOST,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/crypto/:coinId/history", async (req, res) => {
  const { coinId } = req.params;
  const { timeperiod = "7d" } = req.query;
  try {
    const response = await fetch(
      `https://${process.env.CRYPTO_API_HOST}/coin/${coinId}/history?timeperiod=${timeperiod}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.CRYPTO_API_HOST,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NewsAPI.org ---
app.get("/api/news", async (req, res) => {
  const { q, count = 5 } = req.query;
  if (!q) return res.status(400).json({ error: "Missing 'q' query parameter" });

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=${count}&apiKey=${process.env.NEWSAPI_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Buy/Sell Crypto ---
app.post("/api/trade", (req, res) => {
  const { coinId, action, amount, price } = req.body;

  if (!coinId || !action || !amount || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const amt = parseAmount(amount);
  const coinPrice = parseAmount(price);

  if (amt <= 0 || coinPrice <= 0) {
    return res.status(400).json({ error: "Invalid amount or price" });
  }

  if (action === "buy") {
    const cost = amt * coinPrice;
    if (portfolio.cash < cost) {
      return res.status(400).json({ error: "Not enough cash" });
    }
    portfolio.cash -= cost;
    portfolio.holdings[coinId] = (portfolio.holdings[coinId] || 0) + amt;
  } else if (action === "sell") {
    const owned = portfolio.holdings[coinId] || 0;
    if (owned < amt) {
      return res.status(400).json({ error: "Not enough holdings" });
    }
    portfolio.holdings[coinId] -= amt;
    if (portfolio.holdings[coinId] === 0) delete portfolio.holdings[coinId];
    portfolio.cash += amt * coinPrice;
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  res.json({ portfolio });
});

// --- Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
