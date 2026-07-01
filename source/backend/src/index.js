import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes   from './routes/categories.js';
import uploadRoutes     from './routes/upload.js';
import userRoutes       from './routes/users.js';
import pestEntryRoutes  from './routes/pestEntries.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/upload',       uploadRoutes);
app.use('/users',        userRoutes);
app.use('/pest-entries', pestEntryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Farmer System Backend' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
