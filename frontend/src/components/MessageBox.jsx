import React from 'react';
import './MessageBox.css'; // Optional: for styling

const MessageBox = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  // Choose styling based on success or error
  const isSuccess = type === 'success';

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.box, borderLeft: `6px solid ${isSuccess ? '#10b981' : '#ef4444'}` }}>
        <div style={styles.icon}>
          {isSuccess ? '✅' : '⚠️'}
        </div>
        <div style={styles.content}>
          <h4 style={styles.title}>{isSuccess ? 'Success' : 'Error'}</h4>
          <p style={styles.text}>{message}</p>
        </div>
        <button onClick={onClose} style={styles.button}>OK</button>
      </div>
    </div>
  );
};

// Simple inline styles so it works instantly without extra CSS files
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: '#ffffff',
    padding: '20px 25px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    maxWidth: '400px',
    width: '90%',
  },
  icon: {
    fontSize: '28px',
  },
  content: {
    flex: 1,
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default MessageBox;