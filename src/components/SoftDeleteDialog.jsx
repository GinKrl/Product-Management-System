import React from 'react';

const SoftDeleteDialog = ({ isOpen, onClose, onSubmit, selectedProduct }) => {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="modal-overlay" onClick={e => { if(e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal-box">
        <div className="delete-head">
          <div className="delete-icon-wrap">🗑</div>
          <div>
            <div className="modal-eyebrow" style={{color:'#dc2626'}}>Soft Delete</div>
            <h2 className="modal-title" style={{fontSize:20}}>Deactivate Product?</h2>
          </div>
        </div>

        <div className="delete-detail">
          <div className="delete-detail-row">
            <span className="detail-key">Code</span>
            <span className="detail-val">{selectedProduct.prodcode}</span>
          </div>
          <div className="delete-detail-row">
            <span className="detail-key">Description</span>
            <span className="detail-val" style={{fontFamily:'DM Sans,sans-serif',fontSize:12}}>{selectedProduct.description}</span>
          </div>
          <div className="delete-detail-row">
            <span className="detail-key">Current Status</span>
            <span className="detail-val">{selectedProduct.record_status}</span>
          </div>
        </div>

        <div className="delete-warn">
          <span>⚠</span>
          <span>This is a <strong>soft delete</strong>. The record will be set to INACTIVE and remain in the database. Only Admins will see it.</span>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onSubmit}>Yes, Deactivate</button>
        </div>
      </div>
    </div>
  );
};

export default SoftDeleteDialog;
