import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import passport from 'passport';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Farmer System Backend' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});