import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiBell, FiMenu, FiSearch } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { toggleSidebar, closeSidebar } from '../../redux/slices/uiSlice';

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }        = useSelector(s => s.auth);
  const { sidebarOpen } = useSelector(s => s.ui);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const roleHome = `/${user?.role || 'student'}`;

  return (
    <div className="dash-layout">
      <Sidebar open={sidebarOpen} onClose={() => dispatch(closeSidebar())} />

      <div className="dash-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => dispatch(toggleSidebar())}>
              <FiMenu />
            </button>
            <div className="topbar-search search-wrap">
              <FiSearch className="search-icon" size={15} />
              <input placeholder="Search…" />
            </div>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" onClick={() => navigate(`${roleHome}/profile`)}>
              <FiBell />
              <span className="notif-dot" />
            </button>
            <div className="topbar-avatar" onClick={() => navigate(`${roleHome}/profile`)} title="Profile">
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : initials
              }
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
