# 📚 Full-Stack LMS — Admin · Teacher · Student

A complete Learning Management System with role-based dashboards, quiz engine, assignment submission, and analytics.

---

## 🗂 Project Structure

```
lms-full/
├── backend/
│   ├── config/          db.js · upload.js
│   ├── controllers/     authController · userController · courseController · combinedController
│   ├── middleware/      authMiddleware · errorMiddleware
│   ├── models/          index.js (User · Category · Course · Enrollment · Quiz · QuizAttempt · Assignment · Submission · Review)
│   ├── routes/          auth · user · course · category · enrollment · quiz · assignment · analytics
│   ├── utils/           helpers.js
│   ├── uploads/         (auto-created: images/ · pdfs/ · videos/)
│   ├── index.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── assets/styles/   global.css · dashboard.css · sidebar.css
        ├── components/
        │   ├── common/      index.jsx (Spinner · StatCard · Modal · CourseCard · ProgressRing · Pagination …)
        │   └── layout/      DashboardLayout · Sidebar
        ├── pages/
        │   ├── Auth/        LoginPage · RegisterPage
        │   ├── Admin/       AdminDashboard · ManageUsers · ManageCourses · ManageCategories · ManageEnrollments
        │   ├── Teacher/     TeacherDashboard · TeacherCourses · CourseBuilder · ManageQuizzes · ManageAssignments · GradeSubmissions · CourseStudents
        │   ├── Student/     StudentDashboard · BrowseCourses · MyCourses · CourseView · TakeQuiz · MyAssignments · MyGrades
        │   ├── Profile/     ProfilePage
        │   └── NotFound/    NotFoundPage
        ├── redux/
        │   ├── slices/      authSlice · courseSlice · uiSlice
        │   └── store/       index.js
        ├── utils/           api.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Quick Start

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add MONGO_URI and JWT_SECRET at minimum
npm run dev        # → http://localhost:5000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/lms
JWT_SECRET=replace_with_32_char_random_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

---

## 🔌 API Reference

### Auth  `/api/auth`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Public / Admin | Register user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Any | Get current user |
| PUT | `/profile` | Any | Update name, bio, avatar |
| PUT | `/change-password` | Any | Change password |
| GET | `/notifications` | Any | Get notifications |
| PUT | `/notifications/read` | Any | Mark all read |

### Users  `/api/users` *(Admin)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List all users (filter by role, search, page) |
| POST | `/` | Create user (any role) |
| GET | `/:id` | Get user details |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |
| GET | `/teachers` | List active teachers |
| GET | `/students` | List students (optionally by courseId) |
| GET | `/:id/activity` | Get student enrollments |

### Courses  `/api/courses`
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Public | List courses (search, filter, paginate) |
| GET | `/:id` | Public | Get course (materials hidden if not enrolled) |
| POST | `/` | Teacher/Admin | Create course |
| PUT | `/:id` | Teacher/Admin | Update course |
| DELETE | `/:id` | Admin | Delete course |
| POST | `/:id/sections` | Teacher | Add section |
| DELETE | `/:id/sections/:sid` | Teacher | Remove section |
| POST | `/:id/sections/:sid/materials` | Teacher | Upload material |
| DELETE | `/:id/sections/:sid/materials/:mid` | Teacher | Remove material |

### Categories  `/api/categories`
GET (public) · POST, PUT, DELETE (Admin)

### Enrollments  `/api/enrollments`
| Route | Auth | Description |
|-------|------|-------------|
| POST `/` | Student | Enroll in course |
| GET `/my` | Student | My enrollments |
| GET `/all` | Teacher/Admin | All enrollments |
| PUT `/progress` | Student | Mark material complete |
| DELETE `/:courseId` | Student | Unenroll |

### Quizzes  `/api/quizzes`
| Route | Auth | Description |
|-------|------|-------------|
| POST `/` | Teacher | Create quiz with questions |
| GET `/course/:id` | Enrolled | List quizzes for course |
| GET `/:id` | Enrolled | Get quiz (answers hidden for students) |
| PUT `/:id` | Teacher | Update quiz |
| DELETE `/:id` | Teacher | Delete quiz |
| POST `/submit` | Student | Submit answers, auto-grade |
| GET `/:id/my-attempts` | Student | My quiz history |
| GET `/:id/results` | Teacher | All student results + stats |

### Assignments  `/api/assignments`
| Route | Auth | Description |
|-------|------|-------------|
| POST `/` | Teacher | Create assignment |
| GET `/course/:id` | Enrolled | List assignments |
| GET `/:id` | Enrolled | Assignment + my submission |
| PUT `/:id` | Teacher | Update assignment |
| DELETE `/:id` | Teacher | Delete assignment |
| POST `/:id/submit` | Student | Upload files |
| GET `/:id/submissions` | Teacher | All submissions |
| PUT `/submissions/:id/grade` | Teacher | Grade submission |

### Analytics  `/api/analytics`
- GET `/admin` — Admin stats
- GET `/teacher` — Teacher stats  
- GET `/student` — Student progress

---

## 🗄 Database Schema

### User
`name · email · password(hashed) · role(admin|teacher|student) · avatar · phone · bio · isActive · lastLogin · notifications[]`

### Course
`title · slug · description · category(ref) · teacher(ref) · price · level · language · sections[{title, materials[{title,type,url,isPublic}]}] · isPublished · isFeatured · rating · enrolledCount`

### Enrollment
`student(ref) · course(ref) · status · paymentStatus · completedMaterials[] · progressPercent · completedAt`

### Quiz
`title · course(ref) · teacher(ref) · questions[{text,type,options[{text,isCorrect}],points}] · timeLimit · passingScore · maxAttempts · isPublished`

### QuizAttempt
`quiz(ref) · student(ref) · answers[] · score · percentage · passed · timeTaken · attemptNumber`

### Assignment
`title · description · course(ref) · teacher(ref) · dueDate · maxPoints · allowedFileTypes · isPublished`

### Submission
`assignment(ref) · student(ref) · files[] · grade · feedback · gradedBy(ref) · status · isLate`

---

## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| State | Redux Toolkit |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer (local disk) |
| Fonts | Fraunces (display) + Plus Jakarta Sans (body) |

---

## 👤 Default Seed (create manually via API or MongoDB)

```js
// POST /api/auth/register  (first admin — update role in DB directly)
{ "name": "Admin User", "email": "admin@lms.com", "password": "admin123" }
// Then in MongoDB: db.users.updateOne({email:'admin@lms.com'},{$set:{role:'admin'}})
```

---

## 📦 Features Checklist

- ✅ JWT auth with role-based access (admin / teacher / student)
- ✅ Admin: full user CRUD, course management, category management, enrollment monitoring
- ✅ Teacher: course builder with sections & materials (PDF/video/link), quiz creator (MCQ/short answer/true-false), assignment manager, grade submissions, view student progress
- ✅ Student: browse & enroll courses, view materials, download PDFs, take timed quizzes with auto-grading, submit assignments, view grades
- ✅ Analytics dashboards with charts (Recharts)
- ✅ Search & filter courses
- ✅ Progress tracking per material
- ✅ Responsive sidebar navigation
- ✅ File uploads (PDF, video, images) via Multer
- ✅ Notification system
