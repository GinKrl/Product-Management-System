import React from 'react';

const AddProductModal = ({ isOpen, onClose, onSubmit, formData, setFormData }) => {
    
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if(e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-eyebrow">New Entry</div>
          <h2 className="modal-title">Add Product</h2>
          <p className="modal-sub">Fill in the details to register a new product in the catalog.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Product Code</label>
          <input className="form-input" value={formData.prodcode || ''} onChange={e => setFormData({...formData, prodcode: e.target.value})} placeholder="e.g. PRD-006" />
          <div className="form-hint">Unique identifier — cannot be changed after creation.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Mechanical Keyboard" />
        </div>
        <div className="form-group">
          <label className="form-label">Unit</label>
          <input className="form-input" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. pcs, roll, box" />
        </div>
        {/* ADDED: Current Price Field */}
        <div className="form-group">
          <label className="form-label">Current Price (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={formData.current_price || ''} onChange={e => setFormData({...formData, current_price: e.target.value})} placeholder="0.00" />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSubmit}>Save Product</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;