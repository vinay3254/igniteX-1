import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Spinner from '../components/Spinner'

function starsEl(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`s ${i < rating ? 'filled' : 'empty'}`}>★</span>
  ))
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const { token } = useAuth()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) loadProduct(id)
  }, [id])

  async function loadProduct(pid) {
    setLoading(true)
    try {
      const { data } = await api.get(`/products/${pid}`)
      setProduct(data.product)
      setRelated(data.related || [])
    } catch (err) {
      setError('Could not load product.')
    } finally { setLoading(false) }
  }

  async function handleAddToCart() {
    if (!product || product.stock === 0) return
    try {
      await addToCart(product.id, product.name)
      showToast(`Added "${product.name}" to cart`)
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleWishlist() {
    if (!token) { showToast('Please sign in to save items'); return }
    if (!product) return
    try {
      const liked = await toggleWishlist(product.id)
      showToast(liked ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {}
  }

  if (loading) return <div className="page-container"><Spinner /></div>
  if (error || !product) return <div className="page-container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-sec)' }}>{error || 'Product not found.'}</div>

  const liked = isWishlisted(product.id)
  const oldPrice = product.oldPrice ?? product.old_price
  const stockClass = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'no-stock'
  const stockText = product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'
  const reviews = product.reviews ?? product.review_count ?? 0

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/shop">Shop</Link><span>›</span>
        <span>{product.name}</span>
      </div>
      <div className="product-modal-card" style={{ maxWidth: '100%', width: '100%', boxShadow: 'none', padding: '0' }}>
        <div className="pm-gallery">
          <div className="pm-main-img">
            <img src={product.img || product.image_url} alt={product.name} />
          </div>
        </div>
        <div className="pm-info">
          <p className="pm-brand">{product.brand}</p>
          <h2 className="pm-name">{product.name}</h2>
          <div className="pm-price-row">
            <span className="pm-price">₹{product.price}</span>
            {oldPrice && <span className="pm-old-price">₹{oldPrice}</span>}
            {product.tag && <span className={`pm-tag tag-${product.tag}`}>{product.tag.toUpperCase()}</span>}
          </div>
          <div className="pm-stars">
            <div className="stars-row">{starsEl(product.rating)}</div>
            <span>{reviews.toLocaleString()} reviews</span>
          </div>
          {product.description && <p className="pm-desc">{product.description}</p>}
          <p className={`pm-stock ${stockClass}`}>{stockText}</p>
          <div className="pm-actions">
            <button className="btn-primary" onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className={`pm-wish-btn${liked ? ' liked' : ''}`} onClick={handleWishlist}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {related.length > 0 && (
            <div className="pm-related">
              <p className="pm-related-title">Related Products</p>
              <div className="pm-related-row">
                {related.map(r => (
                  <div key={r.id} className="pm-rel-card" onClick={() => navigate(`/product/${r.id}`)}>
                    <img src={r.img || r.image_url} alt={r.name} />
                    <p>{r.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
