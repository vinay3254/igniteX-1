// routes/orders.js — Orders / Checkout (MongoDB + EmailJS)
const router   = require('express').Router();
const mongoose = require('mongoose');
const Order    = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product  = require('../models/Product');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: 'Invalid order ID' });
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders — checkout from cart
router.post('/', async (req, res) => {
  try {
    const { shippingName, shippingAddress, shippingCity, shippingZip, paymentMethod = 'card', notes } = req.body;
    if (!shippingName || !shippingAddress || !shippingCity || !shippingZip)
      return res.status(400).json({ error: 'Shipping details (name, address, city, zip) are required' });

    const cartItems = await CartItem.find({ user_id: req.user.id })
      .populate('product_id', 'name brand price stock');
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const outOfStock = cartItems.filter(i => i.quantity > i.product_id.stock);
    if (outOfStock.length > 0)
      return res.status(400).json({
        error: 'Some items are out of stock',
        items: outOfStock.map(i => ({ name: i.product_id.name, available: i.product_id.stock, requested: i.quantity })),
      });

    const subtotal = cartItems.reduce((s, i) => s + i.product_id.price * i.quantity, 0);
    const shipping  = subtotal >= 50 ? 0 : 9.99;
    const tax       = subtotal * 0.08;
    const total     = +(subtotal + shipping + tax).toFixed(2);

    const orderItems = cartItems.map(i => ({
      product_id:    i.product_id._id,
      product_name:  i.product_id.name,
      product_brand: i.product_id.brand,
      product_price: i.product_id.price,
      quantity:      i.quantity,
    }));

    // Attempt with MongoDB session (requires replica set); fall back to no-session if unsupported
    let order;
    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          [order] = await Order.create([{
            user_id: req.user.id, total_amount: total, status: 'confirmed',
            shipping_name: shippingName, shipping_address: shippingAddress,
            shipping_city: shippingCity, shipping_zip: shippingZip,
            payment_method: paymentMethod, notes: notes || null, items: orderItems,
          }], { session });

          for (const item of cartItems) {
            await Product.findByIdAndUpdate(item.product_id._id, { $inc: { stock: -item.quantity } }, { session });
          }
          await CartItem.deleteMany({ user_id: req.user.id }, { session });
        });
      } finally {
        await session.endSession();
      }
    } catch (txErr) {
      // Replica set not available — run without transaction
      if (txErr.code === 20 || txErr.message?.includes('Transaction')) {
        order = await Order.create({
          user_id: req.user.id, total_amount: total, status: 'confirmed',
          shipping_name: shippingName, shipping_address: shippingAddress,
          shipping_city: shippingCity, shipping_zip: shippingZip,
          payment_method: paymentMethod, notes: notes || null, items: orderItems,
        });
        for (const item of cartItems) {
          await Product.findByIdAndUpdate(item.product_id._id, { $inc: { stock: -item.quantity } });
        }
        await CartItem.deleteMany({ user_id: req.user.id });
      } else {
        throw txErr;
      }
    }

    // Send order confirmation email via EmailJS
    const sendEmail = req.app.locals.sendEmail;
    if (sendEmail && process.env.EMAILJS_TEMPLATE_ORDER_ID) {
      User.findById(req.user.id).then(user => {
        sendEmail({
          to_email:      user.email,
          to_name:       user.name,
          order_id:      order._id.toString(),
          order_total:   `$${total.toFixed(2)}`,
          shipping_name: shippingName,
          order_date:    new Date().toLocaleDateString(),
          item_count:    orderItems.length,
        }, process.env.EMAILJS_TEMPLATE_ORDER_ID)
        .catch(err => console.warn('EmailJS order email failed:', err.message));
      }).catch(() => {});
    }

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: 'Invalid order ID' });
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel an order with status: ${order.status}` });

    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
