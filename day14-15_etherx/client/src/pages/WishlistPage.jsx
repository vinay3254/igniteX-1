import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function WishlistPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!token) { navigate('/'); return }
    api.get('/wishlist')
      .then(r => setWishlist(r.data.wishlist))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="page-container"><Spinner /></div>

  if (wishlist.length === 0) {
    return (
      <div className="page-container page-enter">
        <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Wishlist</span></div>
        <div className="wishlist-empty">
          <h3>Your wishlist is empty</h3>
          <p>Save items you love by clicking the heart icon.</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>Explore Products</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Wishlist</span></div>
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="wishlist-grid">
        {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
