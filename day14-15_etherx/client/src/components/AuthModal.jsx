import React, { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../hooks/useToast'

export default function AuthModal({ initialTab, onClose }) {
  const { saveAuth } = useAuth()
  const { refreshCart, loadWishlist } = useCart()
  const { showToast } = useToast()

  const [screen, setScreen] = useState(initialTab)

  // Login
  const [liEmail, setLiEmail] = useState('')
  const [liPass,  setLiPass]  = useState('')
  const [liError, setLiError] = useState('')
  const [liLoading, setLiLoading] = useState(false)

  // Register
  const [regName,  setRegName]  = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass,  setRegPass]  = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regPassword, setRegPassword] = useState('')

  // OTP (registration)
  const [otpEmail, setOtpEmail] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [devOtp, setDevOtp] = useState('')

  // Forgot password
  const [fgEmail,   setFgEmail]   = useState('')
  const [fgError,   setFgError]   = useState('')
  const [fgLoading, setFgLoading] = useState(false)

  // Reset password (OTP + new password)
  const [rsOtp,      setRsOtp]      = useState('')
  const [rsNewPass,  setRsNewPass]  = useState('')
  const [rsConfPass, setRsConfPass] = useState('')
  const [rsError,    setRsError]    = useState('')
  const [rsLoading,  setRsLoading]  = useState(false)
  const [rsDevOtp,   setRsDevOtp]   = useState('')
  const [rsCountdown, setRsCountdown] = useState(0)

  const countdownRef   = useRef(null)
  const rsCountdownRef = useRef(null)
  const otpInputRef    = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function startCooldown(setter, ref) {
    if (ref.current) clearInterval(ref.current)
    let secs = 60
    setter(secs)
    ref.current = setInterval(() => {
      secs--; setter(secs)
      if (secs <= 0) { clearInterval(ref.current); ref.current = null }
    }, 1000)
  }

  function goTo(s) {
    setScreen(s)
    setLiError(''); setRegError(''); setOtpError(''); setFgError(''); setRsError('')
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setLiError(''); setLiLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email: liEmail, password: liPass })
      saveAuth(data.token, data.user)
      onClose()
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      await syncLocalCart()
      await refreshCart(); await loadWishlist()
    } catch (err) {
      setLiError(err.response?.data?.error || err.message)
    } finally { setLiLoading(false) }
  }

  async function syncLocalCart() {
    const local = JSON.parse(localStorage.getItem('etherx_cart') || '[]')
    if (!local.length) return
    for (const item of local) {
      try { await api.post('/cart', { productId: item.id, quantity: item.qty }) } catch {}
    }
    localStorage.setItem('etherx_cart', '[]')
  }

  // ── Register → OTP ────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    setRegError(''); setRegLoading(true)
    try {
      const { data } = await api.post('/auth/send-otp', { name: regName, email: regEmail, password: regPass })
      setOtpEmail(regEmail); setRegPassword(regPass)
      setOtpValue(data.dev_otp || ''); setDevOtp(data.dev_otp || '')
      startCooldown(setOtpCountdown, countdownRef)
      goTo('otp')
      setTimeout(() => otpInputRef.current?.focus(), 100)
    } catch (err) {
      setRegError(err.response?.data?.error || err.message)
    } finally { setRegLoading(false) }
  }

  async function handleVerifyOtp() {
    setOtpError(''); setOtpLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email: otpEmail, otp: otpValue })
      saveAuth(data.token, data.user)
      onClose()
      showToast(`Welcome to EtherX, ${data.user.name.split(' ')[0]}!`)
      await refreshCart()
    } catch (err) {
      setOtpError(err.response?.data?.error || err.message)
    } finally { setOtpLoading(false) }
  }

  async function handleResend() {
    try {
      const { data } = await api.post('/auth/send-otp', { name: regName || 'User', email: otpEmail, password: regPassword || 'placeholder' })
      if (data.dev_otp) { setDevOtp(data.dev_otp); setOtpValue(data.dev_otp) }
      showToast('New code sent!')
      startCooldown(setOtpCountdown, countdownRef)
    } catch (err) { setOtpError(err.response?.data?.error || err.message) }
  }

  function handleOtpInput(val) {
    const clean = val.replace(/\D/g, '').slice(0, 6)
    setOtpValue(clean)
    if (clean.length === 6) setTimeout(handleVerifyOtp, 0)
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  async function handleForgot(e) {
    e.preventDefault()
    setFgError(''); setFgLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email: fgEmail })
      setRsOtp(data.dev_otp || ''); setRsDevOtp(data.dev_otp || '')
      startCooldown(setRsCountdown, rsCountdownRef)
      goTo('reset')
    } catch (err) {
      setFgError(err.response?.data?.error || err.message)
    } finally { setFgLoading(false) }
  }

  async function handleResendReset() {
    try {
      const { data } = await api.post('/auth/forgot-password', { email: fgEmail })
      if (data.dev_otp) { setRsDevOtp(data.dev_otp); setRsOtp(data.dev_otp) }
      showToast('New code sent!')
      startCooldown(setRsCountdown, rsCountdownRef)
    } catch (err) { setRsError(err.response?.data?.error || err.message) }
  }

  async function handleReset(e) {
    e.preventDefault()
    if (rsNewPass !== rsConfPass) { setRsError('Passwords do not match'); return }
    setRsError(''); setRsLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', { email: fgEmail, otp: rsOtp, newPassword: rsNewPass })
      showToast(data.message || 'Password reset successfully!')
      goTo('login')
    } catch (err) {
      setRsError(err.response?.data?.error || err.message)
    } finally { setRsLoading(false) }
  }

  const showTabs = screen === 'login' || screen === 'register'

  return (
    <div className="modal-overlay open" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>

        {showTabs && (
          <div className="modal-tabs">
            <button className={`modal-tab${screen === 'login' ? ' active' : ''}`} onClick={() => goTo('login')}>Sign In</button>
            <button className={`modal-tab${screen === 'register' ? ' active' : ''}`} onClick={() => goTo('register')}>Create Account</button>
          </div>
        )}

        {/* ── Login ─────────────────────────────────────────────────────── */}
        {screen === 'login' && (
          <form className="modal-form" onSubmit={handleLogin}>
            <div className="modal-brand"><img src="/logo.png" className="brand-icon" alt="EtherX" /><span>EtherX</span></div>
            <p className="modal-sub">Welcome back</p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" autoComplete="email" value={liEmail} onChange={e => setLiEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" autoComplete="current-password" value={liPass} onChange={e => setLiPass(e.target.value)} required />
            </div>
            <p style={{ textAlign: 'right', margin: '-8px 0 12px', fontSize: '.82rem' }}>
              <button type="button" onClick={() => goTo('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold,#D4B571)', font: 'inherit', padding: 0 }}>
                Forgot password?
              </button>
            </p>
            <p className="modal-error">{liError}</p>
            <button type="submit" className="btn-primary w-full" disabled={liLoading}>
              {liLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── Register ──────────────────────────────────────────────────── */}
        {screen === 'register' && (
          <form className="modal-form" onSubmit={handleRegister}>
            <div className="modal-brand"><img src="/logo.png" className="brand-icon" alt="EtherX" /><span>EtherX</span></div>
            <p className="modal-sub">Create your account</p>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Jane Appleseed" autoComplete="name" value={regName} onChange={e => setRegName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" autoComplete="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" autoComplete="new-password" value={regPass} onChange={e => setRegPass(e.target.value)} required />
            </div>
            <p className="modal-error">{regError}</p>
            <button type="submit" className="btn-primary w-full" disabled={regLoading}>
              {regLoading ? 'Sending code…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* ── Registration OTP ──────────────────────────────────────────── */}
        {screen === 'otp' && (
          <div className="modal-form">
            <div className="modal-brand"><img src="/logo.png" className="brand-icon" alt="EtherX" /><span>EtherX</span></div>
            <p className="modal-sub">Verify your email</p>
            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary,#666)', textAlign: 'center', margin: '-8px 0 16px' }}>
              We sent a 6-digit code to<br /><strong style={{ color: 'var(--text)' }}>{otpEmail}</strong>
            </p>
            {devOtp && (
              <div style={{ background: 'rgba(212,181,113,.12)', border: '1px solid rgba(212,181,113,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, textAlign: 'center', fontSize: '.82rem' }}>
                <span style={{ opacity: .7 }}>Dev mode — your code: </span>
                <strong style={{ color: 'var(--gold,#D4B571)', letterSpacing: '.2em', fontSize: '1.1rem' }}>{devOtp}</strong>
              </div>
            )}
            <div className="form-group">
              <label>Verification Code</label>
              <input ref={otpInputRef} type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code"
                style={{ letterSpacing: '.35em', fontSize: '1.4rem', textAlign: 'center' }}
                value={otpValue} onChange={e => handleOtpInput(e.target.value)} />
            </div>
            <p className="modal-error">{otpError}</p>
            <button type="button" className="btn-primary w-full" onClick={handleVerifyOtp} disabled={otpLoading}>
              {otpLoading ? 'Verifying…' : 'Verify & Create Account'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem', color: 'var(--text-secondary,#666)' }}>
              Didn&apos;t receive it?{' '}
              <button type="button" onClick={handleResend} disabled={otpCountdown > 0}
                style={{ background: 'none', border: 'none', cursor: otpCountdown > 0 ? 'default' : 'pointer', color: 'inherit', font: 'inherit', textDecoration: 'underline', padding: 0, opacity: otpCountdown > 0 ? .4 : 1 }}>
                Resend
              </button>
              {otpCountdown > 0 && <span> in {otpCountdown}s</span>}
            </p>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: '.82rem' }}>
              <button type="button" onClick={() => { goTo('register'); if (countdownRef.current) clearInterval(countdownRef.current) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', font: 'inherit', padding: 0 }}>
                ← Back to Sign Up
              </button>
            </p>
          </div>
        )}

        {/* ── Forgot Password (email step) ───────────────────────────────── */}
        {screen === 'forgot' && (
          <form className="modal-form" onSubmit={handleForgot}>
            <div className="modal-brand"><img src="/logo.png" className="brand-icon" alt="EtherX" /><span>EtherX</span></div>
            <p className="modal-sub">Reset your password</p>
            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary,#666)', textAlign: 'center', margin: '-8px 0 20px' }}>
              Enter your account email and we&apos;ll send you a reset code.
            </p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" autoComplete="email" value={fgEmail} onChange={e => setFgEmail(e.target.value)} required />
            </div>
            <p className="modal-error">{fgError}</p>
            <button type="submit" className="btn-primary w-full" disabled={fgLoading}>
              {fgLoading ? 'Sending code…' : 'Send Reset Code'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem' }}>
              <button type="button" onClick={() => goTo('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', font: 'inherit', padding: 0 }}>
                ← Back to Sign In
              </button>
            </p>
          </form>
        )}

        {/* ── Reset Password (OTP + new password) ───────────────────────── */}
        {screen === 'reset' && (
          <form className="modal-form" onSubmit={handleReset}>
            <div className="modal-brand"><img src="/logo.png" className="brand-icon" alt="EtherX" /><span>EtherX</span></div>
            <p className="modal-sub">Choose a new password</p>
            <p style={{ fontSize: '.85rem', color: 'var(--text-secondary,#666)', textAlign: 'center', margin: '-8px 0 16px' }}>
              Enter the code sent to<br /><strong style={{ color: 'var(--text)' }}>{fgEmail}</strong>
            </p>
            {rsDevOtp && (
              <div style={{ background: 'rgba(212,181,113,.12)', border: '1px solid rgba(212,181,113,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, textAlign: 'center', fontSize: '.82rem' }}>
                <span style={{ opacity: .7 }}>Dev mode — your code: </span>
                <strong style={{ color: 'var(--gold,#D4B571)', letterSpacing: '.2em', fontSize: '1.1rem' }}>{rsDevOtp}</strong>
              </div>
            )}
            <div className="form-group">
              <label>Reset Code</label>
              <input type="text" placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code"
                style={{ letterSpacing: '.35em', fontSize: '1.4rem', textAlign: 'center' }}
                value={rsOtp} onChange={e => setRsOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Min. 6 characters" autoComplete="new-password" value={rsNewPass} onChange={e => setRsNewPass(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat new password" autoComplete="new-password" value={rsConfPass} onChange={e => setRsConfPass(e.target.value)} required />
            </div>
            <p className="modal-error">{rsError}</p>
            <button type="submit" className="btn-primary w-full" disabled={rsLoading}>
              {rsLoading ? 'Resetting…' : 'Reset Password'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.82rem', color: 'var(--text-secondary,#666)' }}>
              Didn&apos;t receive it?{' '}
              <button type="button" onClick={handleResendReset} disabled={rsCountdown > 0}
                style={{ background: 'none', border: 'none', cursor: rsCountdown > 0 ? 'default' : 'pointer', color: 'inherit', font: 'inherit', textDecoration: 'underline', padding: 0, opacity: rsCountdown > 0 ? .4 : 1 }}>
                Resend
              </button>
              {rsCountdown > 0 && <span> in {rsCountdown}s</span>}
            </p>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: '.82rem' }}>
              <button type="button" onClick={() => goTo('forgot')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', font: 'inherit', padding: 0 }}>
                ← Back
              </button>
            </p>
          </form>
        )}

      </div>
    </div>
  )
}
