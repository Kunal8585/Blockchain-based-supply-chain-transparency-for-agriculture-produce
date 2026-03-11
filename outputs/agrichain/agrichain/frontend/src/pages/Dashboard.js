import React, { useEffect, useState } from 'react';
import { getProducers, getProducts, getShipments, validateChain } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ producers: 0, products: 0, shipments: 0, chainValid: null });

  useEffect(() => {
    Promise.all([getProducers(), getProducts(), getShipments(), validateChain()])
      .then(([p, pr, s, v]) => setStats({
        producers: p.data.length,
        products: pr.data.length,
        shipments: s.data.length,
        chainValid: v.data.valid
      }))
      .catch(() => {});
  }, []);

  const stages = ['🌾 Farm', '🏭 Warehouse', '🚚 Distributor', '🏪 Retailer'];

  return (
    <div>
      <div className="page-header">
        <h1>AgriChain Dashboard</h1>
        <p>Blockchain-based supply chain transparency for agriculture produce</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.producers}</div>
          <div className="stat-label">👨‍🌾 Producers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.products}</div>
          <div className="stat-label">🌽 Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.shipments}</div>
          <div className="stat-label">🚚 Shipments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{color: stats.chainValid ? '#2e7d32' : '#c62828'}}>
            {stats.chainValid === null ? '...' : stats.chainValid ? '✅' : '❌'}
          </div>
          <div className="stat-label">🔗 Chain Integrity</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{marginBottom: '1.5rem', color: '#2e7d32'}}>Supply Chain Flow</h2>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          {stages.map((stage, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '12px',
                padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: '#2e7d32'
              }}>{stage}</div>
              {i < stages.length - 1 && <div style={{fontSize: '1.5rem', color: '#2e7d32'}}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{marginBottom: '1rem', color: '#2e7d32'}}>How It Works</h2>
        <p style={{color: '#555', lineHeight: '1.8'}}>
          Each time a product moves through the supply chain, a new <strong>block</strong> is added
          to the chain with a SHA-256 hash linking to the previous block. This makes the
          journey of every agricultural produce <strong>tamper-proof and transparent</strong>.
        </p>
      </div>
    </div>
  );
}
