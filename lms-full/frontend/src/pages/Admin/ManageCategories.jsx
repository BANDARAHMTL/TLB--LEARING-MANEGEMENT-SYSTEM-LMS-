// ManageCategories.jsx
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { categoryAPI } from '../../utils/api';
import { Modal, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
const EMPTY = { name: '', description: '', icon: '📚', color: '#10b981' };

export default function ManageCategories() {
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = async () => { setLoading(true); try { const r = await categoryAPI.getAll(); setCats(r.data.data); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('form'); };
  const openEdit   = c => { setForm({ name: c.name, description: c.description || '', icon: c.icon || '📚', color: c.color || '#10b981' }); setSelected(c); setModal('form'); };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'form' && !selected) { await categoryAPI.create(form); toast.success('Category created'); }
      else { await categoryAPI.update(selected._id, form); toast.success('Category updated'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async c => {
    if (!confirm(`Remove "${c.name}"?`)) return;
    try { await categoryAPI.delete(c._id); toast.success('Removed'); load(); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h1 className="page-title">Categories</h1><p className="page-subtitle">{cats.length} categories</p></div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Category</button>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16 }}>
          {cats.map(c => (
            <div key={c._id} className="card" style={{ padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, background:c.color+'20', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:'0.95rem' }}>{c.name}</p>
                  {c.description && <p style={{ fontSize:'0.78rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.description}</p>}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, borderTop:'1px solid var(--border)', paddingTop:10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><FiEdit2 /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
          {cats.length === 0 && <div className="empty-state" style={{ gridColumn:'1/-1' }}><div className="empty-icon">🏷️</div><h3>No categories</h3></div>}
        </div>
      )}

      {modal && (
        <Modal title={selected ? 'Edit Category' : 'New Category'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group"><label className="form-label">Name *</label><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. Web Development" required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={2} placeholder="Brief description" /></div>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label className="form-label">Icon (emoji)</label><input value={form.icon} onChange={e => setForm({...form, icon:e.target.value})} placeholder="📚" /></div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {COLORS.map(c => <button key={c} type="button" onClick={() => setForm({...form, color:c})} style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.color===c ? '3px solid #111' : '2px solid transparent', cursor:'pointer' }} />)}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : selected ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
