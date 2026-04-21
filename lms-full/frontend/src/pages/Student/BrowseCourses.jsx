import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { courseAPI, categoryAPI, enrollmentAPI } from '../../utils/api';
import { CourseCard, Spinner, EmptyState, Pagination } from '../../components/common/index';
import toast from 'react-hot-toast';

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const SORT   = ['newest', 'popular', 'rating', 'price_asc', 'price_desc'];

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', level: '', sort: 'newest', page: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const [cR, catR, enR] = await Promise.all([
        courseAPI.getAll(params),
        categoryAPI.getAll(),
        enrollmentAPI.getMy(),
      ]);
      setCourses(cR.data.data.courses);
      setTotal(cR.data.data.total);
      setPages(cR.data.data.pages);
      setCategories(catR.data.data);
      setEnrolledIds(enR.data.data.map(e => e.course?._id));
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll({ courseId });
      toast.success('Enrolled successfully!');
      setEnrolledIds(p => [...p, courseId]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to enroll');
    }
  };

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Browse Courses</div>
        <div className="page-subtitle">{total} courses available</div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-wrap search-bar">
          <FiSearch className="search-icon" size={15} />
          <input placeholder="Search courses…" value={filters.search} onChange={e => setFilter('search', e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="filter-select" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="filter-select" value={filters.level} onChange={e => setFilter('level', e.target.value)}>
          <option value="">All Levels</option>
          {LEVELS.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select className="filter-select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {loading ? <Spinner /> : courses.length === 0 ? (
        <EmptyState icon="🔍" title="No courses found" message="Try adjusting your filters." action={() => setFilters({ search: '', category: '', level: '', sort: 'newest', page: 1 })} actionLabel="Clear Filters" />
      ) : (
        <>
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                enrolled={enrolledIds.includes(course._id)}
                onEnroll={handleEnroll}
                onClick={() => navigate(`/student/courses/${course._id}`)}
              />
            ))}
          </div>
          <Pagination page={filters.page} pages={pages} onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
        </>
      )}
    </div>
  );
}
