import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { assignmentAPI } from '../../utils/api';
import { Modal, Spinner, EmptyState } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function GradeSubmissions() {
  const { id: assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); // selected submission
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [subR, assnR] = await Promise.all([
        assignmentAPI.getSubmissions(assignmentId),
        assignmentAPI.getById(assignmentId),
      ]);
      setSubmissions(subR.data.data);
      setAssignment(assnR.data.data.assignment);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [assignmentId]);

  const openGrade = (sub) => {
    setGrading(sub);
    setGradeForm({ grade: sub.grade ?? '', feedback: sub.feedback ?? '' });
  };

  const handleGrade = async () => {
    if (gradeForm.grade === '' || gradeForm.grade < 0) return toast.error('Enter a valid grade');
    if (assignment && +gradeForm.grade > assignment.maxPoints) return toast.error(`Max points: ${assignment.maxPoints}`);
    setSaving(true);
    try {
      await assignmentAPI.grade(grading._id, gradeForm);
      toast.success('Submission graded!');
      setGrading(null);
      load();
    } catch { toast.error('Failed to grade'); }
    finally { setSaving(false); }
  };

  const statusIcon = (s) => ({ graded: <FiCheckCircle color="var(--success)" />, submitted: <FiClock color="var(--info)" />, late: <FiAlertTriangle color="var(--error)" /> }[s] || null);

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Submissions</div>
        {assignment && <div className="page-subtitle">{assignment.title} · Max {assignment.maxPoints} pts</div>}
      </div>

      {/* Stats */}
      {submissions.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total', val: submissions.length },
            { label: 'Graded', val: submissions.filter(s => s.status === 'graded').length },
            { label: 'Pending', val: submissions.filter(s => s.status === 'submitted').length },
            { label: 'Late', val: submissions.filter(s => s.isLate).length },
          ].map(s => (
            <div key={s.label} className="card card-body" style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState icon="📭" title="No submissions yet" message="Students haven't submitted this assignment yet." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Submitted</th><th>Files</th><th>Status</th><th>Grade</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.7rem', width: 30, height: 30, flexShrink: 0 }}>
                        {sub.student?.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{sub.student?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{sub.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                    {sub.isLate && <div className="assignment-late" style={{ fontSize: '0.72rem' }}>⚠ Late</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {sub.files?.map((f, i) => (
                        <a key={i} href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--brand-600)' }}>
                          <FiDownload size={11} /> {f.name}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {statusIcon(sub.status)}
                      <span className={`badge ${sub.status === 'graded' ? 'badge-green' : sub.status === 'late' ? 'badge-red' : 'badge-blue'}`}>
                        {sub.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    {sub.grade !== undefined && sub.grade !== null
                      ? <strong>{sub.grade} / {assignment?.maxPoints}</strong>
                      : <span style={{ color: 'var(--text-4)' }}>Not graded</span>
                    }
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => openGrade(sub)}>
                      {sub.status === 'graded' ? 'Update Grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Modal */}
      {grading && (
        <Modal title={`Grade: ${grading.student?.name}`} onClose={() => setGrading(null)}>
          {/* Files */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Submitted Files</div>
            {grading.files?.map((f, i) => (
              <a key={i} href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="file-item" style={{ marginBottom: 6, textDecoration: 'none', color: 'inherit' }}>
                <span>📄</span>
                <span style={{ flex: 1 }}>{f.name}</span>
                <span className="file-download"><FiDownload size={13} /> Download</span>
              </a>
            ))}
          </div>
          {grading.comments && (
            <div className="form-group">
              <div className="form-label">Student Comments</div>
              <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                {grading.comments}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Grade (out of {assignment?.maxPoints}) *</label>
            <input type="number" min="0" max={assignment?.maxPoints} value={gradeForm.grade}
              onChange={e => setGradeForm(p => ({ ...p, grade: e.target.value }))} placeholder={`0 – ${assignment?.maxPoints}`} />
          </div>
          <div className="form-group">
            <label className="form-label">Feedback for Student</label>
            <textarea rows={4} value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
              placeholder="Write feedback to help the student improve..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleGrade} disabled={saving}>
              {saving ? 'Saving…' : 'Submit Grade'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
