import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { enrollmentAPI } from '../../utils/api';
import { Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function ManageEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await enrollmentAPI.getAll({ page, limit: 20 });
      setEnrollments(data.data.enrollments);
      setTotal(data.data.total);
    } catch { toast.error('Failed to load enrollments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const filtered = search
    ? enrollments.filter(e =>
        e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.course?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : enrollments;

  const pages = Math.ceil(total / 20);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Enrollments</h1>
        <p className="page-subtitle">{total} total enrollments</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-wrap" style={{ maxWidth: 340 }}>
          <FiSearch className="search-icon" size={15} />
          <input placeholder="Search by student or course…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Progress</th>
                <th>Amount</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-4)' }}>No enrollments found</td></tr>
                : filtered.map(e => (
                  <tr key={e._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem', flexShrink: 0 }}>{e.student?.name?.charAt(0)}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.student?.name}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{e.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <p style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course?.title}</p>
                    </td>
                    <td><span className={`badge badge-${e.status === 'active' ? 'green' : e.status === 'completed' ? 'blue' : 'gray'}`}>{e.status}</span></td>
                    <td><span className={`badge badge-${e.paymentStatus === 'paid' ? 'green' : e.paymentStatus === 'free' ? 'blue' : 'yellow'}`}>{e.paymentStatus}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${e.progressPercent}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{e.progressPercent}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-600)' }}>{e.amountPaid === 0 ? 'Free' : `$${e.amountPaid}`}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', background: p === page ? 'var(--brand-600)' : 'var(--surface)', color: p === page ? 'white' : 'var(--text-2)' }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
