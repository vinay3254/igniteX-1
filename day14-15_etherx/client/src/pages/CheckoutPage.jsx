import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Spinner from '../components/Spinner'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { refreshCart } = useCart()

  const [cartData, setCartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState('card')

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [notes, setNotes] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!token) { navigate('/cart'); return }
    api.get('/cart').then(r => {
      if (r.data.items.length === 0) { navigate('/cart'); return }
      setCartData(r.data)
      setName(user?.name || '')
    }).catch(() => navigate('/cart')).finally(() => setLoading(false))
  }, [token])

  async function handlePlaceOrder() {
    if (!name || !address || !city || !zip) { setError('Please fill in all required shipping fields.'); return }
    setError(''); setPlacing(true)
    try {
      const { data } = await api.post('/orders', {
        shippingName: name, shippingAddress: address, shippingCity: city,
        shippingZip: zip, paymentMethod: selectedPayment, notes,
      })
      await refreshCart()
      navigate(`/order-confirm/${data.order._id}`)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      setPlacing(false)
    }
  }

  function formatCard(val) {
    const v = val.replace(/\D/g, '').substring(0, 16)
    setCardNumber(v.replace(/(.{4})/g, '$1 ').trim())
  }

  if (loading) return <div className="page-container"><Spinner /></div>
  if (!cartData) return null

  const items = cartData.items
  const summ = cartData.summary

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/cart">Cart</Link><span>›</span><span>Checkout</span>
      </div>
      <div className="page-header"><h1>Checkout</h1></div>
      <div className="checkout-layout">
        <div>
          <div className="checkout-card">
            <h3>Shipping Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" placeholder="Jane Appleseed" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" defaultValue={user?.email || ''} />
              </div>
            </div>
            <div className="form-group">
              <label>Street Address *</label>
              <input type="text" placeholder="1 Apple Park Way" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input type="text" placeholder="Cupertino" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>ZIP / Postal Code *</label>
                <input type="text" placeholder="95014" value={zip} onChange={e => setZip(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Order Notes (optional)</label>
              <textarea placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="checkout-card" style={{ marginTop: 20 }}>
            <h3>Payment Method</h3>
            <div className="checkout-payment-methods">
              {[{ method: 'card', icon: '💳', label: 'Credit Card' }, { method: 'apple_pay', icon: '', label: 'Apple Pay' }, { method: 'paypal', icon: '🅿️', label: 'PayPal' }].map(pm => (
                <div
                  key={pm.method}
                  className={`payment-method${selectedPayment === pm.method ? ' selected' : ''}`}
                  onClick={() => setSelectedPayment(pm.method)}
                >
                  <span className="payment-method-icon">{pm.icon}</span>{pm.label}
                </div>
              ))}
            </div>
            {selectedPayment === 'card' && (
              <div id="card-fields">
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" maxLength={19} value={cardNumber} onChange={e => formatCard(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Expiry</label><input type="text" placeholder="MM/YY" maxLength={5} /></div>
                  <div className="form-group"><label>CVV</label><input type="text" placeholder="123" maxLength={4} /></div>
                </div>
              </div>
            )}
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 14, marginTop: 12 }}>{error}</p>}
          <button
            className="btn-primary w-full"
            style={{ marginTop: 16, padding: 16 }}
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? 'Placing order…' : `Place Order — ₹${summ.total.toFixed(2)}`}
          </button>
        </div>
        <div className="checkout-order-summary">
          <h3>Your Order</h3>
          {items.map(item => (
            <div key={item.cartItemId} className="cos-item">
              <div className="cos-item-img"><img src={item.img} alt={item.name} /></div>
              <div className="cos-item-name">{item.name} <span style={{ color: 'var(--text-sec)' }}>×{item.quantity}</span></div>
              <div className="cos-item-price">₹{item.lineTotal.toFixed(2)}</div>
            </div>
          ))}
          <div className="cart-totals" style={{ marginTop: 16 }}>
            <div className="ct-row"><span>Subtotal</span><span>₹{summ.subtotal.toFixed(2)}</span></div>
            <div className="ct-row"><span>Shipping</span><span>{summ.shipping === 0 ? 'Free' : `₹${summ.shipping.toFixed(2)}`}</span></div>
            <div className="ct-row ct-tax"><span>Tax (8%)</span><span>₹{summ.tax.toFixed(2)}</span></div>
            <div className="ct-row ct-total"><span>Total</span><span>₹{summ.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
