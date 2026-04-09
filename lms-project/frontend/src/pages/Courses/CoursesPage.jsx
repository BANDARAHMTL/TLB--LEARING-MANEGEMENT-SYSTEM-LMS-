import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { fetchCourses, fetchCategories, setFilters } from '../../redux/slices/courseSlice';
import CourseCard from '../../components/course/CourseCard';
import { CourseCardSkeleton } from '../../components/common/Loaders';
import styles from './CoursesPage.module.css';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CoursesPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, categories, loading, total, pages, page, filters } = useSelector((s) => s.courses);
  const [catsOpen, setCatsOpen] = useState(true);
  const [levelOpen, setLevelOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCourses({
      search: searchFromUrl || filters.search,
      category: categoryFromUrl || filters.category,
      level: filters.level,
      sort: filters.sort,
      page: 1,
    }));
  }, [dispatch, filters, searchFromUrl, categoryFromUrl]);

  const handleCatFilter = (catId) => {
    dispatch(setFilters({ category: filters.category === catId ? '' : catId }));
    setSearchParams({});
  };
  const handleLevelFilter = (lvl) => dispatch(setFilters({ level: filters.level === lvl ? '' : lvl }));
  const handleSort = (e) => dispatch(setFilters({ sort: e.target.value }));
  const clearFilters = () => { dispatch(setFilters({ category: '', level: '', search: '', sort: 'default' })); setSearchParams({}); };
  const handlePage = (p) => { dispatch(fetchCourses({ ...filters, page: p })); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const activeCount = [filters.category, filters.level, filters.search].filter(Boolean).length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.breadcrumb}><span>Home</span> / <span>Courses</span></div>
          <h1 className={styles.pageTitle}>{searchFromUrl ? `Results for "${searchFromUrl}"` : 'All Courses'}</h1>
          <div className={styles.popularRow}>
            <span>People Also Search:</span>
            {['Technology', 'Mathematics', 'Languages', 'Science'].map((t) => (
              <button key={t} className="tag" onClick={() => dispatch(setFilters({ search: t }))}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={`${styles.sidebar} ${mobileSidebar ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarTop}>
              <div className={styles.filterTitle}><FiFilter /> Filter {activeCount > 0 && <span className={styles.activeCount}>{activeCount}</span>}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {activeCount > 0 && <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>}
                <button className={styles.closeBtn} onClick={() => setMobileSidebar(false)}><FiX /></button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <button className={styles.groupTitle} onClick={() => setCatsOpen(!catsOpen)}>
                Categories {catsOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {catsOpen && <div className={styles.options}>
                {categories.map((cat) => (
                  <label key={cat._id} className={styles.optionRow}>
                    <input type="checkbox" checked={filters.category === cat._id} onChange={() => handleCatFilter(cat._id)} />
                    <span>{cat.name}</span>
                    <button className={styles.expandBtn} onClick={() => handleCatFilter(cat._id)}>+</button>
                  </label>
                ))}
              </div>}
            </div>

            <div className={styles.filterGroup}>
              <button className={styles.groupTitle} onClick={() => setLevelOpen(!levelOpen)}>
                Course Level {levelOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {levelOpen && <div className={styles.options}>
                {LEVELS.map((lvl) => (
                  <label key={lvl} className={styles.optionRow}>
                    <input type="checkbox" checked={filters.level === lvl} onChange={() => handleLevelFilter(lvl)} />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>}
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.groupTitle} style={{ cursor: 'default' }}>Rating</p>
              <div className={styles.options}>
                {[4, 3, 2].map((r) => (
                  <label key={r} className={styles.optionRow}>
                    <input type="checkbox" />
                    <span>{'⭐'.repeat(r)} {r}+ star{r !== 1 ? 's' : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className={styles.main}>
            <div className={styles.toolbar}>
              <button className={styles.mobileFilterBtn} onClick={() => setMobileSidebar(true)}>
                <FiFilter /> Filter {activeCount > 0 && `(${activeCount})`}
              </button>
              <p className={styles.resultCount}>{total} courses found</p>
              <div className={styles.sortRow}>
                <label>Sort By:</label>
                <select value={filters.sort} onChange={handleSort} className={styles.sortSelect}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {activeCount > 0 && (
              <div className={styles.filterChips}>
                {filters.category && <span className={styles.chip}>Category: {categories.find(c => c._id === filters.category)?.name} <button onClick={() => dispatch(setFilters({ category: '' }))}><FiX /></button></span>}
                {filters.level && <span className={styles.chip}>Level: {filters.level} <button onClick={() => dispatch(setFilters({ level: '' }))}><FiX /></button></span>}
                {filters.search && <span className={styles.chip}>"{filters.search}" <button onClick={() => dispatch(setFilters({ search: '' }))}><FiX /></button></span>}
              </div>
            )}

            <div className="courses-grid">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
                : list.map((course) => <CourseCard key={course._id} course={course} />)
              }
            </div>

            {!loading && list.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>😕</div>
                <h3>No courses found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {pages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => handlePage(p)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileSidebar && <div className={styles.overlay} onClick={() => setMobileSidebar(false)} />}
    </div>
  );
}
