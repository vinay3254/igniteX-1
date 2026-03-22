import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

function getLocalCart() {
  try { return JSON.parse(localStorage.getItem('etherx_cart') || '[]') } catch { return [] }
}

function saveLocalCart(cart) {
  localStorage.setItem('etherx_cart', JSON.stringify(cart))
}

function buildLocalCartDisplay(localCart) {
  const sub = localCart.reduce((s, i) => s + (i.price || 0) * i.qty, 0)
  return {
    items: localCart.map(i => ({
      cartItemId: i.id, productId: i.id, brand: i.brand || 'EtherX', name: i.name,
      price: i.price || 0, oldPrice: null, img: i.img || '', stock: 99, tag: null,
      quantity: i.qty, lineTotal: (i.price || 0) * i.qty,
    })),
    summary: {
      itemCount: localCart.reduce((s, i) => s + i.qty, 0), subtotal: sub,
      shipping: sub >= 50 ? 0 : 9.99, tax: sub * 0.08,
      total: sub + (sub >= 50 ? 0 : 9.99) + sub * 0.08,
    }
  }
}

export function CartProvider({ children }) {
  const { token } = useAuth()
  const [cartData, setCartData] = useState(null)
  const [wishlistIds, setWishlistIds] = useState(new Set())

  const refreshCart = useCallback(async () => {
    if (token) {
      try {
        const { data } = await api.get('/cart')
        setCartData(data)
      } catch {
        setCartData(buildLocalCartDisplay(getLocalCart()))
      }
    } else {
      setCartData(buildLocalCartDisplay(getLocalCart()))
    }
  }, [token])

  useEffect(() => { refreshCart() }, [token, refreshCart])

  const addToCart = useCallback(async (productId, productName) => {
    if (token) {
      const { data } = await api.post('/cart', { productId, quantity: 1 })
      setCartData(data)
    } else {
      const lc = getLocalCart()
      const ex = lc.find(i => i.id === productId)
      if (ex) ex.qty += 1
      else lc.push({ id: productId, name: productName, qty: 1 })
      saveLocalCart(lc)
      setCartData(buildLocalCartDisplay(lc))
    }
  }, [token])

  const updateCart = useCallback(async (cartItemId, qty) => {
    if (token) {
      const { data } = qty <= 0
        ? await api.delete(`/cart/${cartItemId}`)
        : await api.put(`/cart/${cartItemId}`, { quantity: qty })
      setCartData(data)
    } else {
      let lc = getLocalCart()
      if (qty <= 0) lc = lc.filter(i => i.id !== cartItemId)
      else { const item = lc.find(i => i.id === cartItemId); if (item) item.qty = qty }
      saveLocalCart(lc)
      setCartData(buildLocalCartDisplay(lc))
    }
  }, [token])

  const clearCart = useCallback(() => {
    saveLocalCart([])
    setCartData(buildLocalCartDisplay([]))
  }, [])

  const loadWishlist = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await api.get('/wishlist')
      setWishlistIds(new Set(data.wishlist.map((i) => i.id)))
    } catch {}
  }, [token])

  useEffect(() => { loadWishlist() }, [loadWishlist])

  const toggleWishlist = useCallback(async (productId) => {
    if (!token) throw new Error('not_authed')
    const { data } = await api.post(`/wishlist/${productId}`)
    const liked = data.action === 'added'
    setWishlistIds(prev => {
      const next = new Set(prev)
      liked ? next.add(productId) : next.delete(productId)
      return next
    })
    return liked
  }, [token])

  const isWishlisted = useCallback((productId) => wishlistIds.has(productId), [wishlistIds])

  return (
    <CartContext.Provider value={{ cartData, wishlistIds, refreshCart, addToCart, updateCart, clearCart, loadWishlist, toggleWishlist, isWishlisted }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
