import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Spinner from '../components/Spinner'

export default function OrdersPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [openOrderId, setOpenOrderId] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!token) { navigate('/'); return }
    loadOrders()
  }, [token])

  async function loadOrders() {
    try {
      const { data } = await api.get('/orders')
      setOrders(data.orders)
    } catch {} finally { setLoading(false) }
  }

  async function cancelOrder(id) {
    if (!confirm('Cancel this order?')) return
    try {
      await api.put(`/orders/${id}/cancel`)
      showToast('Order cancelled')
      loadOrders()
    } catch (err) { showToast(`⚠️ ${err.response?.data?.error || err.message}`) }
  }

  if (loading) return <div className="page-container"><Spinner /></div>

  if (orders.length === 0) {
    return (
      <div className="page-container page-enter">
        <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Orders</span></div>
        <div className="orders-empty">
          <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here.</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>My Orders</span></div>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="orders-list">
        {orders.map(o => (
          <div key={o._id} className="order-card">
            <div className="order-card-header" onClick={() => setOpenOrderId(openOrderId === o._id ? null : o._id)}>
              <div className="order-card-meta">
                <span className="order-id">Order #{o._id}</span>
                <span className="order-date">{new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className={`order-status-badge status-${o.status}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
              </div>
              <span className="order-total">₹{parseFloat(String(o.total_amount)).toFixed(2)}</span>
            </div>
            <div className={`order-card-items${openOrderId === o.id ? ' open' : ''}`}>
              {o.items.map((item, i) => (
                <div key={i} className="order-card-item">
                  <div style={{ flex: 1 }}><span className="oci-name">{item.product_name}</span></div>
                  <span className="oci-qty">×{item.quantity}</span>
                  <span className="oci-price">₹{(item.line_total || item.product_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-card-footer">
                <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>Shipped to: {o.shipping_city}, {o.shipping_zip}</span>
                {['pending', 'confirmed'].includes(o.status) && (
                  <button className="cancel-order-btn" onClick={e => { e.stopPropagation(); cancelOrder(o._id) }}>Cancel Order</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
