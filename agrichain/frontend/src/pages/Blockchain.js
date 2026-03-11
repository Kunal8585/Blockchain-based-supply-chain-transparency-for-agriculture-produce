import React, { useState, useEffect } from 'react';
import { getBlockchain, validateChain, getProducts } from '../services/api';

export default function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [validity, setValidity] = useState(null);
  const [loaded, setLoaded] = useState(false);

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
    </div>
  );
}
