import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function PdfUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF document.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('pdf', file);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await axios.post(`${API_URL}/api/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data.data);
      // Create a blob mapping for CSV download
      const csvStr = response.data.csv;
      if (csvStr) {
        // Prepend the UTF-8 BOM (\uFEFF) so Excel knows it's UTF-8 and renders Bangla correctly
        const blob = new Blob(['\ufeff', csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF. The service might be down or the PDF format is unsupported.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="white-card">
      <div 
        className={`dropzone ${file ? 'active' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileDrop} 
          accept="application/pdf" 
          className="file-input" 
        />
        {file ? (
          <>
            <FileText size={48} className="dropzone-icon" />
            <h3 style={{color: 'var(--accent-primary)'}}>{file.name}</h3>
            <p style={{color: 'var(--text-muted)'}}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        ) : (
          <>
            <UploadCloud size={48} className="dropzone-icon" />
            <h3 style={{color: 'var(--primary-blue)'}}>ভোটার পিডিএফ ড্রপ করুন</h3>
            <p style={{color: 'var(--text-light)'}}>স্ক্যান করা বা টেক্সট পিডিএফ থেকে ডাটা আলাদা করুন</p>
          </>
        )}
      </div>

      {error && (
        <div style={{color: '#ef4444', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{marginTop: '2rem', textAlign: 'center'}}>
        <button 
          className="btn btn-primary" 
          onClick={handleUpload} 
          disabled={!file || loading}
        >
          {loading ? (
            <><span className="loader"></span> প্রসেসিং...</>
          ) : (
            'তথ্য সংগ্রহ করুন (Extract Data)'
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{marginTop: '3rem', animation: 'fade-in 0.5s ease-out'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0}}>
              <CheckCircle size={20} color="var(--accent-primary)" /> {results.length} টি তথ্য পাওয়া গেছে
            </h3>
            {downloadLink && (
              <a href={downloadLink} download="voter_list.csv" className="btn btn-outline" style={{padding: '0.6rem 1.2rem', width: 'auto', flexGrow: 0}}>
                <Download size={18} /> ডাউনলোড (CSV)
              </a>
            )}
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Voter ID</th>
                  <th>Father's Name</th>
                  <th>Mother's Name</th>
                  <th>DOB</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 50).map((r, idx) => (
                  <tr key={idx}>
                    <td><span className="badge">{r.serial_number || '-'}</span></td>
                    <td>{r.name || '-'}</td>
                    <td><strong style={{color: 'var(--accent-secondary)'}}>{r.voter_id || '-'}</strong></td>
                    <td>{r.father_name || '-'}</td>
                    <td>{r.mother_name || '-'}</td>
                    <td>{r.date_of_birth || '-'}</td>
                    <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}} title={r.address}>{r.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 50 && (
               <div style={{padding: '1rem', textAlign: 'center', color: 'var(--text-muted)'}}>
                 Showing first 50 results. Download to see all.
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
