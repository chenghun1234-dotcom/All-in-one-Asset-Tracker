"use client";

import React, { useState } from 'react';
import { useMarket } from './MarketContext';

export default function Home() {
  const { marketData, portfolio, addAsset, removeAsset, isLoading } = useMarket();
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ type: 'stock', symbol: '', amount: 1 });

  const calculateTotalUSD = () => {
    if (!marketData) return 0;
    const { stocks, crypto } = marketData.market;
    
    return portfolio.reduce((sum, item) => {
      let priceUSD = 0;
      if (item.type === 'stock') {
        priceUSD = stocks[item.symbol] || 0;
      } else {
        priceUSD = crypto[item.symbol.toUpperCase()] || 0;
      }
      return sum + (priceUSD * item.amount);
    }, 0);
  };

  const handleAdd = () => {
    addAsset(newAsset as any);
    setShowModal(false);
  };

  if (isLoading) return <div className="loading">Loading Finance Dashboard...</div>;

  return (
    <main style={{ padding: '40px 20px' }} className="animate-fade">
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '10px' }}>
          Asset Voyager
        </h1>
        <p style={{ opacity: 0.6 }}>Real-time cross-market tracker • Zero Cost Architecture</p>
      </header>

      <div className="dashboard-grid">
        {/* Summary Card */}
        <div className="glass asset-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
          <div className="asset-header">
            <h3>Total Estimated Assets</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
              1 USD = {marketData?.market.exchange_rate.toLocaleString()} KRW
            </span>
          </div>
          <div className="asset-value" style={{ fontSize: '3.5rem' }}>
            ${calculateTotalUSD().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add New Asset
            </button>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="glass asset-card" style={{ gridColumn: '1 / -1' }}>
          <h3>Portfolio Holdings</h3>
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '12px' }}>Symbol</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Price (USD)</th>
                  <th style={{ padding: '12px' }}>Value (USD)</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(item => {
                  const priceUSD = item.type === 'stock' 
                    ? marketData?.market.stocks[item.symbol] 
                    : marketData?.market.crypto[item.symbol.toUpperCase()];

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.symbol}</td>
                      <td style={{ padding: '12px', opacity: 0.7 }}>{item.type}</td>
                      <td style={{ padding: '12px' }}>{item.amount}</td>
                      <td style={{ padding: '12px' }}>${priceUSD?.toLocaleString() || 'N/A'}</td>
                      <td style={{ padding: '12px', color: 'var(--success)' }}>
                        ${((priceUSD || 0) * item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button 
                          onClick={() => removeAsset(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {portfolio.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                      No assets added yet. Click "+ Add New Asset" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Simplified */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Asset</h2>
            <div className="input-group">
              <label>Asset Type</label>
              <select 
                value={newAsset.type} 
                onChange={e => setNewAsset({...newAsset, type: e.target.value})}
              >
                <option value="stock">Stock</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>
            <div className="input-group">
              <label>Symbol (e.g. AAPL, BTC)</label>
              <input 
                type="text" 
                placeholder="AAPL" 
                value={newAsset.symbol}
                onChange={e => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="input-group">
              <label>Amount</label>
              <input 
                type="number" 
                value={newAsset.amount}
                onChange={e => setNewAsset({...newAsset, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>
                Save Asset
              </button>
              <button className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
