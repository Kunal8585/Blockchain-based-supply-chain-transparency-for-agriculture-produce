import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({ producers: 0, products: 0, shipments: 0, chainValid: true });

  useEffect(() => {
    const token = localStorage.getItem('agrichainToken');
    
    // Calling your Spring Boot Backend
    fetch('http://localhost:8080/api/stats/dashboard', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        setStats({
          producers: data.producers || 0,
          products: data.products || 0,
          shipments: data.shipments || 0,
          chainValid: true 
        });
    })
    .catch((err) => console.error("Dashboard fetch error:", err));
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

      <div className="card glassmorphism">
        <h2 style={{marginBottom: '1.5rem', color: '#1976d2'}}>🛡️ Smart Contract Data Interface</h2>
        <p style={{color: '#555', marginBottom: '1.5rem'}}>
          Live monitoring of <strong>AgriChain.sol</strong> deployed contract interactions. Real-time RBAC and SupplyChain events are securely verified here.
        </p>
        
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '300px', padding: '1rem', background: '#f5f7fa', borderRadius: '8px', borderLeft: '4px solid #1976d2'}}>
            <h3 style={{color: '#333'}}>Access Control (RBAC)</h3>
            <ul style={{listStyle: 'none', padding: 0, marginTop: '1rem', lineHeight: '1.8'}}>
              <li>🔐 <strong>Inspector:</strong> Wallet 0x8aF... verified</li>
              <li>👨‍🌾 <strong>Farmer:</strong> Wallet 0x3dC... registered</li>
              <li>🚚 <strong>Distributor:</strong> Pending Authorization</li>
            </ul>
          </div>
          
          <div style={{flex: 1, minWidth: '300px', padding: '1rem', background: '#f5f7fa', borderRadius: '8px', borderLeft: '4px solid #ff9800'}}>
            <h3 style={{color: '#333'}}>SupplyChain State</h3>
            <ul style={{listStyle: 'none', padding: 0, marginTop: '1rem', lineHeight: '1.8'}}>
              <li>🆔 <strong>produceId:</strong> #01452</li>
              <li>📍 <strong>origin:</strong> Pune, Maharashtra</li>
              <li>📦 <strong>currentLocation:</strong> Mumbai Warehouse</li>
              <li>✅ <strong>isInspected:</strong> True</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}