import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import AgriChainArtifact from '../artifacts/AgriChain.json';
import './Trace.css';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GANACHE_RPC = "http://127.0.0.1:7545";

const ROLES = ["None", "Admin", "Farmer", "Distributor", "Inspector", "Retailer"];

const Trace = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        // Connect to local Ganache network for read-only access (consumer view, NO metamask)
        const provider = new ethers.JsonRpcProvider(GANACHE_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainArtifact.abi, provider);

        const batchData = await contract.getBatch(id);
        if (Number(batchData.id) === 0) {
          setError("Batch not found on the blockchain.");
          setLoading(false);
          return;
        }

        setBatch({
          id: Number(batchData.id),
          cropType: batchData.cropType,
          currentOwner: batchData.currentOwner,
          location: batchData.location,
          timestamp: Number(batchData.timestamp),
          isQualityVerified: batchData.isQualityVerified,
          ownerRole: ROLES[Number(batchData.ownerRole)]
        });

        // Fetch StatusUpdated events to build timelines
        const filter = contract.filters.StatusUpdated(Number(id));
        const logs = await contract.queryFilter(filter, 0, "latest");

        const decodedEvents = logs.map(log => {
          return {
            handlerRole: ROLES[Number(log.args[1])],
            location: log.args[2],
            timestamp: Number(log.args[3]),
            transactionHash: log.transactionHash
          };
        });

        decodedEvents.sort((a, b) => a.timestamp - b.timestamp);
        setEvents(decodedEvents);
      } catch (err) {
        console.error("Error fetching trace data:", err);
        setError("Failed to fetch traceability data. Ensure the blockchain is running on Ganache.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBatchData();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const buildSteps = () => {
    // Stage 1: Harvested
    const s1 = { status: 'completed', timestamp: batch?.timestamp, location: batch?.location, hash: null }; // Genesis
    
    // Stage 2: Quality Verified
    const inspectorEvt = events.find(e => e.handlerRole === 'Inspector');
    const s2 = {
        status: (batch?.isQualityVerified || inspectorEvt) ? 'completed' : 'pending',
        timestamp: inspectorEvt?.timestamp,
        location: inspectorEvt?.location,
        hash: inspectorEvt?.transactionHash
    };

    // Stage 3: In Transit
    const distEvt = events.find(e => e.handlerRole === 'Distributor') || events.find(e => e.location?.includes('Transit'));
    const s3 = {
        status: distEvt ? 'completed' : 'pending',
        timestamp: distEvt?.timestamp,
        location: distEvt?.location,
        hash: distEvt?.transactionHash
    };

    // Stage 4: At Store
    const retailEvt = events.find(e => e.handlerRole === 'Retailer');
    // If the contract current role is strictly Retailer, maybe we fake it if events are missing? We rely on events for accuracy.
    const s4 = {
        status: retailEvt || batch?.ownerRole === 'Retailer' ? 'completed' : 'pending',
        timestamp: retailEvt?.timestamp,
        location: retailEvt?.location,
        hash: retailEvt?.transactionHash
    };

    return [
      { title: 'Harvested', ...s1 },
      { title: 'Quality Verified', ...s2 },
      { title: 'In Transit', ...s3 },
      { title: 'At Store', ...s4 }
    ];
  };

  if (loading) return <div className="trace-container"><div className="loader"></div></div>;
  if (error) return <div className="trace-container"><div className="error-card">{error}</div></div>;

  const steps = buildSteps();

  return (
    <div className="trace-container">
      <div className="trace-card">
        <h1 className="trace-title">Product Traceability</h1>
        <div className="summary-box">
          <div className="summary-item"><span className="summary-label">Batch ID</span><span className="summary-value">#{batch?.id}</span></div>
          <div className="summary-item"><span className="summary-label">Crop Type</span><span className="summary-value">{batch?.cropType}</span></div>
          <div className="summary-item"><span className="summary-label">Current Owner</span><span className="summary-value">
              {batch?.currentOwner.substring(0, 6)}...{batch?.currentOwner.substring(38)}
          </span></div>
          <div className="summary-item"><span className="summary-label">Quality Status</span>
            {batch?.isQualityVerified ? <span className="quality-badge quality-verified">✔ Verified</span> : <span className="quality-badge quality-pending">Pending</span>}
          </div>
        </div>

        <h2 style={{ marginBottom: "1rem", color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Journey Timeline</h2>

        <div className="stepper-container">
          {steps.map((step, idx) => {
             const isCompleted = step.status === 'completed';
             return (
               <div key={step.title} className="step-item">
                  <div className="step-indicator">
                     <div className={`step-circle ${step.status}`} />
                     {idx < steps.length - 1 && <div className={`step-line ${step.status}`} />}
                  </div>
                  <div className="step-content">
                    <h3 className={`step-title ${step.status}`}>{step.title}</h3>
                    {isCompleted ? (
                       <div className="step-details">
                          {step.timestamp && <p>🕒 {formatDate(step.timestamp)}</p>}
                          {step.location && <p>📍 {step.location}</p>}
                          {step.hash && (
                             <a href={`http://localhost:7545/tx/${step.hash}`} target="_blank" rel="noreferrer" className="ledger-link">
                                🔗 Verify on Ledger
                             </a>
                          )}
                       </div>
                    ) : (
                       <div className="step-details"><p style={{color: '#64748b', fontStyle: 'italic'}}>Pending...</p></div>
                    )}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default Trace;
