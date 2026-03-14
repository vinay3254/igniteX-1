import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer id="app-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" className="brand-icon" alt="EtherX" />
            <span>EtherX</span>
          </Link>
          <p>Premium tech accessories for the modern Apple lifestyle.</p>
          <div className="socials">
            <a href="#" className="social-btn" title="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" className="social-btn" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="social-btn" title="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h6>Company</h6>
          <Link to="/about">About Us</Link>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Blog</a>
        </div>
        <div className="footer-col">
          <h6>Support</h6>
          <Link to="/support">Help Center</Link>
          <Link to="/support">Contact Us</Link>
          <Link to="/support">Returns</Link>
          <Link to="/orders">Track Order</Link>
        </div>
        <div className="footer-col">
          <h6>My Account</h6>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">My Cart</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 EtherX. All rights reserved.</p>
        <p>Crafted with iOS design language</p>
      </div>
    </footer>
  )
}
