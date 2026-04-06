import { useState } from 'react';
import PdfUploader from './components/PdfUploader';
import NidScanner from './components/NidScanner';
import { LayoutGrid, FileText, Scan, Home, Users, Search, CreditCard, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'pdf', or 'nid'

  const services = [
    { id: 'pdf', title: 'ভোটার লিস্ট ডাটা (Voter List)', icon: <FileText size={28} />, color: '#3b82f6' },
    { id: 'nid', title: 'এনআইডি ফরম ফিলাপ (NID OCR)', icon: <Scan size={28} />, color: '#a855f7' },

  ];

  return (
    <>
      <header className="navbar container">
        <div className="navbar-brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary-blue)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          স্মার্ট নাগরিক
        </div>
        <nav className="navbar-nav">
          <a href="#" className="nav-link" onClick={() => setActiveTab('home')}>প্রথম পাতা</a>
          <a href="#" className="nav-link">আবেদনের অবস্থা</a>
          <a href="#" className="nav-link">নাগরিক লগইন</a>
          <button className="btn btn-primary" style={{ marginLeft: '1rem' }}>সাইন আপ</button>
        </nav>
      </header>

      <div className="welcome-bar">
        ইউনিয়ন পরিষদের ডিজিটাল অনলাইন সেবা সিস্টেমে আপনাকে স্বাগতম
      </div>

      <main className="container pb-10">
        {activeTab === 'home' && (
          <>


            <section className="services-container">
              <div className="services-header">সেবাসমূহ</div>
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service.id} className="service-card" onClick={() => setActiveTab(service.id)}>
                    <div className="service-icon-circle">
                      {service.icon}
                    </div>
                    <div className="service-title">{service.title}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'pdf' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            <button className="btn btn-outline" onClick={() => setActiveTab('home')} style={{ marginBottom: '2rem' }}>
              <Home size={18} /> ফিরে যান
            </button>
            <h2 className="section-title">ভোটার লিস্ট ডাটা সংগ্রহ</h2>
            <PdfUploader />
          </div>
        )}

        {activeTab === 'nid' && (
          <div style={{ animation: 'fade-in 0.3s ease-out' }}>
            <button className="btn btn-outline" onClick={() => setActiveTab('home')} style={{ marginBottom: '2rem' }}>
              <Home size={18} /> ফিরে যান
            </button>
            <h2 className="section-title">এনআইডি স্ক্যানার ও ডাটা এন্ট্রি</h2>
            <NidScanner />
          </div>
        )}

        {(activeTab === 'nagorik' || activeTab === 'sonod' || activeTab === 'holding' || activeTab === 'help') && (
          <div className="white-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>এই সেবাটি শীঘ্রই চালু হবে</h2>
            <button className="btn btn-primary" onClick={() => setActiveTab('home')}>ফিরে যান</button>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border-subtle)', background: 'white', marginTop: 'auto' }}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>© ২০২৪ স্মার্ট নাগরিক - ডিজিটাল ইউনিয়ন পরিষদ অনলাইন সেবা</p>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pb-10 { padding-bottom: 4rem; }
      `}</style>
    </>
  )
}

export default App;
