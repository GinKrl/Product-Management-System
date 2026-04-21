import React, { useState } from 'react';
import { addPriceEntry } from '../services/priceHistService';

const AddPriceEntryForm = ({ productId, onSuccess }) => {
  const [formData, setFormData] = useState({ effDate: '', unitPrice: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPriceEntry({
        prodcode: productId,
        effDate: formData.effDate,
        unitPrice: Number(formData.unitPrice)
      });
      setFormData({ effDate: '', unitPrice: '' });
      if (onSuccess) onSuccess(); // Refresh the history list
    } catch (error) {
      alert("Failed to add price entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>Effective Date</label>
        <input 
          type="date" 
          required
          value={formData.effDate}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          onChange={(e) => setFormData({...formData, effDate: e.target.value})}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666' }}>New Price (₱)</label>
        <input 
          type="number" 
          step="0.01" 
          required
          placeholder="0.00"
          value={formData.unitPrice}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          marginTop: '5px',
          padding: '10px', 
          background: '#b91c1c', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Saving...' : 'Add Price Entry'}
      </button>
    </form>
  );
};

export default AddPriceEntryForm;