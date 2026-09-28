import express from 'express';
import cors from 'cors';
import snailpayRoutes from './routes/snailpay.routes';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/snailpay', snailpayRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`🐌 SnailPay backend running at http://localhost:${PORT}`);
});

export default app;
