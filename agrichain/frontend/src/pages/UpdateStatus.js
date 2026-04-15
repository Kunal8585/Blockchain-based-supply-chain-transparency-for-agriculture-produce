import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';
import './Trace.css'; // Reusing trace styles for aesthetic consistency

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0xYourDeployedContractAddressHere";

export default function UpdateStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Auto-connect bypassing MetaMask
  useEffect(() => {
    const connectDirectly = async () => {
        try {
            const GANACHE_RPC = process.env.REACT_APP_GANACHE_URL || "http://127.0.0.1:7545";
            const provider = new ethers.JsonRpcProvider(GANACHE_RPC);
            const signer = await provider.getSigner(0); // Using first local account
            setWalletAddress(signer.address);
        } catch (err) {
            console.error("Direct connection failed", err);
            setMessage("Failed to connect to local blockchain provider.");
        }
    };
    connectDirectly();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newLocation) {
        setMessage("Please select or enter a valid location/status.");
        return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const GANACHE_RPC = process.env.REACT_APP_GANACHE_URL || "http://127.0.0.1:7545";
      const provider = new ethers.JsonRpcProvider(GANACHE_RPC);
      const signer = await provider.getSigner(0);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, signer);

      const tx = await contract.updateStatus(id, newLocation);
      setMessage("Transaction submitted. Waiting for confirmation...");
      
      await tx.wait(); // Wait for blockchain confirmation
      
      setMessage(`Success! Blockchain updated. TX: ${tx.hash}`);
      
      // Let the user view the trace after 3 seconds
      setTimeout(() => {
          navigate(`/trace/${id}`);
      }, 3000);

    } catch (err) {
      console.error(err);
      setMessage(err.reason || "Error updating status. Make sure your role is authorized.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trace-container">
      <div className="trace-card">
        <h1 className="trace-title">Update Logistics Status</h1>
        <p style={{textAlign: 'center', marginBottom: '2rem', color: '#94a3b8'}}>
            Updating blockchain record for <strong>Batch #{id}</strong>
        </p>

        {walletAddress && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#cbd5e1', textAlign: 'center' }}>
                Connected Wallet: <span style={{color: '#4ade80'}}>{walletAddress.substring(0,6)}...{walletAddress.substring(38)}</span>
            </div>
        )}

        <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: '#e2e8f0', fontWeight: 600}}>
                    New Location State
                </label>
                <select 
                    value={newLocation} 
                    onChange={e => setNewLocation(e.target.value)}
                    style={{
                        width: '100%', padding: '0.8rem', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #475569',
                        outline: 'none', fontSize: '1rem'
                    }}
                >
                    <option value="" disabled style={{color: 'black'}}>Select handling stage...</option>
                    <option value="In Transit - Outbound" style={{color: 'black'}}>🚚 In Transit - Outbound</option>
                    <option value="Warehouse - Received" style={{color: 'black'}}>🏢 Warehouse - Received</option>
                    <option value="Quality Inspection - Passed" style={{color: 'black'}}>✅ Quality Inspection - Passed</option>
                    <option value="Retail Center - Stocked" style={{color: 'black'}}>🏪 Retail Center - Stocked</option>
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                style={{
                    background: loading ? '#475569' : 'linear-gradient(to right, #4ade80, #3b82f6)',
                    color: 'white', border: 'none', padding: '1rem', borderRadius: '8px',
                    fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                {loading ? 'Executing Smart Contract...' : '⚡ Confirm on Blockchain'}
            </button>
        </form>

        {message && (
            <div style={{
                marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', textAlign: 'center',
                background: message.includes('Success') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: message.includes('Success') ? '#4ade80' : '#fca5a5',
                border: message.includes('Success') ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
            }}>
                {message}
            </div>
        )}
      </div>
    </div>
  );
}
