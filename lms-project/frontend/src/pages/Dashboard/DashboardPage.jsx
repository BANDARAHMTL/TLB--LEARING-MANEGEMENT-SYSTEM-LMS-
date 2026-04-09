import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiBook, FiHeart, FiMessageSquare, FiUser, FiSettings, FiDollarSign, FiAward, FiPlay } from 'react-icons/fi';
import { getMyProfile } from '../../redux/slices/authSlice';
import styles from './DashboardPage.module.css';

const NAV_ITEMS = [
  { icon: <FiBook />, label: 'My Learning', id: 'learning' },
  { icon: <FiAward />, label: 'Certificates', id: 'certificates' },
  { icon: <FiHeart />, label: 'Wishlist', id: 'wishlist', to: '/wishlist' },
  { icon: <FiMessageSquare />, label: 'Chat', id: 'chat' },
  { icon: <FiSettings />, label: 'Profile Settings', id: 'profile', to: '/profile' },
  { icon: <FiDollarSign />, label: 'My Wallet', id: 'wallet' },
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(getMyProfile()); }, [dispatch]);

  const enrolledCourses = user?.enrolledCourses || [];

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {user?.avatar
                  ? <img src={user.avatar} alt={user?.name} />
                  : <FiUser />
                }
              </div>
              <div>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userEmail}>{user?.email}</p>
              </div>
            </div>

            <nav className={styles.dashNav}>
              {NAV_ITEMS.map((item) =>
                item.to ? (
                  <Link key={item.id} to={item.to} className={styles.navItem}>
                    {item.icon} {item.label}
                  </Link>
                ) : (
                  <button key={item.id} className={`${styles.navItem} ${item.id === 'learning' ? styles.navActive : ''}`}>
                    {item.icon} {item.label}
                  </button>
                )
              )}
            </nav>

            {/* Wallet summary */}
            <div className={styles.walletCard}>
              <p className={styles.walletLabel}>Wallet Balance</p>
              <p className={styles.walletBalance}>Rs {user?.wallet?.toLocaleString() || '0.00'}</p>
              <button className="btn btn-outline btn-sm" style={{ marginTop: '12px', width: '100%' }}>
                Top Up
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className={styles.main}>
            <div className={styles.mainHeader}>
              <h2>My Learning</h2>
              <p>{enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled</p>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📚</div>
                <h3>No courses yet</h3>
                <p>Start your learning journey by enrolling in a course.</p>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              </div>
            ) : (
              <div className={styles.courseList}>
                {enrolledCourses.map((course) => (
                  <div key={course._id || course} className={styles.enrolledCard}>
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className={styles.courseThumbnail} />
                    )}
                    <div className={styles.courseInfo}>
                      <h4>{course.title || 'Course'}</h4>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: '40%' }} />
                      </div>
                      <p className={styles.progressText}>40% complete</p>
                    </div>
                    <Link
                      to={`/courses/${course.slug || course}`}
                      className="btn btn-primary btn-sm"
                    >
                      <FiPlay /> Continue
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
