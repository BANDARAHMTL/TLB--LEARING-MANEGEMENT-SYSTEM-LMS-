// MyAssignments.jsx
import { useEffect, useState } from 'react';
import { FiUpload, FiDownload, FiCalendar, FiClock, FiCheck } from 'react-icons/fi';
import { assignmentAPI, enrollmentAPI, courseAPI } from '../../utils/api';
import { Spinner, EmptyState } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function MyAssignments() {
  const [items, setItems] = useState([]); // { assignment, submission, course }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [files, setFiles] = useState({});
  const [comments, setComments] = useState({});
  const [tab, setTab] = useState('pending');

  const load = async () => {
    try {
      const enR = await enrollmentAPI.getMy();
      const courseIds = enR.data.data.map(e => e.course?._id).filter(Boolean);
      const all = [];
      await Promise.all(courseIds.map(async (cid) => {
        try {
          const [aR] = await Promise.all([assignmentAPI.getCourseAssignments(cid)]);
          for (const a of aR.data.data) {
            const sub = await assignmentAPI.getById(a._id).then(r => r.data.data.submission).catch(() => null);
            all.push({ assignment: a, submission: sub, courseId: cid });
          }
        } catch {}
      }));
      setItems(all.sort((a, b) => new Date(a.assignment.dueDate) - new Date(b.assignment.dueDate)));
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (assignmentId) => {
    const f = files[assignmentId];
    if (!f || f.length === 0) return toast.error('Please select at least one file');
    setSubmitting(assignmentId);
    const fd = new FormData();
    Array.from(f).forEach(file => fd.append('files', file));
    if (comments[assignmentId]) fd.append('comments', comments[assignmentId]);
    try {
      await assignmentAPI.submit(assignmentId, fd);
      toast.success('Assignment submitted!');
      setFiles(p => { const n = { ...p }; delete n[assignmentId]; return n; });
      setComments(p => { const n = { ...p }; delete n[assignmentId]; return n; });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(null); }
  };

  const pending = items.filter(i => !i.submission);
  const submitted = items.filter(i => i.submission);
  const filtered = tab === 'pending' ? pending : submitted;

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">My Assignments</div>
        <div className="page-subtitle">{pending.length} pending · {submitted.length} submitted</div>
      </div>

      <div className="tab-list">
        {[['pending', `Pending (${pending.length})`], ['submitted', `Submitted (${submitted.length})`]].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={tab === 'pending' ? '✅' : '📭'} title={tab === 'pending' ? 'No pending assignments!' : 'No submissions yet'} message={tab === 'pending' ? 'Great job! You\'re all caught up.' : 'Submit your first assignment from an enrolled course.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(({ assignment: a, submission: sub }) => {
            const isOverdue = new Date(a.dueDate) < new Date();
            return (
              <div key={a._id} className="card card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{a.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 6 }}>{a.description?.slice(0, 200)}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: isOverdue && !sub ? 'var(--error)' : 'var(--text-4)', flexWrap: 'wrap' }}>
                      <span><FiCalendar size={11} /> Due: {new Date(a.dueDate).toLocaleString()}</span>
                      <span>Max: {a.maxPoints} pts</span>
                      <span>Files: {a.allowedFileTypes?.join(', ')}</span>
                    </div>
                  </div>
                  {sub && (
                    <span className={`badge ${sub.status === 'graded' ? 'badge-green' : sub.isLate ? 'badge-red' : 'badge-blue'}`}>
                      {sub.status === 'graded' ? `Graded: ${sub.grade}/${a.maxPoints}` : sub.isLate ? 'Late' : 'Submitted'}
                    </span>
                  )}
                </div>

                {/* Graded feedback */}
                {sub?.status === 'graded' && sub.feedback && (
                  <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 12, fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--brand-700)', marginBottom: 4 }}>Teacher Feedback:</div>
                    <div style={{ color: 'var(--text-2)' }}>{sub.feedback}</div>
                  </div>
                )}

                {/* Submitted files */}
                {sub?.files?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {sub.files.map((f, i) => (
                      <a key={i} href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="file-item" style={{ marginBottom: 6, textDecoration: 'none', color: 'inherit' }}>
                        <span>📄</span> <span style={{ flex: 1 }}>{f.name}</span>
                        <FiDownload size={13} className="file-download" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Submit form */}
                {!sub && (
                  <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '14px', marginTop: 8 }}>
                    <div className="form-group" style={{ marginBottom: 10 }}>
                      <label className="form-label">Upload Files ({a.allowedFileTypes?.join(', ')})</label>
                      <input type="file" multiple accept={a.allowedFileTypes?.map(t => `.${t}`).join(',')}
                        onChange={e => setFiles(p => ({ ...p, [a._id]: e.target.files }))} style={{ padding: '8px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Comments (optional)</label>
                      <textarea rows={2} value={comments[a._id] || ''} onChange={e => setComments(p => ({ ...p, [a._id]: e.target.value }))} placeholder="Add a note for your teacher…" />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleSubmit(a._id)} disabled={submitting === a._id}>
                      <FiUpload size={14} /> {submitting === a._id ? 'Uploading…' : 'Submit Assignment'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
