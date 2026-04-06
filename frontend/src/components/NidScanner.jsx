import { useState, useRef } from 'react';
import axios from 'axios';
import { Camera, Image as ImageIcon, ScanText, FileCheck2, User, CalendarDays, Hash, MapPin, Droplet } from 'lucide-react';

export default function NidScanner() {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  
  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraSide, setCameraSide] = useState(null); // 'front' or 'back'
  const [videoStream, setVideoStream] = useState(null);
  
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleCapture = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setBackImage(file);
        setBackPreview(URL.createObjectURL(file));
      }
      setError('');
      setData(null);
    }
  };

  const handleScan = async () => {
    if (!frontImage && !backImage) {
      setError('Please upload at least one side of the NID.');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    if (frontImage) formData.append('front', frontImage);
    if (backImage) formData.append('back', backImage);

    try {
      const response = await axios.post('http://localhost:5000/api/extract-nid', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to scan NID. Ensure the images are clear and well-lit.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearImage = (side) => {
    if (side === 'front') {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
    setData(null);
  };

  const openCamera = async (side) => {
    setCameraSide(side);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: side === 'back' ? 'environment' : 'user' } 
      });
      setVideoStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setError('Camera access denied or not available.');
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setVideoStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture_${cameraSide}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(file);
        
        if (cameraSide === 'front') {
          setFrontImage(file);
          setFrontPreview(previewUrl);
        } else {
          setBackImage(file);
          setBackPreview(previewUrl);
        }
        closeCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="grid-2">
      {/* Scanner Control Panel */}
      <div className="white-card" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
            <ScanText className="brand-icon" /> এনআইডি স্ক্যানার (NID Scanner)
          </h2>
          <h3 style={{color: 'var(--primary-blue)'}}>এনআইডি আপলোড করুন</h3>
          <p style={{color: 'var(--text-light)'}}>অনুগ্রহ করে আপনার এনআইডি কার্ডের সামনের এবং পিছনের ছবি আপলোড করুন।</p>
        </div>

        <div className="nid-upload-grid">
          {/* Front Side */}
          <div className="upload-section">
            <h4 style={{marginBottom: '0.5rem', fontSize: '0.9rem'}}>সামনের দিক (Front)</h4>
            {frontPreview ? (
              <div style={{position: 'relative'}}>
                <img src={frontPreview} alt="Front Preview" className="preview-image" style={{height: 'clamp(100px, 20vh, 150px)', width: '100%', objectFit: 'cover'}}/>
                <button 
                  className="btn btn-outline" 
                  style={{position: 'absolute', top: '5px', right: '5px', padding: '2px 8px', fontSize: '10px', background: 'rgba(0,0,0,0.5)'}}
                  onClick={() => clearImage('front')}
                >
                  মুছুন
                </button>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <div 
                  className="dropzone"
                  onClick={() => openCamera('front')}
                  style={{padding: '1rem', minHeight: '130px', flex: 1}}
                >
                  <Camera size={24} className="dropzone-icon" />
                  <p style={{fontSize: '0.75rem'}}>ক্যামেরা</p>
                </div>
                <div 
                  className="dropzone"
                  onClick={() => frontInputRef.current.click()}
                  style={{padding: '1rem', minHeight: '130px', flex: 1, background: 'white'}}
                >
                  <ImageIcon size={24} className="dropzone-icon" style={{color: 'var(--text-light)'}} />
                  <p style={{fontSize: '0.75rem'}}>আপলোড</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" ref={frontInputRef} onChange={(e) => handleCapture(e, 'front')} className="file-input" />
          </div>

          {/* Back Side */}
          <div className="upload-section">
            <h4 style={{marginBottom: '0.5rem', fontSize: '0.9rem'}}>পিছনের দিক (Back)</h4>
            {backPreview ? (
              <div style={{position: 'relative'}}>
                <img src={backPreview} alt="Back Preview" className="preview-image" style={{height: 'clamp(100px, 20vh, 150px)', width: '100%', objectFit: 'cover'}}/>
                <button 
                  className="btn btn-outline" 
                  style={{position: 'absolute', top: '5px', right: '5px', padding: '2px 8px', fontSize: '10px', background: 'rgba(0,0,0,0.5)'}}
                  onClick={() => clearImage('back')}
                >
                  মুছুন
                </button>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <div 
                  className="dropzone"
                  onClick={() => openCamera('back')}
                  style={{padding: '1rem', minHeight: '130px', flex: 1}}
                >
                  <Camera size={24} className="dropzone-icon" />
                  <p style={{fontSize: '0.75rem'}}>ক্যামেরা</p>
                </div>
                <div 
                  className="dropzone"
                  onClick={() => backInputRef.current.click()}
                  style={{padding: '1rem', minHeight: '130px', flex: 1, background: 'white'}}
                >
                  <ImageIcon size={24} className="dropzone-icon" style={{color: 'var(--text-light)'}} />
                  <p style={{fontSize: '0.75rem'}}>আপলোড</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" ref={backInputRef} onChange={(e) => handleCapture(e, 'back')} className="file-input" />
          </div>
        </div>

        {error && (
          <div style={{color: '#ef4444', padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.9rem'}}>
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={handleScan}
          disabled={(!frontImage && !backImage) || loading}
          style={{marginTop: 'auto'}}
        >
          {loading ? <><span className="loader"></span> তথ্য সংগ্রহ করা হচ্ছে...</> : 'তথ্য সংগ্রহ করুন (Extract Details)'}
        </button>
      </div>

      {/* Data Form Panel */}
      <div className="white-card">
        <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
          <FileCheck2 color="var(--primary-blue)" /> সংরক্ষিত তথ্য (Verified Details)
        </h2>

        <form className="nid-form-grid">
          <div className="form-group span-2">
             <label className="form-label"><User size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> নাম (ইংরেজি)</label>
             <input type="text" className="form-control" name="name" value={data?.name || ''} onChange={handleInputChange} placeholder="e.g. TASMIA AKTER" />
          </div>

          <div className="form-group">
            <label className="form-label">নাম (বাংলা)</label>
            <input type="text" className="form-control" name="name_bn" value={data?.name_bn || ''} onChange={handleInputChange} placeholder="e.g. তাসমিয়া আক্তার" />
          </div>

          <div className="form-group">
            <label className="form-label">পিতা/স্বামী</label>
            <input type="text" className="form-control" name="father_name" value={data?.father_name || ''} onChange={handleInputChange} placeholder="পিতার নাম" />
          </div>

          <div className="form-group">
            <label className="form-label">মাতা</label>
            <input type="text" className="form-control" name="mother_name" value={data?.mother_name || ''} onChange={handleInputChange} placeholder="মাতার নাম" />
          </div>

          <div className="form-group">
            <label className="form-label"><CalendarDays size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> জন্ম তারিখ</label>
            <input type="text" className="form-control" name="date_of_birth" value={data?.date_of_birth || ''} onChange={handleInputChange} placeholder="e.g. 11 Jan 1992" />
          </div>

          <div className="form-group span-2">
            <label className="form-label"><Hash size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> এনআইডি নম্বর</label>
            <input 
              type="text" 
              className="form-control" 
              name="nid_number"
              value={data?.nid_number || ''} 
              onChange={handleInputChange}
              placeholder="আইডি নম্বর"
              style={{fontWeight: '700', letterSpacing: '2px', color: 'var(--accent-secondary)'}}
            />
          </div>

          <div className="form-group span-2">
            <label className="form-label"><MapPin size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> ঠিকানা</label>
            <textarea 
              className="form-control" 
              name="address"
              value={data?.address || ''} 
              onChange={handleInputChange}
              placeholder="বর্তমান ঠিকানা"
              style={{minHeight: '60px', resize: 'none'}}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label"><Droplet size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> রক্তে গ্রুপ</label>
            <input type="text" className="form-control" name="blood_group" value={data?.blood_group || ''} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label className="form-label">জন্মস্থান (Place of Birth)</label>
            <input type="text" className="form-control" name="place_of_birth" value={data?.place_of_birth || ''} onChange={handleInputChange} placeholder="যেমন: ঢাকা" />
          </div>
        </form>
      </div>
      {/* Camera Modal Overlay */}
      {isCameraOpen && (
        <div className="camera-overlay">
          <div className="camera-content">
            <div className="camera-header">
              <span>{cameraSide === 'front' ? 'সামনের দিক' : 'পিছনের দিক'} স্ক্যান করুন</span>
              <button onClick={closeCamera} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem'}}>✕</button>
            </div>
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="scan-frame"></div>
              <div className="scan-line"></div>
            </div>
            <div className="camera-controls">
              <button className="capture-btn" onClick={capturePhoto}>
                <div className="inner-circle"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for snapshotting */}
      <canvas ref={canvasRef} style={{display: 'none'}} />

      <style>{`
        .camera-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .camera-content {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .camera-header {
          display: flex;
          justify-content: space-between;
          color: white;
          font-weight: 700;
          align-items: center;
        }
        .video-container {
          position: relative;
          aspect-ratio: 4/3;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--accent-blue);
        }
        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .scan-frame {
          position: absolute;
          inset: 30px;
          border: 2px solid rgba(255,255,255,0.5);
          border-radius: 8px;
          pointer-events: none;
        }
        .scan-line {
          position: absolute;
          top: 30px;
          left: 30px;
          right: 30px;
          height: 2px;
          background: var(--accent-blue);
          box-shadow: 0 0 10px var(--accent-blue);
          animation: scan 3s linear infinite;
        }
        @keyframes scan {
          0% { top: 30px; }
          100% { top: calc(100% - 30px); }
        }
        .camera-controls {
          display: flex;
          justify-content: center;
          padding: 1rem;
        }
        .capture-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: white;
          padding: 5px;
          border: 4px solid var(--primary-blue);
          cursor: pointer;
        }
        .inner-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #3b82f6;
          transition: transform 0.1s;
        }
        .capture-btn:active .inner-circle {
          transform: scale(0.9);
        }
      `}</style>
    </div>
  );
}
