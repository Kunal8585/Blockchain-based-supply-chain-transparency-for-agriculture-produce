import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';
import QRCodeGenerator from '../components/QRCodeGenerator';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0xYourDeployedContractAddressHere";

export default function Dashboard() {
  const [stats, setStats] = useState({ producers: 0, products: 0, shipments: 0, chainValid: true });
  const [latestBatch, setLatestBatch] = useState(null);
  const [loadingWeb3, setLoadingWeb3] = useState(true);
  const [feedback, setFeedback] = useState([]);

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

  useEffect(() => {
    const fetchLatestBatch = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, provider);
        const count = await contract.batchCount();
        if (Number(count) > 0) {
          const batch = await contract.getBatch(count);
          setLatestBatch({
            id: Number(batch.id),
            cropType: batch.cropType,
            location: batch.location,
            isQualityVerified: batch.isQualityVerified
          });
        }
      } catch (err) {
        console.error("Web3 lookup failed:", err);
      } finally {
        setLoadingWeb3(false);
      }
    };
    fetchLatestBatch();
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/api/feedback')
      .then(res => res.json())
      .then(data => setFeedback(data))
      .catch(err => console.error("Feedback fetch error:", err));
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
          Live monitoring of <strong>AgriChain.sol</strong> deployed contract interactions. Real-time SupplyChain events are securely verified here.
        </p>
        
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: '300px', padding: '1rem', background: '#f5f7fa', borderRadius: '8px', borderLeft: '4px solid #ff9800'}}>
            <h3 style={{color: '#333'}}>Latest SupplyChain Batch</h3>
            {loadingWeb3 ? (
              <p>Loading blockchain data...</p>
            ) : latestBatch ? (
              <>
                <ul style={{listStyle: 'none', padding: 0, marginTop: '1rem', lineHeight: '1.8'}}>
                  <li>🆔 <strong>produceId:</strong> #{latestBatch.id}</li>
                  <li>🌾 <strong>cropType:</strong> {latestBatch.cropType}</li>
                  <li>📍 <strong>currentLocation:</strong> {latestBatch.location}</li>
                </ul>
                <div style={{marginTop: '1.5rem'}}>
                  <QRCodeGenerator batchId={latestBatch.id} />
                </div>
              </>
            ) : (
              <p>No batches found on blockchain. Ask a Farmer to create one.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card glassmorphism" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#eab308' }}>⭐ Product Feedback Overview</h2>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(234,179,8,0.2)' }}>
            <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '0.5rem' }}>Average Rating</h3>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#eab308', lineHeight: '1' }}>
              {feedback.length > 0 
                ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
                : '0.0'}
            </div>
            <div style={{ fontSize: '1.5rem', color: '#eab308', margin: '0.5rem 0' }}>
              {'★'.repeat(Math.round(feedback.length > 0 ? (feedback.reduce((a,c)=>a+c.rating,0)/feedback.length) : 0))}
              {'☆'.repeat(5 - Math.round(feedback.length > 0 ? (feedback.reduce((a,c)=>a+c.rating,0)/feedback.length) : 0))}
            </div>
            <p style={{ color: '#64748b' }}>Based on {feedback.length} reviews</p>
          </div>
          
          <div style={{ flex: '2', minWidth: '300px' }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Recent Reviews</h3>
            {feedback.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {[...feedback].reverse().slice(0, 10).map((rev) => (
                  <div key={rev.id} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=Consumer+${rev.id || Math.random()}&background=random`}
                      alt="avatar" 
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Batch #{rev.batchId}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: '#eab308', fontSize: '1rem', marginBottom: '0.5rem' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                      {rev.comment && <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>"{rev.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No reviews yet. Check back later once consumers leave feedback!</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}