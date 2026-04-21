import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiUsers, FiBook, FiTag, FiShoppingBag,
  FiBarChart2, FiPlusSquare, FiClipboard, FiFileText,
  FiStar, FiAward, FiSearch, FiLogOut, FiUser, FiSettings
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { closeSidebar } from '../../redux/slices/uiSlice';
import toast from 'react-hot-toast';

const NAV = {
  admin: [
    { section: 'Overview', items: [
      { to: '/admin',             label: 'Dashboard',    icon: <FiGrid />,       end: true },
      { to: '/admin/users',       label: 'Users',        icon: <FiUsers /> },
      { to: '/admin/courses',     label: 'Courses',      icon: <FiBook /> },
      { to: '/admin/categories',  label: 'Categories',   icon: <FiTag /> },
      { to: '/admin/enrollments', label: 'Enrollments',  icon: <FiShoppingBag /> },
    ]},
    { section: 'Account', items: [
      { to: '/admin/profile', label: 'Profile', icon: <FiUser /> },
    ]},
  ],
  teacher: [
    { section: 'Teaching', items: [
      { to: '/teacher',           label: 'Dashboard',  icon: <FiGrid />,   end: true },
      { to: '/teacher/courses',   label: 'My Courses', icon: <FiBook /> },
    ]},
    { section: 'Student View', items: [
      { to: '/student/browse',    label: 'Browse',     icon: <FiSearch /> },
    ]},
    { section: 'Account', items: [
      { to: '/teacher/profile',   label: 'Profile',    icon: <FiUser /> },
    ]},
  ],
  student: [
    { section: 'Learning', items: [
      { to: '/student',              label: 'Dashboard',    icon: <FiGrid />,        end: true },
      { to: '/student/browse',       label: 'Browse Courses', icon: <FiSearch /> },
      { to: '/student/my-courses',   label: 'My Courses',   icon: <FiBook /> },
      { to: '/student/assignments',  label: 'Assignments',  icon: <FiClipboard /> },
      { to: '/student/grades',       label: 'My Grades',    icon: <FiAward /> },
    ]},
    { section: 'Account', items: [
      { to: '/student/profile', label: 'Profile', icon: <FiUser /> },
    ]},
  ],
};

export default function Sidebar({ open, onClose }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const role      = user?.role || 'student';
  const navGroups = NAV[role] || NAV.student;
  const initials  = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <span className="logo-text">Edu<span>Flow</span></span>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} /> : initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.section}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
