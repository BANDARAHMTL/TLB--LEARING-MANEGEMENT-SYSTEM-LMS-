import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { courseAPI, categoryAPI, userAPI } from '../../utils/api';
import { Modal, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const EMPTY = { title: '', description: '', shortDescription: '', category: '', price: 0, level: 'All Levels', language: 'English', tags: '', teacher: '', isPublished: false };

export default function ManageCourses() {
  const [courses, setCourses]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [cats, setCats]           = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [thumb, setThumb]         = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cr, ca, tc] = await Promise.all([
        courseAPI.getAll({ search, category: catFilter, page, limit: 12, published: 'all' }),
        categoryAPI.getAll(),
        userAPI.getTeachers(),
      ]);
      setCourses(cr.data.data.courses);
      setTotal(cr.data.data.total);
      setCats(ca.data.data);
      setTeachers(tc.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, catFilter, page]);

  const openCreate = () => { setForm(EMPTY); setThumb(null); setSelected(null); setModal('create'); };
  const openEdit   = c => {
    setForm({ title: c.title, description: c.description, shortDescription: c.shortDescription || '', category: c.category?._id || '', price: c.price, level: c.level, language: c.language, tags: (c.tags || []).join(', '), teacher: c.teacher?._id || '', isPublished: c.isPublished });
    setThumb(null); setSelected(c); setModal('edit');
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumb) fd.append('thumbnail', thumb);
      if (modal === 'create') { await courseAPI.create(fd); toast.success('Course created'); }
      else { await courseAPI.update(selected._id, fd); toast.success('Course updated'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const handleDelete = async c => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    try { await courseAPI.delete(c._id); toast.success('Course deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const togglePublish = async c => {
    try {
      const fd = new FormData(); fd.append('isPublished', !c.isPublished);
      await courseAPI.update(c._id, fd);
      toast.success(c.isPublished ? 'Course unpublished' : 'Course published');
      load();
    } catch { toast.error('Failed'); }
  };

  const pages = Math.ceil(total / 12);

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-subtitle">{total} courses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Course</button>
      </div>

      <div style={g.filterRow}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <FiSearch className="search-icon" size={15} />
          <input placeholder="Search courses…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 38 }} />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ width: 160 }}>
          <option value="">All Categories</option>
          {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div style={g.grid}>
          {courses.length === 0
            ? <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses yet</h3><p>Create your first course to get started.</p></div>
            : courses.map(c => (
              <div key={c._id} className="card" style={g.courseCard}>
                <div style={g.thumbWrap}>
                  {c.thumbnail
                    ? <img src={c.thumbnail} alt={c.title} style={g.thumb} />
                    : <div style={{ ...g.thumb, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📚</div>
                  }
                  <span className={`badge badge-${c.isPublished ? 'green' : 'gray'}`} style={g.pubBadge}>{c.isPublished ? 'Published' : 'Draft'}</span>
                </div>
                <div style={g.courseBody}>
                  <p style={g.catLabel}>{c.category?.name || 'Uncategorized'}</p>
                  <h3 style={g.courseTitle}>{c.title}</h3>
                  <p style={g.teacherName}>by {c.teacher?.name || 'Unassigned'}</p>
                  <div style={g.courseMeta}>
                    <span style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{c.price === 0 ? 'Free' : `$${c.price}`}</span>
                    <span style={{ color: 'var(--text-4)', fontSize: '0.8rem' }}>{c.enrolledCount} enrolled</span>
                  </div>
                  <div style={g.actions}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Edit"><FiEdit2 /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(c)} title={c.isPublished ? 'Unpublish' : 'Publish'}>
                      {c.isPublished ? <FiToggleRight style={{ color: 'var(--brand-600)' }} /> : <FiToggleLeft style={{ color: 'var(--text-4)' }} />}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)} title="Delete"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', background: p === page ? 'var(--brand-600)' : 'var(--surface)', color: p === page ? 'white' : 'var(--text-2)' }}>{p}</button>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Course' : 'Edit Course'} onClose={() => setModal(null)} maxWidth={640}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to Python" required />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <input value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-line summary" />
            </div>
            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detailed description…" required />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Teacher</label>
                <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0 for free" />
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} placeholder="English" />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="python, beginner, programming" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail</label>
              <input type="file" accept="image/*" onChange={e => setThumb(e.target.files[0])} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="pub" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="pub" style={{ fontSize: '0.875rem', color: 'var(--text-2)', cursor: 'pointer' }}>Publish immediately</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : modal === 'create' ? 'Create Course' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const g = {
  filterRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  courseCard: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', height: 150, objectFit: 'cover', display: 'block' },
  pubBadge: { position: 'absolute', top: 8, right: 8, fontSize: '0.65rem' },
  courseBody: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  catLabel: { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--brand-600)' },
  courseTitle: { fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35, color: 'var(--text-1)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  teacherName: { fontSize: '0.78rem', color: 'var(--text-3)' },
  courseMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  actions: { display: 'flex', gap: 4, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' },
};
