import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaTrash,FaDownload } from 'react-icons/fa';
import { FaFileMedical } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SavedNotices = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [language, setLanguage] = useState('en');
  //const [noticeContent, setNoticeContent] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  

  //useEffect(() => {
  //  if (!localStorage.getItem('token')) navigate('/login');
  //  fetch('http://127.0.0.1:8000/list_notices', {
  //    headers: {
  //      'Authorization': 'Bearer ' + localStorage.getItem('token'),
  //    },
  //  })
  //    .then(res => res.json())
  //    .then(data =>{
  //      if (Array.isArray(data)) {
  //        setNotices(data);
  //      } else {
  //        // If the API returns something else, we log a warning and use an empty array.
  //        console.warn("API response for notices was not an array. Received:", data);
  //        setNotices([]);
  //      }
  //      setIsLoading(false);
  //    })
  //    .catch(err => {
  //      console.error("Failed to fetch notices:", err);
  //      toast.error("Could not load saved notices.");
  //      setNotices([]); // Default to an empty array on error
  //      setIsLoading(false);
  //    });
  //}, [navigate]);

  useEffect(() => {
  if (!localStorage.getItem('token')) {
    navigate('/login');
    return; // Stop execution if not logged in
  }

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/list_notices', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Could not load saved notices.");
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchNotices();
}, [navigate]);

  //const handleView = (id) => {
  //  if (selectedNotice === id) {
  //  setSelectedNotice(null);
  //  setNoticeContent('');
  //} else {
  //  // Otherwise, open the new notice.
  //  setSelectedNotice(id);
  //  fetch(`http://127.0.0.1:8000/get_notice?id=${id}`, {
  //    headers: {
  //      'Authorization': 'Bearer ' + localStorage.getItem('token'),
  //    },
  //  })
  //    .then(res => res.json())
  //    .then(data => setNoticeContent(data.content || 'Error loading notice.'));
  //}
  //};

  const handleView = (noticeToSelect) => {
  // If clicking the same notice that's already open, close it.
  if (selectedNotice && selectedNotice.id === noticeToSelect.id) {
    setSelectedNotice(null);
  } else {
    // Otherwise, select the new notice and default the language to English.
    setSelectedNotice(noticeToSelect);
    setLanguage('en');
  }
};

  const handleDelete = async (noticeId) => {
    // Confirm with the user before deleting
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/delete_notice/${noticeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete notice.');
      }

      // Remove the notice from the local state to update the UI instantly
      setNotices(currentNotices => currentNotices.filter(n => n.id !== noticeId));
      
      // If the deleted notice was being viewed, close the content pane
      if (selectedNotice && selectedNotice.id === noticeId) {
        setSelectedNotice(null);
        //setNoticeContent('');
      }

      toast.success("Notice deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Could not delete the notice.");
    }
  };

  const handleDownload = async (noticeToDownload) => {
  setDownloadingId(noticeToDownload.id);

  // Determine which content to download
  // If the notice being downloaded is the one being viewed AND the language is set to Hindi, use the translated content.
  // Otherwise, default to the original English content.
  const contentToDownload = 
    (selectedNotice && selectedNotice.id === noticeToDownload.id && language === 'hi')
      ? noticeToDownload.translated_content
      : noticeToDownload.content;

  const languageToDownload = 
    (selectedNotice && selectedNotice.id === noticeToDownload.id && language === 'hi') ? 'hi' : 'en';

  try {
    const res = await fetch('http://127.0.0.1:8000/export_pdf', {
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
    a.download = `LegalNotice-${languageToDownload}.pdf`; // Dynamic filename
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Download started!");

  } catch (err) {
    toast.error(err.message || "Could not download PDF.");
  } finally {
    setDownloadingId(null);
  }
};


  if (isLoading) {
    return (
        <div className="saved-notices">
            <h2>Saved Notices</h2>
            <p>Loading notices...</p>
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="saved-notices">
          <h2>Saved Notices</h2>
          <p>Loading notices...</p>
      </div>
    );
  }

  // New Empty State
  if (notices.length === 0) {
  return (
    <div className="empty-state">
      <FaFileMedical size={70} className="empty-state-icon" />
      <h2>No Notices Yet</h2>
      <p>You haven't generated any legal notices. Get started now!</p>
      <Link to="/generate">
        <button className="btn--outline">Generate Your First Notice</button>
      </Link>
    </div>
    )
  }

  return (
    <div className="saved-notices">
      <h2>Saved Notices</h2>
      {notices.length === 0 && <p>No saved notices found.</p>}
      <ul>
        {notices.map(n => (
          <li key={n.id} style={{marginBottom: 10}}>
            <div>
              <span style={{ fontWeight: 'bold' }}>{n.title}</span>
              <br />
              <span style={{ color: '#aaa', fontSize: '0.8em' }}>{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className='button-group'>
              <button onClick={() => handleView(n)} className='view-btn'>
                {selectedNotice && selectedNotice.id === n.id ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button 
                onClick={() => handleDownload(n)} 
                className="download-btn"
                disabled={downloadingId === n.id} 
              >
                {downloadingId === n.id ? <div className="spinner-small"></div> : <FaDownload />}
              </button>
              <button onClick={() => handleDelete(n.id)} className="delete-btn">
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedNotice && (
        <div className="notice-content-box" style={{marginTop: 20, background: '#1a1a1a', padding: 20, borderRadius: 10}}>
          <h3>Notice Content:</h3>
            
          {/* Language Switcher */}
          <div style={{ marginBottom: '10px' }}>
            <button className='secondary-btn' onClick={() => setLanguage('en')} disabled={language === 'en'}>English</button>
            <button className='secondary-btn'
              onClick={() => setLanguage('hi')} 
              disabled={language === 'hi' || !selectedNotice.translated_content}
              style={{ marginLeft: '10px' }}
            >
              Hindi
            </button>
          </div>
            
          {/* Dynamic Content Display */}
          <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
            {language === 'en' ? selectedNotice.content : selectedNotice.translated_content}
          </pre>
        </div>
    )}
    </div>
  );
};

export default SavedNotices;
