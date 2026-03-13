import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { useToast } from '../hooks/useToast'

const FALLBACK_FEATURED = [
  {id:'1',brand:'Apple',name:'AirPods Pro (2nd Gen)',price:249,oldPrice:null,rating:5,reviews:2840,tag:'hot',category:'audio',stock:10,img:'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'2',brand:'Apple',name:'Apple Watch Ultra 2',price:799,oldPrice:999,rating:5,reviews:1290,tag:'sale',category:'wearables',stock:5,img:'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'3',brand:'Apple',name:'MagSafe Charger 15W',price:39,oldPrice:null,rating:4,reviews:5100,tag:'new',category:'chargers',stock:20,img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'4',brand:'Apple',name:'iPad Air M2 11"',price:599,oldPrice:null,rating:5,reviews:3400,tag:'new',category:'tablets',stock:8,img:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'5',brand:'Beats',name:'Studio Pro Headphones',price:349,oldPrice:449,rating:4,reviews:890,tag:'sale',category:'audio',stock:12,img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'6',brand:'Apple',name:'MacBook Air 13" M3',price:1299,oldPrice:null,rating:5,reviews:2100,tag:'new',category:'laptops',stock:7,img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'7',brand:'Apple',name:'iPhone 15 Pro Case',price:59,oldPrice:null,rating:4,reviews:7600,tag:'hot',category:'cases',stock:50,img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
  {id:'8',brand:'Belkin',name:'MagSafe 3-in-1 Stand',price:149,oldPrice:179,rating:4,reviews:640,tag:'sale',category:'chargers',stock:15,img:'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80',description:'',isFeatured:true,isNewArrival:false},
]

const FALLBACK_ARRIVALS = [
  {id:'9',brand:'Apple',name:'Apple Pencil Pro',price:129,oldPrice:null,rating:5,reviews:1890,tag:'new',category:'accessories',stock:20,img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',description:'',isFeatured:false,isNewArrival:true},
  {id:'10',brand:'Nomad',name:'Sport Band Ultra',price:59,oldPrice:null,rating:4,reviews:430,tag:'new',category:'wearables',stock:30,img:'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400&q=80',description:'',isFeatured:false,isNewArrival:true},
  {id:'11',brand:'JBL',name:'Flip 6 Speaker',price:129,oldPrice:149,rating:4,reviews:2200,tag:'hot',category:'audio',stock:18,img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',description:'',isFeatured:false,isNewArrival:true},
  {id:'12',brand:'Apple',name:'HomePod mini',price:99,oldPrice:null,rating:5,reviews:3100,tag:'new',category:'audio',stock:10,img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80',description:'',isFeatured:false,isNewArrival:true},
]

export default function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [featured, setFeatured] = useState([])
  const [arrivals, setArrivals] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [arrivalsLoading, setArrivalsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [nlEmail, setNlEmail] = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    loadFeatured('all')
    loadArrivals()
  }, [])

  async function loadFeatured(filter) {
    setFeaturedLoading(true)
    try {
      const params = filter === 'all'
        ? { type: 'featured', limit: '8' }
        : { category: filter, limit: '8' }
      const { data } = await api.get('/products', { params })
      setFeatured(data.products)
    } catch {
      setFeatured(FALLBACK_FEATURED)
    } finally { setFeaturedLoading(false) }
  }

  async function loadArrivals() {
    setArrivalsLoading(true)
    try {
      const { data } = await api.get('/products', { params: { type: 'new_arrival', limit: '4' } })
      setArrivals(data.products)
    } catch {
      setArrivals(FALLBACK_ARRIVALS)
    } finally { setArrivalsLoading(false) }
  }

  async function handleNewsletter() {
    if (!nlEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail)) {
      showToast('Please enter a valid email'); return
    }
    setNlLoading(true)
    try {
      const { data } = await api.post('/newsletter/subscribe', { email: nlEmail })
      showToast(data.message); setNlEmail('')
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      showToast(msg.includes('already') ? 'Already subscribed!' : msg)
    } finally { setNlLoading(false) }
  }

  function handleCatPill(filter) {
    setActiveFilter(filter)
    loadFeatured(filter)
  }

  return (
    <>
      {/* HERO */}
      <section id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            New Collection 2024
          </div>
          <h1 className="hero-title">The Future<br /><span>In Your Hands</span></h1>
          <p className="hero-subtitle">Discover premium tech accessories designed to complement your Apple lifestyle.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
            <button className="btn-ghost" onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}>Explore →</button>
          </div>

        </div>
        <div className="hero-visual">
          <div className="hero-glow"></div>
          <div className="hero-main-img">
            <img src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80" alt="iPhone 15 Pro" />
          </div>
          <div className="floating-card card-1">
            <img src="https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=200&q=80" alt="AirPods Pro" />
            <div className="fc-info"><span>AirPods Pro</span><strong>$249</strong></div>
          </div>
          <div className="floating-card card-2">
            <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80" alt="Apple Watch" />
            <div className="fc-info"><span>Apple Watch Ultra</span><strong>$799</strong></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h6>Free Shipping</h6>
            <p>On orders over $50</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h6>2-Year Warranty</h6>
            <p>Full coverage included</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon orange-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
            </div>
            <h6>Easy Returns</h6>
            <p>30-day hassle-free</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple-bg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h6>24/7 Support</h6>
            <p>Expert help anytime</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="section-pad">
        <div className="section-header">
          <div>
            <p className="section-label">Browse By</p>
            <h2 className="section-title">Categories</h2>
          </div>
          <Link to="/shop" className="view-all">View All →</Link>
        </div>
        <div className="category-pills">
          {['all','audio','wearables','cases','chargers','displays','keyboards'].map(f => (
            <div key={f} className={`cat-pill${activeFilter === f ? ' active' : ''}`} onClick={() => handleCatPill(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </div>
          ))}
        </div>
        <div className="categories-grid">
          <div className="cat-card" style={{'--cat-color': '#007AFF'}} onClick={() => navigate('/shop?category=audio')}>
            <div className="cat-img-wrap"><img src="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&q=80" alt="Audio" /></div>
            <div className="cat-info"><h5>Audio</h5><p>48 items</p></div>
          </div>
          <div className="cat-card" style={{'--cat-color': '#5856D6'}} onClick={() => navigate('/shop?category=wearables')}>
            <div className="cat-img-wrap"><img src="https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=300&q=80" alt="Wearables" /></div>
            <div className="cat-info"><h5>Wearables</h5><p>32 items</p></div>
          </div>
          <div className="cat-card" style={{'--cat-color': '#FF9500'}} onClick={() => navigate('/shop?category=cases')}>
            <div className="cat-img-wrap"><img src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&q=80" alt="Cases" /></div>
            <div className="cat-info"><h5>Cases</h5><p>96 items</p></div>
          </div>
          <div className="cat-card" style={{'--cat-color': '#34C759'}} onClick={() => navigate('/shop?category=chargers')}>
            <div className="cat-img-wrap"><img src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80" alt="Chargers" /></div>
            <div className="cat-info"><h5>Chargers</h5><p>24 items</p></div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="featured" className="section-pad">
        <div className="section-header">
          <div>
            <p className="section-label">Hand Picked</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/shop" className="view-all">View All →</Link>
        </div>
        {featuredLoading ? (
          <div className="products-grid">
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-sec)', fontSize: 15 }}>Loading…</div>
          </div>
        ) : (
          <div className="products-grid" id="featured-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* SALE BANNER */}
      <section id="sale-banner">
        <div className="banner-inner">
          <div className="banner-text">
            <span className="banner-badge">Limited Time</span>
            <h2>Summer Sale</h2>
            <p>Up to 40% off on selected accessories. No code needed.</p>
            <button className="btn-primary" onClick={() => navigate('/shop?tag=sale')}>Shop the Sale</button>
          </div>
          <div className="banner-visual">
            <img src="https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80" alt="Sale items" />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" className="section-pad">
        <div className="section-header">
          <div>
            <p className="section-label">Just Dropped</p>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <Link to="/shop?tag=new" className="view-all">View All →</Link>
        </div>
        {arrivalsLoading ? (
          <div className="products-grid">
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-sec)', fontSize: 15 }}>Loading…</div>
          </div>
        ) : (
          <div className="products-grid" id="arrivals-grid">
            {arrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* PROMOS */}
      <section id="promos" className="section-pad">
        <div className="promos-grid">
          <div className="promo-card promo-dark">
            <span className="promo-eyebrow">Crazy Deal</span>
            <h3>Buy 1<br />Get 1 Free</h3>
            <p>Select cases &amp; bands only</p>
            <button className="btn-outline-white" onClick={() => navigate('/shop?category=cases')}>Learn More</button>
          </div>
          <div className="promo-card promo-blue">
            <span className="promo-eyebrow">Spring / Summer</span>
            <h3>Upcoming<br />Season</h3>
            <p>Explore the fresh collection</p>
            <button className="btn-outline-white" onClick={() => navigate('/shop?tag=new')}>Collection</button>
          </div>
          <div className="promo-card promo-purple">
            <span className="promo-eyebrow">Seasonal</span>
            <h3>Winter<br />50% Off</h3>
            <p>Clearance sale ends soon</p>
            <button className="btn-outline-white" onClick={() => navigate('/shop?tag=sale')}>Shop Now</button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter">
        <div className="newsletter-card">
          <div className="nl-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div className="nl-text">
            <h3>Stay in the Loop</h3>
            <p>Latest drops, deals &amp; news — straight to your inbox.</p>
          </div>
          <div className="nl-form">
            <input type="email" placeholder="you@example.com" value={nlEmail} onChange={e => setNlEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleNewsletter() }} />
            <button className="btn-primary" onClick={handleNewsletter} disabled={nlLoading}>
              {nlLoading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
