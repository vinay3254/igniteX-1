// routes/cart.js — Cart management (MongoDB)
const router   = require('express').Router();
const CartItem = require('../models/CartItem');
const Product  = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

async function getCartWithDetails(userId) {
  const rows = await CartItem.find({ user_id: userId })
    .populate('product_id', 'brand name price old_price image_url stock tag')
    .sort({ updated_at: -1 });

  const subtotal  = rows.reduce((s, r) => s + r.product_id.price * r.quantity, 0);
  const itemCount = rows.reduce((s, r) => s + r.quantity, 0);

  return {
    items: rows.map(r => {
      const p = r.product_id;
      return {
        cartItemId: r._id,
        productId:  p._id,
        brand:      p.brand,
        name:       p.name,
        price:      p.price,
        oldPrice:   p.old_price || null,
        img:        p.image_url,
        stock:      p.stock,
        tag:        p.tag,
        quantity:   r.quantity,
        lineTotal:  +(p.price * r.quantity).toFixed(2),
      };
    }),
    summary: {
      itemCount,
      subtotal:  +subtotal.toFixed(2),
      shipping:  subtotal >= 50 ? 0 : 9.99,
      tax:       +(subtotal * 0.08).toFixed(2),
      total:     +(subtotal + (subtotal >= 50 ? 0 : 9.99) + subtotal * 0.08).toFixed(2),
    },
  };
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    res.json(await getCartWithDetails(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const qty     = Math.max(1, parseInt(quantity));
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = await CartItem.findOne({ user_id: req.user.id, product_id: productId });
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
      await existing.save();
    } else {
      await CartItem.create({ user_id: req.user.id, product_id: productId, quantity: Math.min(qty, product.stock) });
    }

    res.json(await getCartWithDetails(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cart/:cartItemId
router.put('/:cartItemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });

    const qty  = parseInt(quantity);
    const item = await CartItem.findOne({ _id: req.params.cartItemId, user_id: req.user.id })
      .populate('product_id', 'stock');
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (qty <= 0) {
      await item.deleteOne();
    } else {
      item.quantity = Math.min(qty, item.product_id.stock);
      await item.save();
    }

    res.json(await getCartWithDetails(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', async (req, res) => {
  try {
    const result = await CartItem.deleteOne({ _id: req.params.cartItemId, user_id: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json(await getCartWithDetails(req.user.id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart
router.delete('/', async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ message: 'Cart cleared', items: [], summary: { itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
