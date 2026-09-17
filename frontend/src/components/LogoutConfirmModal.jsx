import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content modal-sm" onClick={(event) => event.stopPropagation()}>
      <div className="delete-modal-body">
        <div className="logout-icon-wrap">
          <LogOut size={28} />
        </div>

        <h3>Log out</h3>
        <p className="delete-modal-text">Are you sure you want to log out?</p>
        <p className="delete-modal-sub">You will need to sign in again to access the dashboard.</p>

        <div className="delete-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>
            <LogOut size={16} />
            <span>Yes, log out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default LogoutConfirmModal;