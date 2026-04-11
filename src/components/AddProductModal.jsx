import React, { useState } from 'react';
import { addProduct } from '../services/productService'; // Adjust path if needed

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  // Form State
  const [formData, setFormData] = useState({
    prodcode: '',
    description: '',
    unit: ''
  });

  // If the modal isn't supposed to be open, don't render anything
  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Set default status to ACTIVE upon creation
      await addProduct({ ...formData, record_status: 'ACTIVE' });
      
      // Reset form fields
      setFormData({ prodcode: '', description: '', unit: '' }); 
      
      // Call the success callback (this will close the modal and refresh the list in the parent)
      onSuccess(); 
    } catch (error) {
      alert("Error adding product. Check console for details.");
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Product</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Product Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. ITM-1006"
              value={formData.prodcode}
              onChange={(e) => setFormData({ ...formData, prodcode: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter product name"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit of Measurement</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. pcs, set, box"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={handleSubmit}>Save Product</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;