import React, { useEffect, useState } from 'react';
import { getShipments, getProducts, createShipment, deleteShipment } from '../services/api';

const stages = ['FARM', 'WAREHOUSE', 'DISTRIBUTOR', 'RETAILER'];
const stageBadge = { FARM:'badge-green', WAREHOUSE:'badge-blue', DISTRIBUTOR:'badge-orange', RETAILER:'badge-purple' };
const empty = { productId:'', fromLocation:'', toLocation:'', stage:'FARM', handledBy:'', notes:'' };

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    getShipments().then(r => setShipments(r.data)).catch(() => {});
    getProducts().then(r => setProducts(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Shipment</button>
      </div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {showForm && (
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>Record New Shipment</h3>
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
                  <td><span className={`badge ${stageBadge[s.stage] || 'badge-green'}`}>{s.stage}</span></td>
                  <td>{s.fromLocation}</td>
                  <td>{s.toLocation}</td>
                  <td>{s.handledBy}</td>
                  <td style={{fontSize:'0.85rem',color:'#888'}}>{new Date(s.timestamp).toLocaleString()}</td>
                  <td><button className="btn btn-danger" onClick={()=>handleDelete(s.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
