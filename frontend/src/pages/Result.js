import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { noticeType, formData, notice } = location.state || {};
  const [editedNotice, setEditedNotice] = useState(notice || '');
  // const [saveMsg, setSaveMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

  const [language, setLanguage] = useState('en'); 
  const [translatedNotice, setTranslatedNotice] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

   const BASE_URL = 'https://legal-ease-ai-backend.onrender.com'; 

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
  }, [navigate]);


  const handleTranslate = async () => {
    if (language === 'hi' && translatedNotice) {
      
      return;
    }
    setIsTranslating(true);
    try {

      const res = await fetch(`${BASE_URL}/translate_text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ text: editedNotice, target_language: 'hi' }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const data = await res.json();
      
      setTranslatedNotice(data.translated_text || 'Translation result would appear here.');
      setLanguage('hi'); 
      toast.success('Translated to Hindi!');
    } catch (err) {
      toast.error('Failed to translate.');
      
      setTranslatedNotice(`[Hindi Translation of: "${editedNotice}"]`);
      setLanguage('hi');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextChange = (e) => {
    if (language === 'en') {
      setEditedNotice(e.target.value);
    } else {
      setTranslatedNotice(e.target.value);
    }
  };

  //const handleEdit = (e) => setEditedNotice(e.target.value);

  const handleSave = async () => {
    // setSaveMsg('');
    try {
      const res = await fetch(`${BASE_URL}/save_notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          title: noticeType === 'other' ? (formData?.customIssue?.slice(0, 30) || 'Custom Notice') : noticeType,
          content: editedNotice,
          translated_content: translatedNotice,
        }),
      });
      await res.json();
      if (!res.ok) throw new Error("Failed to save.");
      toast.success('Notice saved successfully!'); 
    } catch (err) {
      toast.error('Failed to save notice.'); 
    }
  };


  const handleDownload = async () => {
    setDownloading(true);
    const contentToDownload = language === 'en' ? editedNotice : translatedNotice;
    try {
      const res = await fetch(`${BASE_URL}/export_pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ notice: contentToDownload }),
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LegalNotice-${language}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download starting!');
    } catch (err) {
      toast.error('Failed to download PDF.');
    }
    setDownloading(false);
  };

  return (
    <div className="result">
      <h2>Your Generated Legal Notice</h2>
      <div className="notice-preview">
        <p><strong>Type:</strong> {noticeType}</p>
        <p><strong>Name:</strong> {formData?.name}</p>
        <hr />
        <div>
          <strong>Edit Your Notice:</strong>
          {/* --- Language switcher buttons --- */}
          <div style={{ margin: '10px 0' }}>
            <button className='secondary-btn' onClick={() => setLanguage('en')} disabled={language === 'en'}>English</button>
            <button className='secondary-btn' onClick={handleTranslate} disabled={language === 'hi' || isTranslating} style={{ marginLeft: '10px' }}>
              {isTranslating ? 'Translating...' : 'Translate to Hindi'}
            </button>
          </div>
        </div>
        <textarea
          value={language === 'en' ? editedNotice : translatedNotice}
          onChange={handleTextChange}
          rows={15}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '1rem' }}
          placeholder={isTranslating ? 'Please wait...' : 'Your notice will appear here.'}
        />
      </div>
      <button className="secondary-btn" onClick={handleDownload} disabled={downloading}>
        {downloading && <div className="spinner"></div>}
        {downloading ? 'Downloading...' : `Download as PDF (${language.toUpperCase()})`}
      </button>
      <button className="secondary-btn" onClick={handleSave} style={{marginLeft: '1rem'}}>Save Edited Notice</button>
      <Link to="/generate" style={{display: 'block', marginTop: '2rem'}}>Generate Another</Link>
    </div>
  );
};

export default Result; 