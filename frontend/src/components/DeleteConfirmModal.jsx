import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ employee, onConfirm, onCancel, loading }) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-body">
          <div className="delete-icon-wrap">
            <AlertTriangle size={32} />
          </div>

          <h3>Delete Employee</h3>
          <p className="delete-modal-text">
            Are you sure you want to delete <strong>{employee.name}</strong> ({employee.employee_id})?
          </p>
          <p className="delete-modal-sub">
            This action cannot be undone. All data associated with this employee will be permanently removed.
          </p>

          <div className="delete-actions">
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button className="btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Yes, Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
