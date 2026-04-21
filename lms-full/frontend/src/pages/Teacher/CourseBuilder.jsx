import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiUpload, FiLink, FiFileText, FiVideo, FiArrowLeft, FiSave } from 'react-icons/fi';
import { courseAPI } from '../../utils/api';
import { Modal, Spinner, EmptyState } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});
  const [addSectionModal, setAddSectionModal] = useState(false);
  const [addMaterialModal, setAddMaterialModal] = useState(null); // sectionId
  const [sectionForm, setSectionForm] = useState({ title: '', description: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'pdf', url: '', isPublic: false });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await courseAPI.getById(id);
      setCourse(r.data.data.course);
      const open = {};
      r.data.data.course.sections?.forEach((_, i) => { open[i] = true; });
      setOpenSections(open);
    } catch { toast.error('Failed to load course'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddSection = async () => {
    if (!sectionForm.title.trim()) return toast.error('Section title required');
    setSaving(true);
    try {
      await courseAPI.addSection(id, sectionForm);
      toast.success('Section added');
      setSectionForm({ title: '', description: '' });
      setAddSectionModal(false);
      load();
    } catch { toast.error('Failed to add section'); }
    finally { setSaving(false); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its materials?')) return;
    try {
      await courseAPI.deleteSection(id, sectionId);
      toast.success('Section deleted');
      load();
    } catch { toast.error('Failed to delete section'); }
  };

  const handleAddMaterial = async () => {
    if (!materialForm.title.trim()) return toast.error('Material title required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(materialForm).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await courseAPI.addMaterial(id, addMaterialModal, fd);
      toast.success('Material added');
      setMaterialForm({ title: '', type: 'pdf', url: '', isPublic: false });
      setFile(null);
      setAddMaterialModal(null);
      load();
    } catch { toast.error('Failed to add material'); }
    finally { setSaving(false); }
  };

  const handleDeleteMaterial = async (sectionId, materialId) => {
    if (!confirm('Delete this material?')) return;
    try {
      await courseAPI.deleteMaterial(id, sectionId, materialId);
      toast.success('Material deleted');
      load();
    } catch { toast.error('Failed to delete material'); }
  };

  const typeIcon = (type) => ({ pdf: '📄', video: '🎬', link: '🔗', text: '📝' }[type] || '📎');

  if (loading) return <Spinner />;
  if (!course) return <EmptyState title="Course not found" />;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher/courses')}>
          <FiArrowLeft /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div className="page-title">{course.title}</div>
          <div className="page-subtitle">Course Content Builder</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${id}/quizzes`)}>Quizzes</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${id}/assignments`)}>Assignments</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/teacher/courses/${id}/students`)}>Students</button>
        </div>
      </div>

      {/* Course info summary */}
      <div className="card card-body" style={{ marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {course.thumbnail && (
          <img src={`http://localhost:5000${course.thumbnail}`} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${course.isPublished ? 'badge-green' : 'badge-yellow'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
            {course.category && <span className="badge badge-blue">{course.category.name}</span>}
            <span className="badge badge-gray">{course.level}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 6 }}>
            {course.sections?.length || 0} sections · {course.sections?.reduce((s, sec) => s + (sec.materials?.length || 0), 0)} materials
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="section-header">
        <h2 className="section-title">Sections & Materials</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setAddSectionModal(true)}>
          <FiPlus /> Add Section
        </button>
      </div>

      {(!course.sections || course.sections.length === 0) ? (
        <EmptyState icon="📂" title="No sections yet" message="Add your first section to start building your course content." action={() => setAddSectionModal(true)} actionLabel="Add Section" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {course.sections.map((section, idx) => (
            <div key={section._id} className="section-block">
              {/* Section header */}
              <div className="section-header-bar" onClick={() => setOpenSections(p => ({ ...p, [idx]: !p[idx] }))}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span>Section {idx + 1}: {section.title}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-4)', marginLeft: 10 }}>
                    {section.materials?.length || 0} materials
                  </span>
                </div>
                <button className="btn btn-sm btn-primary" style={{ marginRight: 8 }}
                  onClick={e => { e.stopPropagation(); setAddMaterialModal(section._id); }}>
                  <FiPlus /> Add Material
                </button>
                <button className="btn btn-sm btn-danger" style={{ marginRight: 8 }}
                  onClick={e => { e.stopPropagation(); handleDeleteSection(section._id); }}>
                  <FiTrash2 />
                </button>
                {openSections[idx] ? <FiChevronUp /> : <FiChevronDown />}
              </div>

              {/* Materials list */}
              {openSections[idx] && (
                <div>
                  {(!section.materials || section.materials.length === 0) ? (
                    <div style={{ padding: '18px 20px', color: 'var(--text-4)', fontSize: '0.85rem', textAlign: 'center' }}>
                      No materials yet — click "Add Material" to add content.
                    </div>
                  ) : section.materials.map(mat => (
                    <div key={mat._id} className="material-row">
                      <div className={`material-icon ${mat.type}`}>{typeIcon(mat.type)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mat.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>
                          {mat.type.toUpperCase()}
                          {mat.isPublic && <span className="badge badge-green" style={{ marginLeft: 6 }}>Preview</span>}
                        </div>
                      </div>
                      {mat.url && (
                        <a href={`http://localhost:5000${mat.url}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                          View
                        </a>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(section._id, mat._id)}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Section Modal */}
      {addSectionModal && (
        <Modal title="Add Section" onClose={() => setAddSectionModal(false)}>
          <div className="form-group">
            <label className="form-label">Section Title *</label>
            <input value={sectionForm.title} onChange={e => setSectionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to React" />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea rows={3} value={sectionForm.description} onChange={e => setSectionForm(p => ({ ...p, description: e.target.value }))} placeholder="What will students learn in this section?" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setAddSectionModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddSection} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Add Section'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Material Modal */}
      {addMaterialModal && (
        <Modal title="Add Material" onClose={() => setAddMaterialModal(null)}>
          <div className="form-group">
            <label className="form-label">Material Title *</label>
            <input value={materialForm.title} onChange={e => setMaterialForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Lecture 1 Slides" />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select value={materialForm.type} onChange={e => setMaterialForm(p => ({ ...p, type: e.target.value }))}>
              <option value="pdf">PDF Document</option>
              <option value="video">Video</option>
              <option value="link">External Link</option>
              <option value="text">Text Note</option>
            </select>
          </div>
          {(materialForm.type === 'pdf' || materialForm.type === 'video') && (
            <div className="form-group">
              <label className="form-label">Upload File</label>
              <input type="file" style={{ padding: '8px' }} accept={materialForm.type === 'pdf' ? '.pdf' : 'video/*'}
                onChange={e => setFile(e.target.files[0])} />
              {file && <div className="form-hint">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
            </div>
          )}
          {materialForm.type === 'link' && (
            <div className="form-group">
              <label className="form-label">URL</label>
              <input value={materialForm.url} onChange={e => setMaterialForm(p => ({ ...p, url: e.target.value }))} placeholder="https://..." />
            </div>
          )}
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="isPublic" checked={materialForm.isPublic} onChange={e => setMaterialForm(p => ({ ...p, isPublic: e.target.checked }))} style={{ width: 'auto' }} />
            <label htmlFor="isPublic" className="form-label" style={{ marginBottom: 0 }}>Allow preview (visible without enrollment)</label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setAddMaterialModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddMaterial} disabled={saving}>
              <FiUpload /> {saving ? 'Uploading…' : 'Add Material'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
