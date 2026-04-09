import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowRight, FiPlay, FiAward, FiUsers, FiBookOpen, FiStar } from 'react-icons/fi';
import { fetchFeaturedCourses, fetchCategories } from '../../redux/slices/courseSlice';
import CourseCard from '../../components/course/CourseCard';
import { CourseCardSkeleton } from '../../components/common/Loaders';
import styles from './HomePage.module.css';

const POPULAR_SEARCHES = ['Technology', 'Mathematics', 'Languages', 'Science'];
const STATS = [
  { icon: <FiUsers />, value: '24K+', label: 'Students Enrolled' },
  { icon: <FiBookOpen />, value: '5000+', label: 'Online Courses' },
  { icon: <FiAward />, value: '200+', label: 'Expert Instructors' },
  { icon: <FiStar />, value: '4.9', label: 'Average Rating' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, categories, loading } = useSelector((s) => s.courses);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchFeaturedCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <div className={styles.heroLabel}>
                Come &bull; for &bull; learn &bull;
              </div>
              <h1 className={styles.heroTitle}>
                A Better<br />
                <span className={styles.heroAccent}>Learning Point</span><br />
                Starts Here.
              </h1>
              <p className={styles.heroSubtitle}>
                Now you can start your smart educational journey with TLB LMS.
              </p>
              <form className={styles.heroSearch} onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search for a course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <FiArrowRight />
                </button>
              </form>
              <div className={styles.popularSearches}>
                <span>Popular:</span>
                {POPULAR_SEARCHES.map((s) => (
                  <Link key={s} to={`/courses?search=${s}`} className="tag">{s}</Link>
                ))}
              </div>
              <Link to="/courses" className={`btn btn-primary btn-lg ${styles.browseBtn}`}>
                Browse Course <FiArrowRight />
              </Link>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.heroBanner}>
                <div className={styles.bannerGlow} />
                <div className={styles.bannerContent}>
                  <div className={styles.bannerLogoCircle}>TLB</div>
                  <div className={styles.bannerText}>
                    <h3>EXCELLENCE IN OUTSTANDING</h3>
                    <h3>CONTRIBUTION TO EDUCATION</h3>
                    <h3>&amp; TRAINING</h3>
                    <p className={styles.bannerSubtitle}>Excellence Award - 2025</p>
                    <p className={styles.bannerGold}>✦ 2025 DIAMOND EXCELLENCE AWARDS ✦</p>
                  </div>
                </div>
                <div className={styles.floatCard1}>
                  <FiAward className={styles.floatIcon} />
                  <div>
                    <p className={styles.floatNum}>5000+</p>
                    <p className={styles.floatLabel}>Courses</p>
                  </div>
                </div>
                <div className={styles.floatCard2}>
                  <FiUsers className={styles.floatIcon} />
                  <div>
                    <p className={styles.floatNum}>24K</p>
                    <p className={styles.floatLabel}>Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statIcon}>{s.icon}</div>
                <div>
                  <p className={styles.statValue}>{s.value}</p>
                  <p className={styles.statLabel}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className={`section ${styles.categoriesSection}`}>
          <div className="container">
            <p className={styles.sectionEyebrow}>Browse by</p>
            <h2 className="section-title">Top Categories</h2>
            <div className={styles.catGrid}>
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat._id} to={`/courses?category=${cat._id}`} className={styles.catCard}>
                  <div className={styles.catIcon}>📚</div>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COURSES */}
      <section className={`section ${styles.featuredSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Hand-picked for you</p>
              <h2 className="section-title">Featured Courses</h2>
            </div>
            <Link to="/courses" className="btn btn-outline">View All <FiArrowRight /></Link>
          </div>
          <div className="courses-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : featured.slice(0, 8).map((course) => <CourseCard key={course._id} course={course} />)
            }
          </div>
          {!loading && featured.length === 0 && (
            <div className={styles.emptyState}>
              <FiBookOpen size={48} />
              <p>No featured courses yet. Check back soon!</p>
              <Link to="/courses" className="btn btn-primary">Browse All Courses</Link>
            </div>
          )}
        </div>
      </section>

      {/* WHY TLB */}
      <section className={`section ${styles.whySection}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div className={styles.whyLeft}>
              <p className={styles.sectionEyebrow}>Why choose us</p>
              <h2 className="section-title">Why Learn with TLB LMS?</h2>
              <p className={styles.whyDesc}>
                World-class education with experienced instructors, flexible schedules,
                and industry-recognized certifications to help you reach your goals faster.
              </p>
              <div className={styles.whyFeatures}>
                {[
                  { icon: '🎯', text: 'Goal-oriented curriculum designed by experts' },
                  { icon: '📱', text: 'Learn on any device, anywhere, anytime' },
                  { icon: '🏅', text: 'Industry-recognized certifications' },
                  { icon: '💬', text: 'Live chat support and community forums' },
                ].map((f) => (
                  <div key={f.text} className={styles.whyFeature}>
                    <span className={styles.whyFeatureIcon}>{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link to="/courses" className="btn btn-primary btn-lg" style={{ marginTop: '32px' }}>
                Start Learning <FiArrowRight />
              </Link>
            </div>
            <div className={styles.whyRight}>
              <div className={styles.whyVideoCard}>
                <div className={styles.playBtn}><FiPlay /></div>
                <h3>Watch How It Works</h3>
                <p>See how students are transforming their careers with TLB LMS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join thousands of students already learning on TLB LMS</p>
            <div className={styles.ctaBtns}>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/courses" className="btn btn-outline btn-lg">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
