// routes/products.js — Full product listing with filters (MongoDB)
const router   = require('express').Router();
const Product  = require('../models/Product');
const Category = require('../models/Category');

function format(p) {
  return {
    id:           p._id,
    brand:        p.brand,
    name:         p.name,
    description:  p.description,
    price:        p.price,
    oldPrice:     p.old_price || null,
    rating:       p.rating,
    reviews:      p.review_count,
    tag:          p.tag,
    category:     p.category_slug,
    stock:        p.stock,
    img:          p.image_url,
    isFeatured:   p.is_featured,
    isNewArrival: p.is_new_arrival,
    createdAt:    p.created_at,
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { type, category, tag, search, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type === 'featured')    filter.is_featured    = true;
    if (type === 'new_arrival') filter.is_new_arrival = true;
    if (category)               filter.category_slug  = category;
    if (tag)                    filter.tag             = tag;
    if (search)                 filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];

    let sortObj = { is_featured: -1, is_new_arrival: -1, _id: 1 };
    switch (sort) {
      case 'price_asc':  sortObj = { price: 1 };  break;
      case 'price_desc': sortObj = { price: -1 }; break;
      case 'rating':     sortObj = { rating: -1, review_count: -1 }; break;
      case 'newest':     sortObj = { created_at: -1 }; break;
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    ]);

    res.json({
      products: products.map(format),
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const related = await Product.find({ category_slug: product.category_slug, _id: { $ne: product._id } }).limit(4);
    res.json({ product: format(product), related: related.map(format) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
