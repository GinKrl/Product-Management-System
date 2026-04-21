import React, { useState, useEffect, useRef } from 'react';
import { getPriceHistory } from '../services/priceHistService';
import AddPriceEntryForm from './AddPriceEntryForm';

const PriceHistoryPanel = ({ prodcode, isAdmin, onClose }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toastTimer = useRef(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getPriceHistory(prodcode);
      // Requirement: Sort newest effDate first
      const sorted = (data || []).sort((a, b) => new Date(b.effDate) - new Date(a.effDate));
      setHistory(sorted);
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    return () => clearTimeout(toastTimer.current);
  }, [prodcode]);

  return (
    <div className="php-panel">
      <style>{`
        .php-panel {
          background: #ffffff;
          border-top: 2px solid #e11d48;
          animation: phpSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        @keyframes phpSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .php-inner {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .php-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .php-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .php-eyebrow {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #e11d48;
          background: #fff1f2;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .php-title {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
        }

        .php-close-btn {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .php-close-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .php-body {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .php-body { grid-template-columns: 1fr; }
        }

        .php-table-wrap {
          background: #fff;
          border: 1px solid #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
        }

        .php-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .php-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
        }

        .php-table td {
          padding: 14px 16px;
          border-top: 1px solid #f3f4f6;
          color: #374151;
        }

        .php-price-tag {
          font-family: 'DM Mono', monospace;
          font-weight: 700;
          color: #1d4ed8;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .latest-badge {
          font-size: 9px;
          background: #dcfce7;
          color: #15803d;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          margin-left: 8px;
        }

        .php-form-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          position: sticky;
          top: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .php-form-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1f2937;
        }

        .php-form-title-dot {
          width: 8px;
          height: 8px;
          background: #e11d48;
          border-radius: 50%;
        }
      `}</style>

      <div className="php-inner">
        <header className="php-header">
          <div className="php-heading">
            <span className="php-eyebrow">Inventory Insight</span>
            <span className="php-title">History Trace: {prodcode}</span>
          </div>
          <button className="php-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
        </header>

        <div className="php-body">
          <div className="php-table-wrap">
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                Fetching historical data...
              </div>
            ) : history.length > 0 ? (
              <table className="php-table">
                <thead>
                  <tr>
                    <th>Effective Date</th>
                    <th>Price Point</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Date(row.effDate).toLocaleDateString('en-PH', { dateStyle: 'long' })}</td>
                      <td><span className="php-price-tag">₱{(Number(row.unitPrice)).toLocaleString()}</span></td>
                      <td>{idx === 0 ? <span className="latest-badge">Current</span> : <span style={{color: '#9ca3af', fontSize: '11px'}}>Archive</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                No records found for this product.
              </div>
            )}
          </div>

          {/* Requirement: Only ADMIN/SUPERADMIN can add entries */}
          {isAdmin && (
            <aside className="php-form-card">
              <div className="php-form-title">
                <span className="php-form-title-dot" />
                Update Pricing
              </div>
              <AddPriceEntryForm 
                productId={prodcode} 
                onSuccess={fetchHistory} 
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryPanel;