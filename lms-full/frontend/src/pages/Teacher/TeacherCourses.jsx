import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiUsers, FiFileText, FiClipboard, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import { courseAPI, categoryAPI } from '../../utils/api';
import { Modal, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const EMPTY  = { title: '', description: '', shortDescription: '', category: '', price: 0, level: 'All Levels', language: 'English', tags: '' };

export default function TeacherCourses() {
  const navigate = useNavigate();
  const [courses, setCourses]   = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [thumb, setThumb]       = useState(null);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cr, ca] = await Promise.all([courseAPI.getAll({ published: 'all' }), categoryAPI.getAll()]);
      setCourses(cr.data.data.courses);
      setCats(ca.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumb) fd.append('thumbnail', thumb);
      const { data } = await courseAPI.create(fd);
      toast.success('Course created');
      setModal(false);
      navigate(`/teacher/courses/${data.data._id}/build`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const togglePublish = async c => {
    try {
      const fd = new FormData(); fd.append('isPublished', !c.isPublished);
      await courseAPI.update(c._id, fd);
      toast.success(c.isPublished ? 'Unpublished' : 'Published');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div><h1 className="page-title">My Courses</h1><p className="page-subtitle">{courses.length} courses</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}><FiPlus /> New Course</button>
      </div>

      {courses.length === 0
        ? <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses yet</h3><p>Create your first course.</p><button className="btn btn-primary" onClick={() => setModal(true)}>Create Course</button></div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {courses.map(c => (
              <div key={c._id} className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ position:'relative' }}>
                  {c.thumbnail
                    ? <img src={c.thumbnail} alt={c.title} style={{ width:'100%', height:140, objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:140, background:'linear-gradient(135deg,var(--brand-50),var(--gray-100))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>📚</div>
                  }
                  <span className={`badge badge-${c.isPublished ? 'green' : 'gray'}`} style={{ position:'absolute', top:8, right:8, fontSize:'0.62rem' }}>{c.isPublished ? 'Live' : 'Draft'}</span>
                </div>
                <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.9rem', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.title}</h3>
                  <div style={{ display:'flex', gap:12, fontSize:'0.78rem', color:'var(--text-3)' }}>
                    <span>👤 {c.enrolledCount} students</span>
                    <span>⭐ {c.rating.toFixed(1)}</span>
                    <span>{c.price === 0 ? 'Free' : `$${c.price}`}</span>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:'auto', paddingTop:10, borderTop:'1px solid var(--border)' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/teacher/courses/${c._id}/build`)}><FiEdit2 /> Build</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${c._id}/students`)}><FiUsers /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${c._id}/quizzes`)}><FiFileText /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${c._id}/assignments`)}><FiClipboard /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(c)}>
                      {c.isPublished ? <FiToggleRight style={{ color:'var(--brand-600)' }} /> : <FiToggleLeft style={{ color:'var(--text-4)' }} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <Modal title="New Course" onClose={() => setModal(false)} maxWidth={580}>
          <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group"><label className="form-label">Title *</label><input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Advanced React Development" required /></div>
            <div className="form-group"><label className="form-label">Short Description</label><input value={form.shortDescription} onChange={e => setForm({...form, shortDescription:e.target.value})} placeholder="One-line summary" /></div>
            <div className="form-group"><label className="form-label">Description *</label><textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3} placeholder="Detailed course description…" required /></div>
            <div className="form-grid form-grid-2">
              <div className="form-group"><label className="form-label">Category</label><select value={form.category} onChange={e => setForm({...form, category:e.target.value})}><option value="">Select…</option>{cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Price ($)</label><input type="number" min={0} value={form.price} onChange={e => setForm({...form, price:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Level</label><select value={form.level} onChange={e => setForm({...form, level:e.target.value})}>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Language</label><input value={form.language} onChange={e => setForm({...form, language:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Thumbnail</label><input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} /></div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create & Build'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
