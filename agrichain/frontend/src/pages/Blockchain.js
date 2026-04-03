import React, { useState, useEffect } from 'react';
import { getBlockchain, validateChain, getProducts } from '../services/api';
import { useWeb3 } from '../hooks/useWeb3';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [validity, setValidity] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { connectWallet, address, getBatchHistory } = useWeb3();
  const [scannedBatchId, setScannedBatchId] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('consumer-qr-reader', { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render((text) => {
        scanner.clear();
        setShowScanner(false);
        try {
          const parts = text.split('/');
          const batchId = parts[parts.length - 1]; // Extract ID
          setScannedBatchId(batchId);
          triggerAutoScan(batchId);
        } catch (e) {
          alert('Invalid QR Format: ' + text);
        }
      }, (err) => { /* ignore */ });
      return () => { try { scanner.clear(); } catch(e){} };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner, products, address]);

  const triggerAutoScan = async (batchId) => {
    if (!address) await connectWallet().catch(()=>{});
    try {
        const data = await getBatchHistory(batchId);
        setScannedData(data);
        const matched = products.find(p => p.batchNumber === batchId || String(p.id) === batchId);
        if (matched) {
            setSelectedProduct(matched.id);
            const r = await getBlockchain(matched.id);
            setBlocks(r.data); setLoaded(true);
        }
    } catch (e) {
        alert("Batch not found on Ethereum blockchain");
    }
  };

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
        <p>Consumer Phygital Traceability. Scan a product's QR label to securely verify its entire lifecycle via smart contract.</p>
        
        {!showScanner ? (
          <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
            📷 Scan Product QR
          </button>
        ) : (
          <div style={{marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px', maxWidth: '400px'}}>
            <div id="consumer-qr-reader" style={{width: '100%'}}></div>
            <button className="btn btn-danger" style={{marginTop: '1rem'}} onClick={() => setShowScanner(false)}>Cancel Scan</button>
          </div>
        )}

        {scannedData && !showScanner && (
            <div style={{marginTop: '1.5rem', padding: '1.5rem', background: '#f5f7fa', borderLeft: '4px solid #2e7d32', borderRadius: '8px'}}>
                <h3 style={{color: '#2e7d32', marginTop: 0}}>Verified Web3 Batch Data</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <p><strong>Batch ID:</strong> #{scannedData.id}</p>
                    <p><strong>Crop Type:</strong> {scannedData.cropType}</p>
                    <p><strong>Current Owner:</strong> <span style={{fontSize: '0.85rem'}}>{scannedData.currentOwner}</span></p>
                    <p><strong>Origin Location:</strong> {scannedData.location}</p>
                    <p><strong>Harvest Time:</strong> {new Date(scannedData.timestamp * 1000).toLocaleString()}</p>
                    <p><strong>Inspector Verified:</strong> {scannedData.isQualityVerified ? '✅ Yes' : '⏳ Pending'}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
