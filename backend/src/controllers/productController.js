import prisma from '../config/database.js';

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, description, price, stock, categoryId },
      include: { category: true },
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' });
  }
};

export { getProducts, createProduct };