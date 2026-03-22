// routes/wishlist.js — Wishlist (MongoDB)
const router       = require('express').Router();
const WishlistItem = require('../models/WishlistItem');
const Product      = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const items = await WishlistItem.find({ user_id: req.user.id })
      .populate('product_id', 'brand name price old_price image_url tag rating review_count stock')
      .sort({ created_at: -1 });

    res.json({
      wishlist: items.map(r => {
        const p = r.product_id;
        return {
          wishlistItemId: r._id,
          savedAt:        r.created_at,
          id:             p._id,
          brand:          p.brand,
          name:           p.name,
          price:          p.price,
          oldPrice:       p.old_price || null,
          img:            p.image_url,
          tag:            p.tag,
          rating:         p.rating,
          reviews:        p.review_count,
          stock:          p.stock,
        };
      }),
      count: items.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wishlist/:productId — toggle
router.post('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await WishlistItem.findOne({ user_id: req.user.id, product_id: productId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ action: 'removed', productId, message: 'Removed from wishlist' });
    }

    await WishlistItem.create({ user_id: req.user.id, product_id: productId });
    res.status(201).json({ action: 'added', productId, message: 'Added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res) => {
  try {
    const result = await WishlistItem.deleteOne({ user_id: req.user.id, product_id: req.params.productId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Item not in wishlist' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
