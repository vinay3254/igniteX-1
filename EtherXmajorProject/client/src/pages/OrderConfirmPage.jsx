import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Spinner from '../components/Spinner'

export default function OrderConfirmPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) {
      api.get(`/orders/${id}`)
        .then(r => setOrder(r.data.order))
        .catch(() => setError('Order not found.'))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return <div className="page-container"><Spinner /></div>
  if (error || !order) return <div className="page-container"><h2>{error || 'Order not found.'}</h2></div>

  const payLabel = order.payment_method === 'card' ? '💳 Credit Card' : order.payment_method === 'apple_pay' ? ' Apple Pay' : '🅿️ PayPal'

  return (
    <div className="page-container page-enter">
      <div className="order-confirm-page">
        <h1>Order Confirmed!</h1>
        <p>
          Thank you, <strong>{order.shipping_name}</strong>! Your order has been placed successfully and will be shipped to <strong>{order.shipping_city}</strong>.
        </p>
        <div className="order-info-card">
          <div className="order-info-row"><span>Order #</span><strong>{order._id}</strong></div>
          <div className="order-info-row"><span>Status</span><strong><span className="order-status-badge status-confirmed">✓ Confirmed</span></strong></div>
          <div className="order-info-row"><span>Ship to</span><strong>{order.shipping_address}, {order.shipping_city} {order.shipping_zip}</strong></div>
          <div className="order-info-row"><span>Payment</span><strong>{payLabel}</strong></div>
          <div className="order-info-row"><span>Total</span><strong>₹{parseFloat(String(order.total_amount)).toFixed(2)}</strong></div>
        </div>
        {order.items && order.items.length > 0 && (
          <div className="order-info-card">
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Items Ordered</h4>
            {order.items.map((item, i) => (
              <div key={i} className="order-info-row">
                <span>{item.product_name} <span style={{ color: 'var(--text-sec)' }}>×{item.quantity}</span></span>
                <strong>₹{(item.line_total || item.product_price * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
          <button className="btn-secondary" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  )
}
