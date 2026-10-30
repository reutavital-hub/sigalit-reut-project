import React, { useState } from 'react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'שם משתמש או סיסמה שגויים');
      }

      // שמירת הטוקן בזיכרון המקומי של הדפדפן
      localStorage.setItem('adminToken', data.token);

      // איפוס שדות, סגירת החלון ופתיחת דשבורד הניהול
      setUsername('');
      setPassword('');
      if (onLoginSuccess) onLoginSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>כניסת מנהלת</h2>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        {errorMsg && <div style={errorBannerStyle}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="הכניסי שם משתמש"
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכניסי סיסמה"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={submitButtonStyle}
          >
            {isLoading ? 'מתחברת...' : 'התחברי'}
          </button>
        </form>
      </div>
    </div>
  );
}

// עיצוב החלון
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  direction: 'rtl',
};

const modalStyle = {
  background: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '380px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: '#888',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '0.9rem',
  color: '#555',
  fontWeight: '500',
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '0.95rem',
  outline: 'none',
};

const submitButtonStyle = {
//   backgroundColor: '#2e7d32',
//   color: '#ffffff',
//   padding: '10px',
//   border: 'none',
//   borderRadius: '8px',
//   fontSize: '1rem',
//   cursor: 'pointer',
//   fontWeight: '600',
//   marginTop: '8px',
backgroundColor: 'var(--primary-teal, #1ea4a8)',
  color: '#ffffff',
  padding: '11px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '700',
  marginTop: '8px',
  transition: 'background-color 0.2s ease',
  boxShadow: '0 4px 10px rgba(30, 164, 168, 0.25)',
};

const errorBannerStyle = {
  backgroundColor: '#fde8e8',
  color: '#c81e1e',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  marginBottom: '14px',
  textAlign: 'center',
};