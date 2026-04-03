import React, { useEffect, useState } from 'react';
import { getProducers, createProducer, updateProducer, deleteProducer } from '../services/api';

const empty = { name: '', location: '', walletAddress: '', contactNumber: '', email: '', licenseNumber: '' };

export default function Producers() {
  const [producers, setProducers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => getProducers().then(r => setProducers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    try {
      if (editing) { 
        await updateProducer(editing, form); 
        setMsg({type:'success', text:'Producer updated!'}); 
      } else { 
        await createProducer(form); 
        setMsg({type:'success', text:'Producer added!'}); 
      }
      setForm(empty); setEditing(null); setShowForm(false); load();
    } catch { setMsg({type:'error', text:'Operation failed.'}); }
  };

  const handleEdit = (p) => { setForm(p); setEditing(p.id); setShowForm(true); };
  
  const handleDelete = async (id) => {
    if (window.confirm('Delete this producer?')) {
      await deleteProducer(id); load();
    }
  };

  return (
    <div>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div><h1>Producers</h1><p>Manage registered farmers and producers</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setForm(empty); setEditing(null); }}>
          + Add Producer
        </button>
      </div>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      {showForm && (
        <div className="card">
          <h3 style={{marginBottom:'1rem'}}>{editing ? 'Edit Producer' : 'New Producer'}</h3>
          <div className="form-grid">
            {Object.keys(empty).map(k => (
              <div className="form-group" key={k}>
                <label>{k.replace(/([A-Z])/g,' ').replace(/^./,s=>s.toUpperCase())}</label>
                <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Location</th><th>Wallet Address</th><th>Email</th><th>Contact</th><th>License</th><th>Actions</th></tr></thead>
            <tbody>
              {producers.length === 0 ? (
                <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon">👨‍🌾</div>No producers yet</div></td></tr>
              ) : producers.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.location}</td>
                  <td>
                    {p.walletAddress ? (
                      <code style={{fontSize:'0.75rem', color:'#6a1b9a'}}>
                        {p.walletAddress.substring(0,8)}...
                      </code>
                    ) : <span style={{color:'#bbb'}}>Not linked</span>}
                  </td>
                  <td>{p.email}</td>
                  <td>{p.contactNumber}</td>
                  <td><span className="badge badge-green">{p.licenseNumber}</span></td>
                  <td style={{display:'flex',gap:'0.5rem'}}>
                    <button className="btn btn-secondary" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
