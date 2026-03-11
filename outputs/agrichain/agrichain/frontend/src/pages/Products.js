import React, { useEffect, useState } from 'react';
import { getProducts, getProducers, createProduct, updateProduct, deleteProduct } from '../services/api';

const statusBadge = { HARVESTED: 'badge-green', IN_TRANSIT: 'badge-orange', DELIVERED: 'badge-blue' };
const empty = { name:'', batchNumber:'', producerId:'', category:'', quantity:'', unit:'kg', harvestDate:'', status:'HARVESTED' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [producers, setProducers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

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
      if (editing) { await updateProduct(editing, form); setMsg({type:'success',text:'Product updated!'}); }
      else { await createProduct(form); setMsg({type:'success',text:'Product added!'}); }
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
      {msg && <div className={lert alert- + msg.type}>{msg.text}</div>}
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
                <option value="HARVESTED">Harvested</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
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
            <thead><tr><th>Name</th><th>Batch #</th><th>Category</th><th>Quantity</th><th>Harvest Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7"><div className="empty-state"><div className="empty-icon">🌽</div>No products found</div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><code>{p.batchNumber}</code></td>
                  <td>{p.category}</td>
                  <td>{p.quantity} {p.unit}</td>
                  <td>{p.harvestDate}</td>
                  <td><span className={adge  + (statusBadge[p.status]||'badge-green')}>{p.status}</span></td>
                  <td style={{display:'flex',gap:'0.5rem'}}>
                    <button className="btn btn-secondary" onClick={()=>handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>handleDelete(p.id)}>Delete</button>
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
