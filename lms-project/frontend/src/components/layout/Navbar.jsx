import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiSearch, FiShoppingCart, FiBell, FiChevronDown,
  FiUser, FiBook, FiHeart, FiLogOut, FiMenu, FiX,
  FiMessageSquare, FiSettings, FiGlobe, FiDollarSign,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import styles from './Navbar.module.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items: cartItems } = useSelector((s) => s.cart);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesDropOpen, setCoursesDropOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const notifications = user?.notifications?.filter((n) => !n.isRead) || [];

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <span>O</span>
          </div>
          <span className={styles.logoText}>TLB LMS</span>
        </Link>

        {/* Courses dropdown */}
        <div className={styles.coursesBtn} onMouseEnter={() => setCoursesDropOpen(true)} onMouseLeave={() => setCoursesDropOpen(false)}>
          <button className={styles.coursesTrigger}>
            Courses <FiChevronDown />
          </button>
          {coursesDropOpen && (
            <div className={styles.coursesDropdown}>
              <Link to="/courses" className={styles.dropItem}>All Courses</Link>
              <Link to="/courses?category=science" className={styles.dropItem}>Science</Link>
              <Link to="/courses?category=technology" className={styles.dropItem}>Technology</Link>
              <Link to="/courses?category=mathematics" className={styles.dropItem}>Mathematics</Link>
              <Link to="/courses?category=languages" className={styles.dropItem}>Languages</Link>
            </div>
          )}
        </div>

        {/* Search bar */}
        <form className={`${styles.searchBar} ${searchOpen ? styles.searchOpen : ''}`} onSubmit={handleSearch}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search Course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
        </form>

        {/* Nav right */}
        <div className={styles.navRight}>
          <Link to="/forum" className={styles.navLink}>Forum</Link>
          {user && <Link to="/dashboard" className={styles.navLink}>Request Pending</Link>}

          {/* Language */}
          <button className={styles.iconBtn} title="Language">
            <FiGlobe />
          </button>

          {/* Notifications */}
          {user && (
            <button className={styles.iconBtn} title="Notifications">
              <FiBell />
              {notifications.length > 0 && (
                <span className={styles.badge}>{notifications.length}</span>
              )}
            </button>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.iconBtn} title="Cart">
            <FiShoppingCart />
            {cartItems.length > 0 && (
              <span className={styles.badge}>{cartItems.length}</span>
            )}
          </Link>

          {/* Profile / Auth */}
          {user ? (
            <div className={styles.profileWrap} ref={profileRef}>
              <button className={styles.avatarBtn} onClick={() => setProfileOpen(!profileOpen)}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  : <div className={styles.avatarPlaceholder}><FiUser /></div>
                }
              </button>
              {profileOpen && (
                <div className={styles.profileMenu}>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                      {user.avatar ? <img src={user.avatar} alt="" /> : <FiUser />}
                    </div>
                    <div>
                      <p className={styles.profileName}>{user.name}</p>
                      <p className={styles.profileEmail}>{user.email}</p>
                    </div>
                  </div>
                  <div className={styles.profileDivider} />
                  <Link to="/dashboard" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiBook /> My Learning
                  </Link>
                  <Link to="/dashboard/consultation" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiUser /> My Consultation
                  </Link>
                  <Link to="/dashboard/chat" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiMessageSquare /> Chat
                  </Link>
                  <Link to="/wishlist" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiHeart /> Wishlist
                  </Link>
                  <div className={styles.profileDivider} />
                  <Link to="/profile" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiSettings /> Profile Settings
                  </Link>
                  <Link to="/dashboard/wallet" className={styles.menuItem} onClick={() => setProfileOpen(false)}>
                    <FiDollarSign /> My Wallet
                  </Link>
                  <div className={styles.profileDivider} />
                  <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search Course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Link to="/courses" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>All Courses</Link>
          <Link to="/forum" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Forum</Link>
          {!user && (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>My Learning</Link>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Profile</Link>
              <button className={styles.mobileLink} onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
