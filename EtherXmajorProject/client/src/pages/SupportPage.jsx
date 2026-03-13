import React, { useState } from 'react'
import { useToast } from '../hooks/useToast'

const faqs = [
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout. Orders over $50 ship free via standard shipping.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy. Items must be in original condition with packaging. Simply initiate a return from your order history page and we\'ll email a prepaid return label.' },
  { q: 'Are your products Apple-certified?', a: 'All Apple-branded products are genuine. Third-party accessories are carefully vetted and certified to work perfectly with Apple devices. MFi-certified products are clearly labeled.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive an email with a tracking number. You can also view order status anytime under My Account → My Orders.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement from the My Orders page. After that, the order has likely been processed and cannot be changed. Contact support if you need help.' },
  { q: 'Do you offer a warranty?', a: 'Yes! All products come with a minimum 1-year manufacturer warranty. Premium products like Apple Watch and AirPods come with Apple\'s standard 2-year warranty. EtherX also offers extended warranty plans.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard SSL encryption for all transactions. We never store your full card number. Payments are processed by Stripe, a PCI-DSS Level 1 certified provider.' },
]

const topics = [
  { icon: '📦', title: 'Orders & Shipping', desc: 'Track, modify, or cancel' },
  { icon: '🔄', title: 'Returns & Refunds', desc: '30-day hassle-free policy' },
  { icon: '🛡️', title: 'Warranty & Repairs', desc: 'Coverage & claims' },
  { icon: '💳', title: 'Payments', desc: 'Billing, cards & receipts' },
  { icon: '📱', title: 'Compatibility', desc: 'Device & software checks' },
  { icon: '🎁', title: 'Gift Cards', desc: 'Buy, redeem, balance' },
]

export default function SupportPage() {
  React.useEffect(() => { window.scrollTo(0, 0) }, [])
  const { showToast } = useToast()
  const [openFaq, setOpenFaq] = useState(null)
  const [faqSearch, setFaqSearch] = useState('')

  const filteredFaqs = faqs.filter(f =>
    !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase())
  )

  return (
    <div className="page-container page-enter">
      <div className="support-search">
        <h1>How can we help?</h1>
        <p>Search our knowledge base or browse topics below.</p>
        <div className="support-search-bar">
          <input
            type="text"
            placeholder="e.g. returns, shipping, warranty…"
            value={faqSearch}
            onChange={e => setFaqSearch(e.target.value)}
          />
          <button type="button">Search</button>
        </div>
      </div>
      <div className="support-topics">
        {topics.map(t => (
          <div key={t.title} className="support-topic">
            <div className="support-topic-icon">{t.icon}</div>
            <h4>{t.title}</h4>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {filteredFaqs.map((f, i) => (
          <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
            <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{f.q}</span>
              <svg className="faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="faq-answer"><p>{f.a}</p></div>
          </div>
        ))}
      </div>
      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">💬</div>
          <h4>Live Chat</h4>
          <p>Chat with our support team in real time, available 9am–10pm daily.</p>
          <button className="btn-primary" onClick={() => showToast('💬 Live chat coming soon!')}>Start Chat</button>
        </div>
        <div className="contact-card">
          <div className="contact-icon">📧</div>
          <h4>Email Support</h4>
          <p>Send us an email and we&apos;ll get back to you within 24 hours.</p>
          <button className="btn-primary" onClick={() => showToast('📧 support@etherx-shop.com')}>Send Email</button>
        </div>
      </div>
    </div>
  )
}
