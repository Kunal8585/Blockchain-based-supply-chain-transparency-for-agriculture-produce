import React, { useEffect, useState } from 'react';
import { getShipments, getProducts, createShipment, deleteShipment } from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';

const stages = ['FARM', 'IN_TRANSIT', 'WAREHOUSE', 'RETAIL', 'DISTRIBUTOR'];

const getStageColor = (stage) => {
  const upper = stage?.toUpperCase() || '';
  if (upper === 'FARM') return '#8D6E63'; // Brown
  if (upper === 'IN_TRANSIT' || upper === 'WAREHOUSE') return '#3b82f6'; // Blue
  if (upper === 'RETAIL' || upper === 'DELIVERED') return '#4ade80'; // Green
  return '#94a3b8'; // Default grey
};

const formatStage = (stage) => {
  const upper = stage?.toUpperCase() || '';
  if (upper === 'FARM') return '🚜 ' + stage;
  if (upper === 'IN_TRANSIT' || upper === 'WAREHOUSE') return '🚚 ' + stage;
  if (upper === 'RETAIL' || upper === 'DELIVERED') return '✅ ' + stage;
  return stage;
};

const empty = { productId:'', fromLocation:'', toLocation:'', stage:'FARM', handledBy:'', notes:'' };

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    getShipments().then(r => setShipments(r.data)).catch(() => {});
    getProducts().then(r => setProducts(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (scanActive) {
      const scanner = new Html5QrcodeScanner('shipment-qr-reader', { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render((text) => {
        scanner.clear();
        setScanActive(false);
        try {
          const parts = text.split('/');
          const batchId = parts[parts.length - 1]; // Extract ID
          const matched = products.find(p => p.batchNumber === batchId || String(p.id) === batchId);
          if (matched) {
            setForm(prev => ({...prev, productId: matched.id, fromLocation: 'Scanned from QR', stage: 'RETAIL'}));
            setShowForm(true);
            setMsg({type:'success', text:`Product matched: ${matched.name} (${batchId})`});
          } else {
            alert('No product found for scanned batch: ' + batchId);
          }
        } catch (e) {
          alert('Invalid QR Format: ' + text);
        }
      }, (err) => {
        // ignore verbose scan errors while looking for code
      });
      return () => {
        try { scanner.clear(); } catch(e) {}
      };
    }
  }, [scanActive, products]);

  const handleSubmit = async () => {
    try {
      await createShipment(form);
      setMsg({type:'success', text:'Shipment recorded & added to blockchain!'});
      setForm(empty); setShowForm(false); load();
    } catch { setMsg({type:'error', text:'Operation failed.'}); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this shipment?')) { await deleteShipment(id); load(); }
  };

  const getProductName = (id) => products.find(p=>p.id===id)?.name || id;

  return (
    <div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Shipments</h1><p>Record supply chain movements — each shipment is added to the blockchain</p></div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + Add Shipment
          </button>
        </div>
      </div>
      
      {scanActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{margin: '0 0 1rem 0', color: '#333'}}>Scan Product QR Label</h3>
            <div id="shipment-qr-reader" style={{width: '100%'}}></div>
            <button className="btn btn-danger" style={{marginTop: '1rem'}} onClick={() => setScanActive(false)}>Cancel Scan</button>
          </div>
        </div>
      )}

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {showForm && (
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3 style={{margin: 0}}>Record New Shipment</h3>
            <button className="btn btn-secondary" onClick={() => setScanActive(!scanActive)}>
              📷 Scan to Record
            </button>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Product</label>
              <select value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}>
                <option value="">Select Product</option>
                {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.batchNumber})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stage</label>
              <select value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})}>
                {stages.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label>From Location</label><input value={form.fromLocation} onChange={e=>setForm({...form,fromLocation:e.target.value})} /></div>
            <div className="form-group"><label>To Location</label><input value={form.toLocation} onChange={e=>setForm({...form,toLocation:e.target.value})} /></div>
            <div className="form-group"><label>Handled By</label><input value={form.handledBy} onChange={e=>setForm({...form,handledBy:e.target.value})} /></div>
            <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSubmit}>Save & Record on Chain</button>
            <button className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Product</th><th>Stage</th><th>From</th><th>To</th><th>Handled By</th><th>Timestamp</th><th>Actions</th></tr></thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">🚚</div>No shipments yet</div></td></tr>
              ) : shipments.map(s => (
                <tr key={s.id}>
                  <td><strong>{getProductName(s.productId)}</strong></td>
                  <td><span className="badge" style={{backgroundColor: getStageColor(s.stage), color: 'white'}}>{formatStage(s.stage)}</span></td>
                  <td>{s.fromLocation}</td>
                  <td>{s.toLocation}</td>
                  <td>{s.handledBy}</td>
                  <td style={{fontSize:'0.85rem',color:'#888'}}>{new Date(s.timestamp).toLocaleString()}</td>
                  <td style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <a href={`https://etherscan.io/tx/0xmock${s.id}hash`} target="_blank" rel="noreferrer" style={{color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline'}}>View Tx</a>
                    <button className="btn btn-danger" style={{padding: '0.3rem 0.6rem'}} onClick={()=>handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
