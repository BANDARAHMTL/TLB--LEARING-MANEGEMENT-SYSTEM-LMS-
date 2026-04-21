import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiUsers, FiCalendar } from 'react-icons/fi';
import { assignmentAPI } from '../../utils/api';
import { Modal, EmptyState, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const BLANK = { title: '', description: '', dueDate: '', maxPoints: 100, isPublished: false, allowedFileTypes: ['pdf', 'docx'] };

export default function ManageAssignments() {
  const { id: courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await assignmentAPI.getCourseAssignments(courseId); setAssignments(r.data.data); }
    catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const openCreate = () => { setForm(BLANK); setSelected(null); setModal('form'); };
  const openEdit = (a) => {
    setSelected(a);
    setForm({ title: a.title, description: a.description, dueDate: a.dueDate?.slice(0, 16) || '', maxPoints: a.maxPoints, isPublished: a.isPublished, allowedFileTypes: a.allowedFileTypes });
    setModal('form');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate) return toast.error('Title and due date are required');
    setSaving(true);
    try {
      const payload = { ...form, course: courseId };
      if (selected) { await assignmentAPI.update(selected._id, payload); toast.success('Assignment updated'); }
      else { await assignmentAPI.create(payload); toast.success('Assignment created'); }
      setModal(null); load();
    } catch { toast.error('Failed to save assignment'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment and all submissions?')) return;
    try { await assignmentAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <div className="page-title">Assignments</div>
          <div className="page-subtitle">Create and manage assignments for students</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Assignment</button>
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon="📋" title="No assignments yet" message="Create assignments for students to complete and submit." action={openCreate} actionLabel="Create Assignment" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map(a => (
            <div key={a._id} className="assignment-card">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{a.title}</h3>
                  <span className={`badge ${a.isPublished ? 'badge-green' : 'badge-yellow'}`}>{a.isPublished ? 'Published' : 'Draft'}</span>
                  {isOverdue(a.dueDate) && <span className="badge badge-red">Overdue</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.description}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-4)', flexWrap: 'wrap' }}>
                  <span><FiCalendar size={11} /> Due: {new Date(a.dueDate).toLocaleString()}</span>
                  <span>Max: {a.maxPoints} pts</span>
                  <span>Files: {a.allowedFileTypes?.join(', ')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = `/teacher/assignments/${a._id}/grade`}>
                  <FiUsers size={13} /> Submissions
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><FiEdit2 size={13} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}><FiTrash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={selected ? 'Edit Assignment' : 'New Assignment'} onClose={() => setModal(null)}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Week 1 Assignment" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe what students need to do..." />
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Points</label>
              <input type="number" min="1" value={form.maxPoints} onChange={e => setForm(p => ({ ...p, maxPoints: +e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Allowed File Types (comma-separated)</label>
            <input value={form.allowedFileTypes?.join(', ')} onChange={e => setForm(p => ({ ...p, allowedFileTypes: e.target.value.split(',').map(s => s.trim()) }))} placeholder="pdf, docx, doc" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} style={{ width: 'auto' }} />
            Publish immediately (visible to students)
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : selected ? 'Update' : 'Create'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
