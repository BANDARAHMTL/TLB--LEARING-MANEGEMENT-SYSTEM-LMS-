import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { quizAPI, courseAPI } from '../../utils/api';
import { Modal, EmptyState, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const BLANK_QUIZ = { title: '', description: '', timeLimit: 0, passingScore: 60, maxAttempts: 3, isPublished: false, shuffleQuestions: false };
const BLANK_Q = { text: '', type: 'mcq', points: 1, options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }], correctAnswer: '', explanation: '' };

export default function ManageQuizzes() {
  const { id: courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'questions' | 'results'
  const [form, setForm] = useState(BLANK_QUIZ);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await quizAPI.getCourseQuizzes(courseId);
      setQuizzes(r.data.data);
    } catch { toast.error('Failed to load quizzes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [courseId]);

  const openCreate = () => { setForm(BLANK_QUIZ); setQuestions([]); setModal('create'); };
  const openEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setForm({ title: quiz.title, description: quiz.description || '', timeLimit: quiz.timeLimit, passingScore: quiz.passingScore, maxAttempts: quiz.maxAttempts, isPublished: quiz.isPublished, shuffleQuestions: quiz.shuffleQuestions });
    setQuestions(quiz.questions || []);
    setModal('edit');
  };
  const openResults = async (quiz) => {
    setSelectedQuiz(quiz);
    try {
      const r = await quizAPI.getResults(quiz._id);
      setResults(r.data.data);
      setModal('results');
    } catch { toast.error('Failed to load results'); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Quiz title required');
    setSaving(true);
    try {
      const payload = { ...form, questions, course: courseId };
      if (modal === 'create') {
        await quizAPI.create(payload);
        toast.success('Quiz created!');
      } else {
        await quizAPI.update(selectedQuiz._id, payload);
        toast.success('Quiz updated!');
      }
      setModal(null);
      load();
    } catch { toast.error('Failed to save quiz'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (quizId) => {
    if (!confirm('Delete this quiz and all its results?')) return;
    try { await quizAPI.delete(quizId); toast.success('Quiz deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const addQuestion = () => setQuestions(p => [...p, { ...BLANK_Q }]);
  const removeQuestion = (i) => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOption = (qi, oi, field, val) => setQuestions(p => p.map((q, idx) => idx === qi
    ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? { ...o, [field]: val } : (field === 'isCorrect' && val ? { ...o, isCorrect: false } : o)) }
    : q));

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <div className="page-title">Quizzes</div>
          <div className="page-subtitle">Create and manage quizzes for this course</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Quiz</button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState icon="📝" title="No quizzes yet" message="Create your first quiz to test students' knowledge." action={openCreate} actionLabel="Create Quiz" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map(quiz => (
            <div key={quiz._id} className="card card-body" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{quiz.title}</h3>
                  <span className={`badge ${quiz.isPublished ? 'badge-green' : 'badge-yellow'}`}>{quiz.isPublished ? 'Published' : 'Draft'}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
                  <span><FiCheckCircle size={12} /> {quiz.questions?.length || 0} questions</span>
                  {quiz.timeLimit > 0 && <span><FiClock size={12} /> {quiz.timeLimit} min</span>}
                  <span>Pass: {quiz.passingScore}%</span>
                  <span>Max attempts: {quiz.maxAttempts}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openResults(quiz)}><FiUsers size={13} /> Results</button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(quiz)}><FiEdit2 size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(quiz._id)}><FiTrash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Create Quiz' : 'Edit Quiz'} onClose={() => setModal(null)} maxWidth={800}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Quiz Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 1 Quiz" />
            </div>
            <div className="form-group">
              <label className="form-label">Time Limit (minutes, 0 = none)</label>
              <input type="number" min="0" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Score (%)</label>
              <input type="number" min="0" max="100" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Attempts</label>
              <input type="number" min="1" value={form.maxAttempts} onChange={e => setForm(p => ({ ...p, maxAttempts: +e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['isPublished', 'Publish quiz'], ['shuffleQuestions', 'Shuffle questions']].map(([k, lbl]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} style={{ width: 'auto' }} /> {lbl}
              </label>
            ))}
          </div>

          {/* Questions */}
          <div className="section-header">
            <span className="section-title">Questions ({questions.length})</span>
            <button className="btn btn-secondary btn-sm" onClick={addQuestion}><FiPlus /> Add Question</button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="quiz-question" style={{ position: 'relative' }}>
              <button className="btn btn-danger btn-sm" style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => removeQuestion(qi)}>
                <FiTrash2 size={12} />
              </button>
              <div className="form-grid form-grid-2" style={{ marginBottom: 12 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Question {qi + 1}</label>
                  <textarea rows={2} value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} placeholder="Enter your question..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Points</label>
                  <input type="number" min="1" value={q.points} onChange={e => updateQuestion(qi, 'points', +e.target.value)} />
                </div>
              </div>

              {(q.type === 'mcq') && (
                <div>
                  <div className="form-label" style={{ marginBottom: 8 }}>Options (check the correct one)</div>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <input type="radio" name={`correct-${qi}`} checked={opt.isCorrect} onChange={() => updateOption(qi, oi, 'isCorrect', true)} style={{ width: 'auto', flexShrink: 0 }} />
                      <input value={opt.text} onChange={e => updateOption(qi, oi, 'text', e.target.value)} placeholder={`Option ${oi + 1}`} style={{ flex: 1 }} />
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'true_false' && (
                <div>
                  <div className="form-label" style={{ marginBottom: 8 }}>Correct Answer</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['True', 'False'].map(v => (
                      <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" name={`tf-${qi}`} checked={q.correctAnswer === v} onChange={() => updateQuestion(qi, 'correctAnswer', v)} style={{ width: 'auto' }} /> {v}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {q.type === 'short_answer' && (
                <div className="form-group">
                  <label className="form-label">Expected Answer (for auto-grade)</label>
                  <input value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} placeholder="Exact expected answer" />
                </div>
              )}
              <div className="form-group" style={{ marginTop: 10 }}>
                <label className="form-label">Explanation (optional)</label>
                <input value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} placeholder="Shown after submission" />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Quiz'}</button>
          </div>
        </Modal>
      )}

      {/* Results Modal */}
      {modal === 'results' && results && (
        <Modal title={`Results: ${selectedQuiz?.title}`} onClose={() => setModal(null)} maxWidth={700}>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
            {[
              { label: 'Total Attempts', val: results.stats.total },
              { label: 'Passed', val: results.stats.passed },
              { label: 'Avg Score', val: `${results.stats.avgScore}%` },
              { label: 'High Score', val: `${results.stats.highScore}%` },
            ].map(s => (
              <div key={s.label} className="card card-body" style={{ padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Score</th><th>Passed</th><th>Attempt</th><th>Date</th></tr></thead>
              <tbody>
                {results.attempts.map(a => (
                  <tr key={a._id}>
                    <td>{a.student?.name || '—'}</td>
                    <td><span className={`badge ${a.passed ? 'badge-green' : 'badge-red'}`}>{a.percentage}%</span></td>
                    <td>{a.passed ? '✅' : '❌'}</td>
                    <td>#{a.attemptNumber}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
