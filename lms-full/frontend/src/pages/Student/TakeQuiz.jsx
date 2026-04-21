import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import { quizAPI } from '../../utils/api';
import { Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('info'); // info | taking | results
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    quizAPI.getById(id)
      .then(r => { setQuiz(r.data.data.quiz); setAttemptsUsed(r.data.data.attemptsUsed); })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  const startQuiz = () => {
    setAnswers({});
    setPhase('taking');
    setStartTime(Date.now());
    if (quiz.timeLimit > 0) {
      setTimeLeft(quiz.timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleAnswer = (questionId, optionId, type) => {
    if (type === 'short_answer') {
      setAnswers(p => ({ ...p, [questionId]: { textAnswer: optionId } }));
    } else {
      setAnswers(p => ({ ...p, [questionId]: { selectedOption: optionId } }));
    }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto) clearInterval(timerRef.current);
    const answersArr = Object.entries(answers).map(([questionId, ans]) => ({ questionId, ...ans }));
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSubmitting(true);
    try {
      const r = await quizAPI.submit({ quizId: id, answers: answersArr, timeTaken });
      setResult(r.data.data);
      setPhase('results');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit quiz');
    } finally { setSubmitting(false); }
  }, [answers, id, startTime]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  if (loading) return <Spinner />;
  if (!quiz) return <div style={{ padding: 40, textAlign: 'center' }}>Quiz not found.</div>;

  // ── INFO SCREEN ──
  if (phase === 'info') {
    const attemptsLeft = quiz.maxAttempts - attemptsUsed;
    return (
      <div className="animate-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>
        <div className="card card-body" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: 8 }}>{quiz.title}</h1>
          {quiz.description && <p style={{ color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.7 }}>{quiz.description}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28, textAlign: 'left' }}>
            {[
              ['Questions', quiz.questions?.length || 0],
              ['Time Limit', quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No limit'],
              ['Passing Score', `${quiz.passingScore}%`],
              ['Attempts Left', attemptsLeft],
            ].map(([k, v]) => (
              <div key={k} className="card" style={{ padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v}</div>
              </div>
            ))}
          </div>
          {attemptsLeft <= 0 ? (
            <div style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <FiAlertTriangle /> No attempts remaining
            </div>
          ) : (
            <button className="btn btn-primary btn-lg btn-full" onClick={startQuiz}>Start Quiz</button>
          )}
        </div>
      </div>
    );
  }

  // ── TAKING SCREEN ──
  if (phase === 'taking') {
    const answered = Object.keys(answers).length;
    const total = quiz.questions?.length || 0;
    return (
      <div className="animate-in" style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Quiz topbar */}
        <div className="card card-body" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 60, zIndex: 50 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{quiz.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{answered} of {total} answered</div>
          </div>
          {quiz.timeLimit > 0 && (
            <div className={`quiz-timer ${timerClass}`}><FiClock size={18} style={{ marginRight: 6 }} />{formatTime(timeLeft)}</div>
          )}
          <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 20 }}>
          <div className="progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
        </div>

        {/* Questions */}
        {quiz.questions?.map((q, qi) => (
          <div key={q._id} className="quiz-question">
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', borderRadius: 6, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>Q{qi + 1}</span>
              <p style={{ fontWeight: 600, lineHeight: 1.5 }}>{q.text}</p>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-4)', flexShrink: 0 }}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
            </div>

            {(q.type === 'mcq' || q.type === 'true_false') && (
              <div>
                {(q.type === 'mcq' ? q.options : [{ _id: 'true', text: 'True' }, { _id: 'false', text: 'False' }]).map(opt => (
                  <div key={opt._id} className={`quiz-option ${answers[q._id]?.selectedOption === opt._id ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q._id, opt._id, q.type)}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${answers[q._id]?.selectedOption === opt._id ? 'var(--brand-500)' : 'var(--border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {answers[q._id]?.selectedOption === opt._id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)' }} />}
                    </div>
                    {opt.text}
                  </div>
                ))}
              </div>
            )}
            {q.type === 'short_answer' && (
              <textarea rows={3} placeholder="Type your answer here…"
                value={answers[q._id]?.textAnswer || ''}
                onChange={e => handleAnswer(q._id, e.target.value, 'short_answer')} />
            )}
          </div>
        ))}

        <button className="btn btn-primary btn-lg btn-full" onClick={() => handleSubmit(false)} disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? 'Submitting…' : 'Submit Quiz'}
        </button>
      </div>
    );
  }

  // ── RESULTS SCREEN ──
  if (phase === 'results' && result) {
    return (
      <div className="animate-in" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div className="card card-body" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{result.passed ? '🎉' : '😔'}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 8 }}>
            {result.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <p style={{ color: 'var(--text-3)', marginBottom: 28 }}>
            {result.passed ? 'You passed the quiz!' : `You needed ${quiz.passingScore}% to pass.`}
          </p>
          <div style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: result.passed ? 'var(--success)' : 'var(--error)', marginBottom: 8 }}>
            {result.percentage}%
          </div>
          <div style={{ color: 'var(--text-4)', marginBottom: 28, fontSize: '0.9rem' }}>
            {result.score} out of {result.attempt?.totalPoints} points
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {attemptsUsed + 1 < quiz.maxAttempts && (
              <button className="btn btn-secondary" onClick={() => { setPhase('info'); setResult(null); setAttemptsUsed(p => p + 1); }}>
                Try Again
              </button>
            )}
            <button className="btn btn-primary" onClick={() => navigate(-1)}>Back to Course</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
