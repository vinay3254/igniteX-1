import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cartData, updateCart } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const items = cartData?.items || []
  const summ = cartData?.summary || { itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }
  const ship = summ.shipping === 0 ? 'Free' : `₹${summ.shipping.toFixed(2)}`

  if (items.length === 0) {
    return (
      <div className="page-container page-enter">
        <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Cart</span></div>
        <div className="cart-page-empty">
          <h3>Your cart is empty</h3>
          <p>Looks like you haven&apos;t added anything yet.</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Cart</span></div>
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{summ.itemCount} item{summ.itemCount !== 1 ? 's' : ''}</p>
      </div>
      <div className="cart-page-layout">
        <div>
          <div className="cart-page-items">
            {items.map(item => (
              <div key={item.cartItemId} className="cart-page-item">
                <div className="cpi-img"><img src={item.img} alt={item.name} /></div>
                <div className="cpi-info">
                  <p className="cpi-brand">{item.brand}</p>
                  <p className="cpi-name">{item.name}</p>
                  <div className="cpi-controls">
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateCart(item.cartItemId, item.quantity - 1)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateCart(item.cartItemId, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cpi-remove-btn" onClick={() => updateCart(item.cartItemId, 0)}>Remove</button>
                </div>
                <div className="cpi-price-col">
                  <p className="cpi-line-total">₹{item.lineTotal.toFixed(2)}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cart-summary-box">
          <h3>Order Summary</h3>
          <div className="cart-totals">
            <div className="ct-row"><span>Subtotal</span><span>₹{summ.subtotal.toFixed(2)}</span></div>
            <div className="ct-row"><span>Shipping</span><span>{ship}</span></div>
            <div className="ct-row ct-tax"><span>Tax (8%)</span><span>₹{summ.tax.toFixed(2)}</span></div>
            <div className="ct-row ct-total"><span>Total</span><span>₹{summ.total.toFixed(2)}</span></div>
          </div>
          <button
            className="btn-primary w-full"
            style={{ marginTop: 20 }}
            onClick={() => { if (!token) { navigate('/'); return } navigate('/checkout') }}
          >Proceed to Checkout →</button>
          <button className="btn-secondary w-full" onClick={() => navigate('/shop')} style={{ marginTop: 10 }}>Continue Shopping</button>
          <p className="cart-note" style={{ marginTop: 14 }}>Secure checkout · Free returns</p>
        </div>
      </div>
    </div>
  )
}
