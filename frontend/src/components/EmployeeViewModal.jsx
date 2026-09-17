import React from 'react';
import { X, Mail, Phone, Building2, Briefcase, IndianRupee, Calendar, Hash, UserCheck } from 'lucide-react';

const EmployeeViewModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalaryINR = (val) => {
    const salaryRange = String(val ?? '').trim() || '0';
    return salaryRange
      .split('-')
      .map((amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Number(amount.trim())))
      .join(' - ');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-avatar">
              {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div>
              <h3>{employee.name}</h3>
              <span className="modal-badge">{employee.designation}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">
                <Hash size={15} />
                <span>Employee ID</span>
              </div>
              <div className="detail-value highlight">{employee.employee_id}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Building2 size={15} />
                <span>Department</span>
              </div>
              <div className="detail-value">{employee.department}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Mail size={15} />
                <span>Email Address</span>
              </div>
              <div className="detail-value">{employee.email}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Phone size={15} />
                <span>Phone Number</span>
              </div>
              <div className="detail-value">{employee.phone}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Briefcase size={15} />
                <span>Designation</span>
              </div>
              <div className="detail-value">{employee.designation}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <IndianRupee size={15} />
                <span>Annual Salary (Rs)</span>
              </div>
              <div className="detail-value salary">{formatSalaryINR(employee.salary)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Calendar size={15} />
                <span>Joining Date</span>
              </div>
              <div className="detail-value">{formatDate(employee.joining_date)}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <UserCheck size={15} />
                <span>Record Created</span>
              </div>
              <div className="detail-value">{formatDate(employee.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeViewModal;
