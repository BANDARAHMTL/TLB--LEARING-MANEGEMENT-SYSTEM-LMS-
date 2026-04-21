import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiPlay, FiFileText, FiLink, FiDownload, FiCheckCircle, FiClock, FiClipboard } from 'react-icons/fi';
import { courseAPI, enrollmentAPI, quizAPI, assignmentAPI } from '../../utils/api';
import { Spinner, EmptyState } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({ 0: true });
  const [activeTab, setActiveTab] = useState('content');
  const [markingComplete, setMarkingComplete] = useState(null);

  const load = async () => {
    try {
      const [cR, enR, qR, aR] = await Promise.all([
        courseAPI.getById(id),
        enrollmentAPI.getMy(),
        quizAPI.getCourseQuizzes(id),
        assignmentAPI.getCourseAssignments(id),
      ]);
      setCourse(cR.data.data.course);
      setEnrollment(enR.data.data.find(e => e.course?._id === id || e.course === id));
      setQuizzes(qR.data.data);
      setAssignments(aR.data.data);
    } catch { toast.error('Failed to load course'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const markComplete = async (materialId) => {
    setMarkingComplete(materialId);
    try {
      await enrollmentAPI.updateProgress({ courseId: id, materialId });
      load();
      toast.success('Progress saved!');
    } catch { toast.error('Failed to update progress'); }
    finally { setMarkingComplete(null); }
  };

  const isCompleted = (materialId) => enrollment?.completedMaterials?.includes(materialId);

  const typeIcon = (type) => ({ pdf: <FiFileText />, video: <FiPlay />, link: <FiLink />, text: <FiFileText /> }[type] || <FiFileText />);

  if (loading) return <Spinner />;
  if (!course) return <EmptyState title="Course not found" />;

  const totalMaterials = course.sections?.reduce((s, sec) => s + (sec.materials?.length || 0), 0) || 0;

  return (
    <div className="animate-in">
      {/* Course header */}
      <div className="card card-body" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {course.thumbnail && (
            <img src={`http://localhost:5000${course.thumbnail}`} alt="" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'white', marginBottom: 6 }}>{course.title}</h1>
            {course.teacher && <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>by {course.teacher.name}</div>}
          </div>
          {enrollment && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{enrollment.progressPercent}%</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Complete</div>
              <div className="progress-bar" style={{ marginTop: 6, background: 'rgba(255,255,255,0.2)' }}>
                <div className="progress-fill" style={{ width: `${enrollment.progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        {[['content', 'Course Content'], ['quizzes', `Quizzes (${quizzes.length})`], ['assignments', `Assignments (${assignments.length})`]].map(([val, lbl]) => (
          <button key={val} className={`tab-btn ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>{lbl}</button>
        ))}
      </div>

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div>
          {totalMaterials === 0 ? (
            <EmptyState icon="📂" title="No content yet" message="The instructor hasn't added materials yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {course.sections?.map((section, idx) => (
                <div key={section._id} className="section-block">
                  <button className="section-header-bar" onClick={() => setOpenSections(p => ({ ...p, [idx]: !p[idx] }))}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      {section.title}
                      <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-4)', marginLeft: 10 }}>
                        {section.materials?.filter(m => isCompleted(m._id)).length || 0} / {section.materials?.length || 0} done
                      </span>
                    </div>
                    {openSections[idx] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {openSections[idx] && section.materials?.map(mat => (
                    <div key={mat._id} className="material-row">
                      <div className={`material-icon ${mat.type}`}>{typeIcon(mat.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mat.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', textTransform: 'uppercase' }}>{mat.type}</div>
                      </div>

                      {/* View / Download */}
                      {mat.url && (
                        mat.type === 'pdf'
                          ? <a href={`http://localhost:5000${mat.url}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiDownload size={12} /> Download</a>
                          : mat.type === 'link'
                          ? <a href={mat.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiLink size={12} /> Open</a>
                          : <a href={`http://localhost:5000${mat.url}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FiPlay size={12} /> Watch</a>
                      )}

                      {/* Mark complete */}
                      {enrollment && (
                        isCompleted(mat._id)
                          ? <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}><FiCheckCircle /> Done</span>
                          : <button className="btn btn-ghost btn-sm" onClick={() => markComplete(mat._id)} disabled={markingComplete === mat._id}>
                              {markingComplete === mat._id ? '…' : 'Mark Done'}
                            </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div>
          {quizzes.length === 0 ? (
            <EmptyState icon="📝" title="No quizzes yet" message="The instructor hasn't created any quizzes for this course." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {quizzes.map(quiz => (
                <div key={quiz._id} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{quiz.title}</h3>
                    <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-4)', flexWrap: 'wrap' }}>
                      <span>📋 {quiz.questions?.length || 0} questions</span>
                      {quiz.timeLimit > 0 && <span><FiClock size={11} /> {quiz.timeLimit} min</span>}
                      <span>Pass: {quiz.passingScore}%</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => navigate(`/student/quiz/${quiz._id}`)}>
                    <FiPlay size={13} /> Take Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div>
          {assignments.length === 0 ? (
            <EmptyState icon="📋" title="No assignments yet" message="The instructor hasn't created any assignments yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map(a => {
                const isOverdue = new Date(a.dueDate) < new Date();
                return (
                  <div key={a._id} className="assignment-card">
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 6 }}>{a.description?.slice(0, 140)}{a.description?.length > 140 ? '…' : ''}</p>
                      <div className={`assignment-due ${isOverdue ? 'assignment-late' : ''}`}>
                        <FiClock size={11} /> Due: {new Date(a.dueDate).toLocaleString()}
                        {isOverdue && ' (Overdue)'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-600)' }}>{a.maxPoints} pts</span>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/assignments')}>
                        <FiClipboard size={12} /> Submit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
