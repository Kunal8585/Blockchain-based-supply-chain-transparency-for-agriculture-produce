import React, { useState, useEffect } from 'react';
import { getBlockchain, validateChain, getProducts } from '../services/api';
import { useWeb3 } from '../hooks/useWeb3';

export default function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [validity, setValidity] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { connectWallet, address, getBatchHistory } = useWeb3();
  const [scannedBatchId, setScannedBatchId] = useState('');
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    getProducts().then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const loadChain = async () => {
    if (!selectedProduct) return;
    try {
      const r = await getBlockchain(selectedProduct);
      setBlocks(r.data); setLoaded(true);
    } catch { setBlocks([]); setLoaded(true); }
  };

  const checkValidity = async () => {
    const r = await validateChain();
    setValidity(r.data.valid);
  };

  const parseData = (data) => {
    try {
      const obj = JSON.parse(data);
      return (obj.stage || '') + ' | ' + (obj.fromLocation || '') + ' → ' + (obj.toLocation || '') + ' | by ' + (obj.handledBy || '');
    } catch { return data; }
  };

  const handleQRScan = async () => {
    if (!address) await connectWallet();
    if (scannedBatchId) {
        try {
            const data = await getBatchHistory(scannedBatchId);
            setScannedData(data);
        } catch (e) {
            alert("Batch not found on Ethereum blockchain");
        }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔗 Blockchain Ledger</h1>
        <p>Immutable SHA-256 linked chain of supply chain events</p>
      </div>
      <div className="card" style={{display:'flex',gap:'1rem',alignItems:'flex-end',flexWrap:'wrap'}}>
        <div className="form-group" style={{flex:1,minWidth:'200px'}}>
          <label>Select Product to view its chain</label>
          <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)}>
            <option value="">-- Select Product --</option>
            {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.batchNumber})</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={loadChain}>View Chain</button>
        <button className="btn btn-secondary" onClick={checkValidity}>Validate Entire Chain</button>
      </div>
      {validity !== null && (
        <div className={`alert alert-${validity ? 'success' : 'error'}`}>
          {validity ? '✅ Blockchain is valid — all hashes verified!' : '❌ Chain integrity compromised!'}
        </div>
      )}
      {loaded && blocks.length === 0 && (
        <div className="card"><div className="empty-state"><div className="empty-icon">🔗</div>No blocks found for this product</div></div>
      )}
      {blocks.length > 0 && (
        <div className="block-chain">
          {blocks.map((block, i) => (
            <div key={block.id}>
              <div className="block">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                  <span className="block-index">Block #{block.index}</span>
                  <span style={{fontSize:'0.8rem',color:'#888'}}>{new Date(block.timestamp).toLocaleString()}</span>
                </div>
                <div className="block-data">📦 {parseData(block.data)}</div>
                <div style={{marginTop:'0.5rem'}}>
                  <div style={{fontSize:'0.75rem',color:'#888'}}>Hash:</div>
                  <div className="block-hash">{block.hash}</div>
                </div>
                {block.previousHash !== '0000000000000000' && (
                  <div style={{marginTop:'0.3rem'}}>
                    <div style={{fontSize:'0.75rem',color:'#888'}}>Previous Hash:</div>
                    <div className="block-hash">{block.previousHash}</div>
                  </div>
                )}
              </div>
              {i < blocks.length - 1 && (
                <div style={{textAlign:'center',fontSize:'1.5rem',color:'#2e7d32',lineHeight:'1'}}>↓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Scan Integration */}
      <div className="card glassmorphism" style={{marginTop: '2rem'}}>
        <h2 style={{color: '#1976d2', marginBottom: '1rem'}}>📱 QR Scan Blockchain Trace</h2>
        <p>Mock QR scanner for Consumers. Enter a Produce Batch ID to fetch direct smart-contract lifecycle events.</p>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <input type="text" placeholder="Enter Batch ID (e.g. 1)" value={scannedBatchId} onChange={e => setScannedBatchId(e.target.value)} style={{flex: 1, padding: '0.5rem'}}/>
            <button className="btn btn-primary" onClick={handleQRScan}>Scan & Verify 🔎</button>
        </div>
        {scannedData && (
            <div style={{marginTop: '1.5rem', padding: '1rem', background: '#e8f5e9', border: '1px solid #2e7d32', borderRadius: '4px'}}>
                <h4 style={{color: '#2e7d32'}}>Verified Web3 Batch Data</h4>
                <p><strong>Batch ID:</strong> {scannedData.id}</p>
                <p><strong>Crop Type:</strong> {scannedData.cropType}</p>
                <p><strong>Current Owner:</strong> {scannedData.currentOwner}</p>
                <p><strong>Location:</strong> {scannedData.location}</p>
                <p><strong>Timestamp:</strong> {scannedData.timestamp}</p>
                <p><strong>Inspector Verified:</strong> {scannedData.isQualityVerified ? '✅ Yes' : '⏳ Pending'}</p>
            </div>
        )}
      </div>
    </div>
  );
}
