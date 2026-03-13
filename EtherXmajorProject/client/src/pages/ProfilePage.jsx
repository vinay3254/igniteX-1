import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Spinner from '../components/Spinner'

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [orders, setOrders] = useState([])
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('info')

  const [profName, setProfName] = useState('')
  const [profEmail, setProfEmail] = useState('')
  const [profErr, setProfErr] = useState('')

  const [currPass, setCurrPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [passErr, setPassErr] = useState('')
  const [passOk, setPassOk] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!token || !user) { navigate('/'); return }
    setProfName(user.name)
    setProfEmail(user.email)
    Promise.all([
      api.get('/orders').then(r => setOrders(r.data.orders)).catch(() => {}),
      api.get('/wishlist').then(r => setWishlistCount(r.data.wishlist.length)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [token, user])

  async function saveProfile() {
    setProfErr('')
    if (!profName || !profEmail) { setProfErr('Name and email are required.'); return }
    try {
      const { data } = await api.put('/auth/me', { name: profName, email: profEmail })
      updateUser(data.user)
      showToast('✅ Profile updated!')
    } catch (err) { setProfErr(err.response?.data?.error || err.message) }
  }

  async function changePassword() {
    setPassErr(''); setPassOk('')
    if (!currPass || !newPass) { setPassErr('Please fill in all fields.'); return }
    if (newPass !== confPass) { setPassErr('Passwords do not match.'); return }
    if (newPass.length < 6) { setPassErr('Password must be at least 6 characters.'); return }
    try {
      await api.put('/auth/me', { currentPassword: currPass, newPassword: newPass })
      setPassOk('✅ Password changed successfully!')
      setCurrPass(''); setNewPass(''); setConfPass('')
    } catch (err) { setPassErr(err.response?.data?.error || err.message) }
  }

  if (loading) return <div className="page-container"><Spinner /></div>
  if (!user) return null

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="page-container page-enter">
      <div className="breadcrumb"><Link to="/">Home</Link><span>›</span><span>Profile</span></div>
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar">{initials}</div>
          <p className="profile-name">{user.name}</p>
          <p className="profile-email">{user.email}</p>
          <div className="profile-stat-row">
            <div className="profile-stat"><span className="profile-stat-num">{orders.length}</span><span className="profile-stat-label">Orders</span></div>
            <div className="profile-stat"><span className="profile-stat-num">{wishlistCount}</span><span className="profile-stat-label">Saved</span></div>
          </div>
          <nav className="profile-nav-links">
            <div className={`profile-nav-link${activeSection === 'info' ? ' active' : ''}`} onClick={() => setActiveSection('info')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Personal Info
            </div>
            <div className={`profile-nav-link${activeSection === 'security' ? ' active' : ''}`} onClick={() => setActiveSection('security')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Security
            </div>
            <Link to="/orders" className="profile-nav-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Orders
            </Link>
            <Link to="/wishlist" className="profile-nav-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Wishlist
            </Link>
          </nav>
        </aside>
        <div className="profile-main">
          {activeSection === 'info' && (
            <div className="profile-card">
              <h3>Personal Information</h3>
              <div className="form-group"><label>Full Name</label><input type="text" value={profName} onChange={e => setProfName(e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={profEmail} onChange={e => setProfEmail(e.target.value)} /></div>
              {profErr && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 8 }}>{profErr}</p>}
              <button className="btn-primary save-btn" onClick={saveProfile}>Save Changes</button>
            </div>
          )}
          {activeSection === 'security' && (
            <div className="profile-card">
              <h3>Change Password</h3>
              <div className="form-group"><label>Current Password</label><input type="password" placeholder="••••••••" value={currPass} onChange={e => setCurrPass(e.target.value)} /></div>
              <div className="form-group"><label>New Password</label><input type="password" placeholder="Min. 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
              <div className="form-group"><label>Confirm New Password</label><input type="password" placeholder="Repeat password" value={confPass} onChange={e => setConfPass(e.target.value)} /></div>
              {passErr && <p style={{ color: 'var(--red)', fontSize: 14, marginBottom: 8 }}>{passErr}</p>}
              {passOk && <p style={{ color: 'var(--green)', fontSize: 14, marginBottom: 8 }}>{passOk}</p>}
              <button className="btn-primary save-btn" onClick={changePassword}>Update Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
