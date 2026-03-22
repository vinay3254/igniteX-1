import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="page-container page-enter" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--text-sec)', marginBottom: 32 }}>Page not found. It may have been moved or deleted.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}
