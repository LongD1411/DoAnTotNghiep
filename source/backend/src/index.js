import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes   from './routes/categories.js';
import uploadRoutes     from './routes/upload.js';
import userRoutes       from './routes/users.js';
import pestEntryRoutes  from './routes/pestEntries.js';
import reviewRoutes     from './routes/reviews.js';
import postRoutes       from './routes/posts.js';
import commentRoutes    from './routes/comments.js';
import cartRoutes       from './routes/carts.js';
import forumCategoryRoutes from './routes/forumCategories.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  maxAge: 86400, // cache preflight (OPTIONS) 24h → giảm số lần OPTIONS lặp lại
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/upload',       uploadRoutes);
app.use('/users',        userRoutes);
app.use('/pest-entries', pestEntryRoutes);
app.use('/reviews',      reviewRoutes);
app.use('/posts',        postRoutes);
app.use('/comments',     commentRoutes);
app.use('/cart',         cartRoutes);
app.use('/forum-categories', forumCategoryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Farmer System Backend' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
