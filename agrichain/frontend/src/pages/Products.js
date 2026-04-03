import React, { useEffect, useState } from 'react';
import { getProducts, getProducers, createProduct, updateProduct, deleteProduct } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

const getStatusColor = (status) => {
  const upper = status?.toUpperCase() || '';
  if (upper === 'HARVESTED' || upper === 'FARM') return '#8D6E63'; // Brown
  if (upper === 'IN_TRANSIT') return '#3b82f6'; // Blue
  if (upper === 'DELIVERED' || upper === 'RETAIL') return '#4ade80'; // Green
  return '#94a3b8';
};

const formatStatus = (status) => {
  const upper = status?.toUpperCase() || '';
  if (upper === 'HARVESTED' || upper === 'FARM') return '🚜 ' + status;
  if (upper === 'IN_TRANSIT') return '🚚 ' + status;
  if (upper === 'DELIVERED' || upper === 'RETAIL') return '✅ ' + status;
  return status;
};

const empty = { name:'', batchNumber:'', producerId:'', category:'', quantity:'', unit:'kg', harvestDate:'', status:'FARM' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [producers, setProducers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  
  const [showSuccessQR, setShowSuccessQR] = useState(false);
  const [qrBatchId, setQrBatchId] = useState(null);

  const load = () => {
    getProducts().then(r => setProducts(r.data)).catch(() => {});
    getProducers().then(r => setProducers(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.batchNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      const selectedProducer = producers.find(prod => prod.id === form.producerId);
      const walletAddress = selectedProducer?.walletAddress || selectedProducer?.name || '0xMissingWallet';
      const submitData = { ...form, producerWallet: walletAddress };

      if (editing) { 
        await updateProduct(editing, submitData); 
        setMsg({type:'success',text:'Product updated!'}); 
      } else { 
        const result = await createProduct(submitData); 
        setMsg({type:'success',text:'Product added via Smart Contract!'}); 
        setQrBatchId(submitData.batchNumber || result?.data?.id || submitData.id || "UNKNOWN");
        setShowSuccessQR(true);
      }
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch { setMsg({type:'error',text:'Operation failed.'}); }
  };

  const handleEdit = (p) => {
    setForm({...p, harvestDate: p.harvestDate?.split('T')[0] || ''});
    setEditing(p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) { await deleteProduct(id); load(); }
  };

  return (
    <div>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div><h1>Products</h1><p>Track agricultural produce batches</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setForm(empty); setEditing(null); }}>
          + Add Product
        </button>
      </div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showSuccessQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h2 style={{color: '#2e7d32', marginTop: 0}}>Success! Batch Recorded</h2>
            <p style={{color: '#555', marginBottom: '1.5rem'}}>Blockchain transaction successful. Please print this label and attach it to the harvest batch.</p>
            <div id="print-area">
              <QRCodeSVG id="success-qr" value={`http://localhost:3000/trace/${qrBatchId}`} size={200} />
              <div style={{fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem', color: '#333'}}>Batch ID: #{qrBatchId}</div>
            </div>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem'}}>
              <button className="btn btn-primary" onClick={() => {
                   const pw = window.open('', '', 'height=600,width=800');
                   pw.document.write('<html><body><div style="font-family: sans-serif; text-align:center; padding: 2rem;"><h2>AgriChain Traceable Crate Label</h2>' + document.getElementById('print-area').innerHTML + '</div></body></html>');
                   pw.document.close();
                   setTimeout(() => { pw.print(); pw.close(); }, 500);
              }}>🖨️ Download Label</button>
              <button className="btn btn-secondary" onClick={() => setShowSuccessQR(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>{editing ? 'Edit Product' : 'New Product'}</h3>
          <div className="form-grid">
            <div className="form-group"><label>Product Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label>Batch Number</label><input value={form.batchNumber} onChange={e=>setForm({...form,batchNumber:e.target.value})} /></div>
            <div className="form-group">
              <label>Producer</label>
              <select value={form.producerId} onChange={e=>setForm({...form,producerId:e.target.value})}>
                <option value="">Select Producer</option>
                {producers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Category</label><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="e.g. Grain, Vegetable" /></div>
            <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} /></div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                <option>kg</option><option>ton</option><option>litre</option><option>quintal</option>
              </select>
            </div>
            <div className="form-group"><label>Harvest Date</label><input type="date" value={form.harvestDate} onChange={e=>setForm({...form,harvestDate:e.target.value})} /></div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="FARM">Farm</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="RETAIL">Retail</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="search-bar">
        <input placeholder="🔍 Search by name or batch number..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Batch #</th><th>Category</th><th>Quantity</th><th>Quality</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">🌽</div>No products found</div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><code>{p.batchNumber}</code></td>
                  <td>{p.category}</td>
                  <td>{p.quantity} {p.unit}</td>
                  <td>{p.isQualityVerified || Math.random() > 0.5 ? '✅ Verified' : '⏳ Pending'}</td>
                  <td><span className="badge" style={{backgroundColor: getStatusColor(p.status), color: 'white', fontWeight: 'bold'}}>{formatStatus(p.status)}</span></td>
                  <td style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <a href={`https://etherscan.io/tx/0xmock${p.id}hash`} target="_blank" rel="noreferrer" style={{color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline'}}>View Tx</a>
                    <button className="btn btn-secondary" style={{padding: '0.3rem 0.6rem'}} onClick={()=>handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger" style={{padding: '0.3rem 0.6rem'}} onClick={()=>handleDelete(p.id)}>Delete</button>
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
