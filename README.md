# OETI LMS — MERN Stack

> A full-featured Learning Management System built with MongoDB, Express, React, and Node.js.

---

## 🗂️ Project Structure

```
lms-project/
├── backend/                   # Express + MongoDB API
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect/admin/instructor
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── index.js           # Category, Order, Review, Progress
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env.example
│   └── index.js               # Entry point
│
└── frontend/                  # React + Vite
    └── src/
        ├── assets/styles/
        │   └── global.css     # CSS variables, utilities
        ├── components/
        │   ├── common/
        │   │   ├── Loaders.jsx        # Spinner, Skeleton
        │   │   └── ProtectedRoute.jsx
        │   ├── course/
        │   │   └── CourseCard.jsx
        │   └── layout/
        │       ├── Layout.jsx
        │       ├── Navbar.jsx
        │       └── Footer.jsx
        ├── pages/
        │   ├── Home/HomePage.jsx
        │   ├── Courses/CoursesPage.jsx
        │   ├── CourseDetail/CourseDetailPage.jsx
        │   ├── Auth/LoginPage.jsx
        │   ├── Auth/RegisterPage.jsx
        │   ├── Dashboard/DashboardPage.jsx
        │   ├── Profile/ProfilePage.jsx
        │   ├── Cart/CartPage.jsx
        │   ├── Wishlist/WishlistPage.jsx
        │   └── NotFound/NotFoundPage.jsx
        ├── redux/
        │   ├── store/index.js
        │   └── slices/
        │       ├── authSlice.js
        │       ├── courseSlice.js
        │       ├── cartSlice.js
        │       └── uiSlice.js
        ├── utils/api.js        # Axios instance + all endpoints
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT | `/api/auth/reset-password/:token` | Reset password |

### Courses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/courses` | List courses (filter, search, paginate) |
| GET | `/api/courses/featured` | Featured courses |
| GET | `/api/courses/:slug` | Single course |
| POST | `/api/courses` | Create course (instructor) |
| PUT | `/api/courses/:id` | Update course (instructor) |
| DELETE | `/api/courses/:id` | Delete course (admin) |

### Orders / Enrollment
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create order / enroll |
| GET | `/api/orders/myorders` | Get my orders |
| PUT | `/api/orders/:id/pay` | Mark paid (Stripe webhook) |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/wishlist/:courseId` | Toggle wishlist |
| PUT | `/api/users/notifications/read` | Mark notifications read |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| State | Redux Toolkit |
| Styling | CSS Modules + CSS Variables |
| HTTP | Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Upload | Cloudinary + Multer |
| Payment | Stripe |
| Email | Nodemailer |

---

## 📦 Features

- ✅ JWT Authentication (register, login, forgot/reset password)
- ✅ Role-based access (student, instructor, admin)
- ✅ Course CRUD with sections & lectures
- ✅ Search, filter by category/level/price, sort, paginate
- ✅ Shopping cart (Redux + localStorage persistence)
- ✅ Wishlist management
- ✅ Order & enrollment system
- ✅ Student dashboard with progress tracking
- ✅ Course reviews & ratings
- ✅ Profile management
- ✅ Notification system
- ✅ Wallet system
- ✅ Mobile responsive design
- ✅ OETI dark blue/purple theme

---

## 🔐 Environment Variables (Backend)

See `backend/.env.example` for all required environment variables.
