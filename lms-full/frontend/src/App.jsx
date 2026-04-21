import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth
import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Shared layout
import DashboardLayout from './components/layout/DashboardLayout';

// Admin pages
import AdminDashboard  from './pages/Admin/AdminDashboard';
import ManageUsers     from './pages/Admin/ManageUsers';
import ManageCourses   from './pages/Admin/ManageCourses';
import ManageCategories from './pages/Admin/ManageCategories';
import ManageEnrollments from './pages/Admin/ManageEnrollments';

// Teacher pages
import TeacherDashboard  from './pages/Teacher/TeacherDashboard';
import TeacherCourses    from './pages/Teacher/TeacherCourses';
import CourseBuilder     from './pages/Teacher/CourseBuilder';
import ManageQuizzes     from './pages/Teacher/ManageQuizzes';
import ManageAssignments from './pages/Teacher/ManageAssignments';
import GradeSubmissions  from './pages/Teacher/GradeSubmissions';
import CourseStudents    from './pages/Teacher/CourseStudents';

// Student pages
import StudentDashboard from './pages/Student/StudentDashboard';
import BrowseCourses    from './pages/Student/BrowseCourses';
import MyCourses        from './pages/Student/MyCourses';
import CourseView       from './pages/Student/CourseView';
import TakeQuiz         from './pages/Student/TakeQuiz';
import MyAssignments    from './pages/Student/MyAssignments';
import MyGrades         from './pages/Student/MyGrades';

// Shared
import ProfilePage  from './pages/Profile/ProfilePage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

function PrivateRoute({ children, roles }) {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users"       element={<ManageUsers />} />
        <Route path="courses"     element={<ManageCourses />} />
        <Route path="categories"  element={<ManageCategories />} />
        <Route path="enrollments" element={<ManageEnrollments />} />
        <Route path="profile"     element={<ProfilePage />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<PrivateRoute roles={['teacher','admin']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="courses"          element={<TeacherCourses />} />
        <Route path="courses/:id/build"   element={<CourseBuilder />} />
        <Route path="courses/:id/quizzes" element={<ManageQuizzes />} />
        <Route path="courses/:id/assignments" element={<ManageAssignments />} />
        <Route path="courses/:id/students"    element={<CourseStudents />} />
        <Route path="assignments/:id/grade"   element={<GradeSubmissions />} />
        <Route path="profile"          element={<ProfilePage />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<PrivateRoute roles={['student','admin','teacher']}><DashboardLayout /></PrivateRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="browse"          element={<BrowseCourses />} />
        <Route path="my-courses"      element={<MyCourses />} />
        <Route path="courses/:id"     element={<CourseView />} />
        <Route path="quiz/:id"        element={<TakeQuiz />} />
        <Route path="assignments"     element={<MyAssignments />} />
        <Route path="grades"          element={<MyGrades />} />
        <Route path="profile"         element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
