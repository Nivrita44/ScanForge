import { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, ScanText, FileCheck2, User, CalendarDays, Hash } from 'lucide-react';

export default function NidScanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
      setData(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('nid', image);

    try {
      const response = await axios.post('http://localhost:5000/api/extract-nid', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to scan NID. Ensure the image is clear and well-lit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2">
      {/* Scanner Control Panel */}
      <div className="glass-card" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        <div>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
            <ScanText className="brand-icon" /> NID Acquisition
          </h2>
          <p style={{color: 'var(--text-muted)'}}>Upload or take a photo of the front side of a Bangladesh NID card.</p>
        </div>

        {preview ? (
          <div style={{position: 'relative'}}>
            <img src={preview} alt="NID Preview" className="preview-image" />
            <button 
              className="btn btn-outline" 
              style={{position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)'}}
              onClick={() => { setImage(null); setPreview(null); setData(null); }}
            >
              Clear
            </button>
          </div>
        ) : (
          <div 
            className="dropzone"
            onClick={() => fileInputRef.current.click()}
            style={{padding: '3rem 1rem'}}
          >
            <Camera size={48} className="dropzone-icon" />
            <h3>Tap to open camera/gallery</h3>
          </div>
        )}

        <input
          type="file"
          accept="image/*;capture=camera"
          ref={fileInputRef}
          onChange={handleCapture}
          className="file-input"
        />

        {error && (
          <div style={{color: '#ef4444', padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)'}}>
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={handleScan}
          disabled={!image || loading}
          style={{marginTop: 'auto'}}
        >
          {loading ? <><span className="loader"></span> Scanning NID...</> : 'Extract Details'}
        </button>
      </div>

      {/* Extracted Data Form */}
      <div className="glass-card" style={{position: 'relative'}}>
        {!data && !loading && (
           <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)', zIndex: 10, borderRadius: 'var(--border-radius-lg)'}}>
              <p style={{color: 'var(--text-muted)'}}>Scan an NID to auto-fill these fields</p>
           </div>
        )}
        
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
          <FileCheck2 className="brand-icon" /> Verified Details
        </h2>

        <form>
          <div className="form-group">
            <label className="form-label"><User size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> Name (English)</label>
            <input 
              type="text" 
              className="form-control" 
              value={data?.name || ''} 
              readOnly 
              placeholder="e.g. TASMIA AKTER"
            />
          </div>

          <div className="form-group">
            <label className="form-label">নাম (Bangla)</label>
            <input 
              type="text" 
              className="form-control" 
              value={data?.name_bn || ''} 
              readOnly 
              placeholder="e.g. তাসমিয়া আক্তার"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><CalendarDays size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> Date of Birth</label>
            <input 
              type="text" 
              className="form-control" 
              value={data?.date_of_birth || ''} 
              readOnly 
              placeholder="e.g. 11 Jan 1992"
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Hash size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> NID Number</label>
            <input 
              type="text" 
              className="form-control" 
              value={data?.nid_number || ''} 
              readOnly 
              placeholder="e.g. 4652498843"
              style={{fontWeight: '700', letterSpacing: '2px', color: 'var(--accent-secondary)'}}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
