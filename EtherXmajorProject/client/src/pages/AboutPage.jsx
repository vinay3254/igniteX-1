import React from 'react'

const team = [
  { name: 'Niranjan JR', role: 'CEO', img: '/niranjan.jpeg' },
  { name: 'Meghana CD', role: 'Co-Founder', img: '/meghana.jpeg' },
  { name: 'Bhumika', role: 'Lead Designer', img: '/bhoomika.jpeg' },
  { name: 'Kishore P', role: 'Lead — IgniteX', img: '/kishore.jpeg' },
]

const domains = [
  { title: 'Blockchain & Web3', desc: 'Decentralized apps (dApps), token economies, NFT platforms, and transparent supply chain systems using Ethereum, Hyperledger, and other protocols.' },
  { title: 'Artificial Intelligence / Machine Learning', desc: 'Predictive analytics, AI-powered assistants, deep learning models, computer vision, and intelligent automation for transformative solutions.' },
  { title: 'Cybersecurity & Privacy Engineering', desc: 'Encryption, threat detection, secure access control, compliance-first design, and zero-trust systems to safeguard critical data and infrastructure.' },
  { title: 'VLSI & Semiconductors', desc: 'Custom silicon design, ASIC development, low-power chip architectures, and semiconductor solutions powering next-generation hardware innovation.' },
  { title: 'Quantum Computing & Advanced Research', desc: 'Research and development in quantum algorithms, quantum-inspired computing, post-quantum cryptography, and hybrid classical-quantum systems.' },
  { title: 'Healthcare Technology', desc: 'Secure electronic health records, AI tools for diagnosis, interoperability solutions, and digital platforms driving healthcare innovation.' },
  { title: 'FinTech & Investment Tech', desc: 'Digital wallets, lending solutions, retirement planners, and blockchain-powered infrastructure supporting inclusive economic growth.' },
  { title: 'Social Impact Tech', desc: 'Mental wellness tools, digital identity systems, e-governance platforms, and ethical AI applications for a fair and connected society.' },
]

const forces = [
  { name: 'CoreX', title: 'The engine that builds EtherX', desc: 'They form the foundation — translating bold ideas into stable, reliable systems and giving EtherX its enduring strength.', traits: ['Stability', 'Systems', 'Reliability'], signature: 'Fortress-grade builds' },
  { name: 'AlphaX', title: 'The brain that decodes EtherX', desc: 'The hyper-analytical minds who simplify chaos, decode complex logic, and keep EtherX razor sharp.', traits: ['Logic', 'Precision', 'Intelligence'], signature: 'Precision logic cores' },
  { name: 'IgniteX', title: 'The spark that ignites EtherX', desc: 'Relentless creators who inject energy, imagination, and rapid execution into every EtherX initiative.', traits: ['Imagination', 'Speed', 'Impact'], signature: 'Rapid launch cycles' },
  { name: 'NovaX', title: 'The silicon brain of EtherX', desc: 'NovaX designs custom silicon and accelerators that make EtherX fast and power-efficient.', traits: ['VLSI', 'Low Power', 'Throughput'], signature: 'Silicon-tuned performance' },
]

const values = [
  { title: 'Precision Quality', desc: 'Every product is hand-selected and rigorously tested before it ever reaches our store.' },
  { title: 'Sustainability', desc: 'We prioritize eco-friendly packaging and partner with brands committed to reducing their carbon footprint.' },
  { title: 'Customer First', desc: 'With 24/7 support and a 30-day hassle-free return policy, your satisfaction is always guaranteed.' },
  { title: 'Innovation', desc: "We're always ahead of the curve, stocking the latest and greatest from the Apple ecosystem." },
]

export default function AboutPage() {
  React.useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <div className="page-container page-enter">

      {/* Hero */}
      <div className="about-hero">
        <h1>EtherX Innovations</h1>
        <p>Secure, Sovereign, and Smart Technologies.</p>
      </div>

      {/* Mission */}
      <div className="about-mission">
        <h2>Our Mission</h2>
        <p>
          Our mission is to build innovative and secure digital technologies that empower individuals
          and organizations while protecting data ownership and privacy. We aim to develop scalable
          solutions in areas such as artificial intelligence, blockchain, cybersecurity, and emerging
          technologies that contribute to a stronger digital ecosystem.
        </p>
        <p style={{ marginTop: 16 }}>
          Through responsible innovation and continuous research, we strive to create impactful products
          that support technological independence and drive meaningful progress for India and the global
          community.
        </p>
      </div>

      {/* Domain Expertise */}
      <div className="about-domains" style={{ padding: '40px 24px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Domain Expertise</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary, #888)', marginBottom: 32, maxWidth: 640, margin: '0 auto 32px' }}>
          At EtherX Innovations, we combine deep technical expertise with bold vision — designing
          mission-critical digital solutions across eight high-impact domains.
        </p>
        <div className="about-values">
          {domains.map(d => (
            <div key={d.title} className="value-card">
              <h4>{d.title}</h4>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EtherX Forces */}
      <div className="about-forces" style={{ padding: '40px 24px', background: 'var(--card-bg, #f8f9fa)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>EtherX Forces</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary, #888)', marginBottom: 32, maxWidth: 640, margin: '0 auto 32px' }}>
          Four autonomous squads — each with a distinct spirit — orchestrate imagination, logic, and
          impact. Together they make EtherX unstoppable.
        </p>
        <div className="about-values">
          {forces.map(f => (
            <div key={f.name} className="value-card">
              <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{f.name}</h4>
              <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginBottom: 8, color: 'var(--primary, #007aff)' }}>{f.title}</p>
              <p>{f.desc}</p>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {f.traits.map(t => (
                  <span key={t} style={{ background: 'var(--primary, #007aff)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem' }}>{t}</span>
                ))}
              </div>
              <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary, #888)' }}>{f.signature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Store Values */}
      <div className="about-values-section" style={{ padding: '40px 24px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Our Store Values</h2>
        <div className="about-values">
          {values.map(v => (
            <div key={v.title} className="value-card">
              <h4>{v.title}</h4>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership */}
      <div className="about-team">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {team.map(m => (
            <div key={m.name} className="team-card">
              <div className="team-avatar"><img src={m.img} alt={m.name} /></div>
              <p className="team-name">{m.name}</p>
              <p className="team-role">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
