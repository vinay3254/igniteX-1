import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

export default function CartDrawer({ isOpen, onClose, onOpenLogin }) {
  const { cartData, updateCart } = useCart()
  const { token } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const items = cartData?.items || []
  const summ = cartData?.summary || { itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }

  function handleCheckout() {
    onClose()
    if (!token) { onOpenLogin(); showToast('Please sign in to checkout'); return }
    navigate('/checkout')
  }

  function handleViewCart() {
    onClose()
    navigate('/cart')
  }

  return (
    <>
      <div className={`drawer-overlay${isOpen ? ' open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <h3>Your Cart</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">&times;</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".3"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>Your cart is empty</p>
              <span>Add some items to get started</span>
            </div>
          ) : (
            <div>
              {items.map(item => (
                <div className="cart-item" key={item.cartItemId}>
                  <div className="ci-img"><img src={item.img} alt={item.name} /></div>
                  <div className="ci-info">
                    <p className="ci-brand">{item.brand}</p>
                    <p className="ci-name">{item.name}</p>
                    <div className="ci-controls">
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateCart(item.cartItemId, item.quantity - 1)}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCart(item.cartItemId, item.quantity + 1)}>+</button>
                      </div>
                      <span className="ci-price">₹{item.lineTotal.toFixed(2)}</span>
                    </div>
                    <button className="ci-remove" onClick={() => updateCart(item.cartItemId, 0)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-totals">
              <div className="ct-row"><span>Subtotal</span><span>₹{summ.subtotal.toFixed(2)}</span></div>
              <div className="ct-row"><span>Shipping</span><span>{summ.shipping === 0 ? 'Free' : `₹${summ.shipping.toFixed(2)}`}</span></div>
              <div className="ct-row ct-tax"><span>Tax (8%)</span><span>₹{summ.tax.toFixed(2)}</span></div>
              <div className="ct-row ct-total"><span>Total</span><span>₹{summ.total.toFixed(2)}</span></div>
            </div>
            <button className="btn-primary w-full" onClick={handleCheckout}>Proceed to Checkout →</button>
            <button className="btn-secondary w-full" onClick={handleViewCart} style={{ marginTop: 8 }}>View Full Cart</button>
            <p className="cart-note">Secure checkout · Free returns</p>
          </div>
        )}
      </aside>
    </>
  )
}
