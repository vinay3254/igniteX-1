import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../hooks/useToast'
import AuthModal from './AuthModal'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { cartData } = useCart()
  const { showToast } = useToast()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const cartCount = cartData?.summary?.itemCount || 0

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  function doSearch() {
    const q = searchQuery.trim()
    if (!q) return
    navigate(`/shop?search=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  function openLogin() { setAuthModalTab('login'); setAuthModalOpen(true) }

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : ''

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" className="brand-icon" alt="EtherX" />
            <span>EtherX</span>
          </Link>
          <nav className="navbar-nav">
            <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
            <Link to="/shop" className={`nav-link${isActive('/shop') ? ' active' : ''}`}>Shop</Link>
            <Link to="/shop?tag=new" className="nav-link">New Arrivals</Link>
            <Link to="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>About</Link>
            <Link to="/support" className={`nav-link${isActive('/support') ? ' active' : ''}`}>Support</Link>
          </nav>
          <div className="navbar-actions">
            {/* Search */}
            <div className="search-wrap" id="search-wrap">
              <button
                className="icon-btn"
                title="Search"
                onClick={() => { setSearchOpen(o => !o); setTimeout(() => searchInputRef.current?.focus(), 50) }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <div className={`search-bar${searchOpen ? ' open' : ''}`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  id="search-input"
                  placeholder="Search products…"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
                />
                <button className="search-submit" onClick={doSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
              </div>
            </div>
            {/* Cart */}
            <button className="icon-btn" title="Cart" onClick={() => setCartDrawerOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className={`cart-badge${cartCount > 0 ? ' show' : ''}`}>{cartCount}</span>
            </button>
            {/* Auth */}
            <div className="auth-area">
              {user ? (
                <div className="user-dropdown-wrap" ref={dropdownRef}>
                  <div className="user-chip" onClick={e => { e.stopPropagation(); setDropdownOpen(o => !o) }}>
                    <div className="user-avatar">{initials}</div>
                    <span>{user.name.split(' ')[0]}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <div className={`user-dropdown${dropdownOpen ? ' open' : ''}`}>
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </Link>
                    <Link to="/orders" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      Wishlist
                    </Link>
                    <div className="user-dropdown-sep"></div>
                    <div className="user-dropdown-item danger" onClick={() => {
                      logout()
                      setDropdownOpen(false)
                      showToast('👋 Signed out')
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </div>
                  </div>
                </div>
              ) : (
                <button className="btn-primary btn-sm" onClick={openLogin}>Sign In</button>
              )}
            </div>
            <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <Link to="/" className={`mobile-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
        <Link to="/shop" className={`mobile-link${isActive('/shop') ? ' active' : ''}`}>Shop</Link>
        <Link to="/shop?tag=new" className="mobile-link">New Arrivals</Link>
        <Link to="/about" className={`mobile-link${isActive('/about') ? ' active' : ''}`}>About</Link>
        <Link to="/support" className={`mobile-link${isActive('/support') ? ' active' : ''}`}>Support</Link>
      </div>

      {authModalOpen && (
        <AuthModal
          initialTab={authModalTab}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onOpenLogin={openLogin}
      />
    </>
  )
}
