import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`s ${i < rating ? 'filled' : 'empty'}`}>★</span>
  ))
}

export default function ProductCard({ product: p, onOpenLogin }) {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [addBtnGreen, setAddBtnGreen] = React.useState(false)
  const liked = isWishlisted(p.id)
  const img = p.img || p.image_url || ''
  const oldPrice = p.oldPrice ?? p.old_price
  const reviews = p.reviews ?? p.review_count ?? 0

  async function handleAddToCart(e) {
    e.stopPropagation()
    try {
      await addToCart(p.id, p.name)
      showToast(`Added "${p.name}" to cart`)
      setAddBtnGreen(true)
      setTimeout(() => setAddBtnGreen(false), 900)
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleWishlist(e) {
    e.stopPropagation()
    if (!token) {
      onOpenLogin?.()
      showToast('Please sign in to save items')
      return
    }
    try {
      const liked = await toggleWishlist(p.id)
      showToast(liked ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {}
  }

  function handleCardClick(_e) {
    navigate(`/product/${p.id}`)
  }

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="p-img-wrap">
        <img src={img} alt={p.name} loading="lazy" />
        {p.tag && <span className={`p-tag tag-${p.tag}`}>{p.tag.toUpperCase()}</span>}
        <button className={`wish-btn${liked ? ' liked' : ''}`} onClick={handleWishlist} title="Wishlist">
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path className="heart-path" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="p-body">
        <p className="p-brand">{p.brand}</p>
        <h4 className="p-name">{p.name}</h4>
        <div className="p-stars">
          <div className="stars-row">{starsHTML(p.rating)}</div>
          <span className="p-rev">({reviews.toLocaleString()})</span>
        </div>
        <div className="p-foot">
          <div className="p-price">
            {oldPrice && <span className="p-old">₹{oldPrice}</span>}
            ₹{p.price}
          </div>
          <button
            className="add-btn"
            onClick={handleAddToCart}
            title="Add to cart"
            style={addBtnGreen ? { background: '#34C759' } : {}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
