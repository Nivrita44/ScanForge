import { useState } from 'react';
import PdfUploader from './components/PdfUploader';
import NidScanner from './components/NidScanner';

function App() {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'nid'

  return (
    <>
      <header className="navbar container">
        <a href="/" className="navbar-brand">
          <span className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M8 13h2"></path>
              <path d="M8 17h2"></path>
              <path d="M14 13h2"></path>
              <path d="M14 17h2"></path>
            </svg>
          </span>
          ScanForge
        </a>
        <nav className="navbar-nav">
          <button 
            className={`nav-link ${activeTab === 'pdf' ? 'active' : ''} btn-outline`} 
            style={{border: 'none'}}
            onClick={() => setActiveTab('pdf')}
          >
            Voter PDF
          </button>
          <button 
            className={`nav-link ${activeTab === 'nid' ? 'active' : ''} btn-outline`}
            style={{border: 'none'}}
            onClick={() => setActiveTab('nid')}
          >
            NID Scanner
          </button>
        </nav>
      </header>

      <main className="container pb-10">
        <h1 className="section-title">
          <span className="gradient-text">Intelligent</span> Document Processing
        </h1>
        <p className="section-subtitle">
          Extract structured data instantly from Bangla voter lists or seamlessly auto-fill forms using your ID card.
        </p>

        <div className="tab-content" style={{ animation: 'fade-in 0.3s ease-in-out' }}>
          {activeTab === 'pdf' ? <PdfUploader /> : <NidScanner />}
        </div>
      </main>

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
