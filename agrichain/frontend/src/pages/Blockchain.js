import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { getProductByBatch, getProduct } from '../services/api';
import ProductFeedback from '../components/ProductFeedback';

export default function Blockchain() {
  const { getBatchHistory } = useWeb3();
  const [scannedBatchId, setScannedBatchId] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async (batchId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/feedback/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('consumer-qr-reader', { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render((text) => {
        alert("Scanner Triggered!");
        scanner.clear();
        setShowScanner(false);
        try {
          const parts = text.split('/');
          const batchId = parts[parts.length - 1]; // Extract ID
          console.log("Scanned ID:", batchId);
          setScannedBatchId(batchId);
          triggerAutoScan(batchId);
        } catch (e) {
          alert('Invalid QR Format: ' + text);
        }
      }, (err) => { /* ignore */ });
      return () => { try { scanner.clear(); } catch(e){} };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner]);

  const triggerAutoScan = async (batchId) => {
    try {
        let dbData = null;
        try {
            // First try database lookup (Product may not be on local Ganache yet)
            const res = await getProductByBatch(batchId).catch(() => getProduct(batchId));
            if (res && res.data) {
                dbData = res.data;
            }
        } catch (err) {
            console.log("DB lookup failed");
        }

        const data = await getBatchHistory(batchId);
        
        if (data) {
            setScannedData(data);
            fetchReviews(batchId);
        } else if (dbData) {
            // Construct a blockchain-like object from DB data so the UI works
            setScannedData({
                id: dbData.batchNumber || dbData.id,
                cropType: dbData.name + " (" + dbData.category + ")",
                currentOwner: dbData.producerWallet || dbData.producerId || "0xDatabaseEntry",
                location: "DB Registered (Pending Block)",
                timestamp: Math.floor(new Date(dbData.harvestDate || Date.now()).getTime() / 1000)
            });
            fetchReviews(batchId);
        } else {
            setScannedData(null);
            setReviews([]);
            alert("No product found on the blockchain or database for ID: " + batchId);
        }
    } catch (e) {
        alert("Batch not found on Ethereum blockchain");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔗 Track/ Trace Product</h1>
      </div>

      {/* QR Scan Integration */}
      <div className="card glassmorphism" style={{marginTop: '2rem'}}>
        <h2 style={{color: '#1976d2', marginBottom: '1rem'}}>📱 QR Scan Blockchain Trace</h2>
        <p>Consumer physical and digital Traceability. Scan a product's QR label to securely verify its entire lifecycle via smart contract.</p>
        
        {!showScanner ? (
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
            <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
              📷 Scan Product QR
            </button>
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <span style={{color: '#94a3b8'}}>or</span>
              <input 
                type="text" 
                placeholder="Manual Batch ID" 
                value={scannedBatchId} 
                onChange={(e) => setScannedBatchId(e.target.value)}
                style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1'}}
              />
              <button className="btn btn-secondary" onClick={() => triggerAutoScan(scannedBatchId)}>Search</button>
            </div>
          </div>
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
                </div>
            </div>
        )}

        {scannedData && !showScanner && (
            <div style={{ marginTop: '2rem' }}>
              {reviews.length > 0 && (
                <div className="card glassmorphism" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginTop: 0, color: '#eab308' }}>Consumer Reviews</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map(rev => (
                      <div key={rev.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#eab308', fontSize: '1.2rem' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        {rev.comment && <p style={{ color: '#cbd5e1', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>"{rev.comment}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ProductFeedback batchId={scannedData.id} onReviewSubmitted={() => fetchReviews(scannedData.id)} />
            </div>
        )}
      </div>
    </div>
  );
}
