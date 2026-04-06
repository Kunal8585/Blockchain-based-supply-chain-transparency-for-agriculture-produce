import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { Html5QrcodeScanner } from 'html5-qrcode';

import { getProductByBatch, getProduct } from '../services/api';

export default function Blockchain() {
  const { getBatchHistory } = useWeb3();
  const [scannedBatchId, setScannedBatchId] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

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
        } else if (dbData) {
            // Construct a blockchain-like object from DB data so the UI works
            setScannedData({
                id: dbData.batchNumber || dbData.id,
                cropType: dbData.name + " (" + dbData.category + ")",
                currentOwner: dbData.producerWallet || dbData.producerId || "0xDatabaseEntry",
                location: "DB Registered (Pending Block)",
                timestamp: Math.floor(new Date(dbData.harvestDate || Date.now()).getTime() / 1000),
                isQualityVerified: dbData.status === 'DELIVERED'
            });
        } else {
            setScannedData(null);
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
        <p>Consumer Phygital Traceability. Scan a product's QR label to securely verify its entire lifecycle via smart contract.</p>
        
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
                    <p><strong>Inspector Verified:</strong> {scannedData.isQualityVerified ? '✅ Yes' : '⏳ Pending'}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
