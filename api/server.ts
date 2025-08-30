// Setup for Prisma client and Express API
import * as express from 'express';
import cron from 'node-cron';
// Schedule: Update all stock prices every 1 minute
cron.schedule('* * * * *', async () => {
  try {
    const stocks = await prisma.stock.findMany();
    await Promise.all(stocks.map(async (stock) => {
      try {
        const price = await fetchYahooPrice(stock.symbol);
        console.log(`[CRON DEBUG] Yahoo price for ${stock.symbol}:`, price);
        if (price && price !== stock.currentPrice) {
          await prisma.stock.update({ where: { id: stock.id }, data: { currentPrice: price } });
        }
      } catch (e) {
        console.error(`[CRON ERROR] Failed to fetch price for ${stock.symbol}:`, e);
      }
    }));
    console.log(`[CRON] Updated stock prices at ${new Date().toISOString()}`);
  } catch (e) {
    console.error('[CRON] Failed to update stock prices', e);
  }
});
import { PrismaClient } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Get all stocks
// Get all stocks, updating their prices from Yahoo Finance in real-time
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({ include: { alerts: true } });
    // Fetch and update prices in parallel
    const updatedStocks = await Promise.all(stocks.map(async (stock) => {
      try {
        const price = await fetchYahooPrice(stock.symbol);
        console.log(`[DEBUG] Yahoo price for ${stock.symbol}:`, price);
        if (price && price !== stock.currentPrice) {
          await prisma.stock.update({ where: { id: stock.id }, data: { currentPrice: price } });
          return { ...stock, currentPrice: price };
        }
        return { ...stock, currentPrice: price ?? stock.currentPrice };
      } catch (err) {
        console.error(`[ERROR] Failed to fetch price for ${stock.symbol}:`, err);
        return stock; // fallback to old price if Yahoo fails
      }
    }));
    // Always return the latest from DB after update
    const latestStocks = await prisma.stock.findMany({ include: { alerts: true } });
    res.json(latestStocks);
  } catch (err) {
    console.error('[ERROR] /api/stocks failed:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : err });
  }
});

// Add a new stock
app.post('/api/stocks', async (req, res) => {
  const { symbol, name, shares, purchasePrice, currentPrice, purchaseDate } = req.body;
  if (!symbol || !name || !shares || !purchasePrice || !currentPrice || !purchaseDate) {
    return res.status(400).json({ error: 'Missing required stock fields.' });
  }
  try {
    const stock = await prisma.stock.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
        shares: Number(shares),
        purchasePrice: Number(purchasePrice),
        currentPrice: Number(currentPrice),
        purchaseDate: new Date(purchaseDate)
      }
    });
    res.json(stock);
  } catch (e) {
    res.status(400).json({ error: 'Could not create stock.', details: e instanceof Error ? e.message : e });
  }
});

// Update stock price from Yahoo
app.post('/api/stocks/:symbol/update', async (req, res) => {
  const { symbol } = req.params;
  try {
    const price = await fetchYahooPrice(symbol);
    if (price === null) {
      return res.status(400).json({ error: 'Could not fetch price from Yahoo.' });
    }
    const stock = await prisma.stock.update({
      where: { symbol },
      data: { currentPrice: price }
    });
    res.json(stock);
  } catch (e) {
    res.status(400).json({ error: 'Could not update price.' });
  }
});

// Get all alerts for a stock
app.get('/api/stocks/:symbol/alerts', async (req, res) => {
  const { symbol } = req.params;
  const stock = await prisma.stock.findUnique({ where: { symbol }, include: { alerts: true } });
  if (!stock) return res.status(404).json({ error: 'Stock not found' });
  res.json(stock.alerts);
});

// Add a price alert
app.post('/api/stocks/:symbol/alerts', async (req, res) => {
  const { symbol } = req.params;
  const { type, threshold } = req.body;
  const stock = await prisma.stock.findUnique({ where: { symbol } });
  if (!stock) return res.status(404).json({ error: 'Stock not found' });
  const alert = await prisma.priceAlert.create({
    data: {
      stockId: stock.id,
      type,
      threshold: parseFloat(threshold),
    }
  });
  res.json(alert);
});

// Helper: Fetch price from Yahoo Finance using yahoo-finance2
async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote?.regularMarketPrice;
    if (price !== undefined) {
      console.log(`[DEBUG] Yahoo price for ${symbol}: ${price}`);
      return price;
    } else {
      console.error(`[ERROR] No price found for ${symbol}`);
      return null;
    }
  } catch (error) {
    console.error(`[YAHOO ERROR] Failed to fetch price for ${symbol}:`, error);
    return null;
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
