import React from 'react';

const EditProductModal = ({ isOpen, onClose, onSubmit, formData, setFormData, selectedProduct }) => {
  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="modal-overlay" onClick={e => { if(e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-eyebrow">Editing Record</div>
          <h2 className="modal-title">Edit Product</h2>
          <p className="modal-sub">Updating details for <strong>{selectedProduct.prodcode}</strong>.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Product Code</label>
          <input className="form-input" value={formData.prodcode || ''} disabled />
          <div className="form-hint">Primary key — read-only.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <input className="form-input" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} />
        </div>
        {/* ADDED: Current Price Field */}
        <div className="form-group">
          <label className="form-label">Current Price (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={formData.current_price || ''} onChange={e => setFormData({...formData, current_price: e.target.value})} />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSubmit}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
