# TLB LMS - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Git

---

## 📦 Installation

### 1. Clone the Repository
```bash
cd c:\Users\THARINDU\Desktop\LMS\lms-project
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (already created, verify settings)
cat .env

# Verify MongoDB connection
# MONGO_URI=mongodb+srv://TLB_LMS:123tlb@cluster0.jxwhwzs.mongodb.net/tlb_lms

# Start backend server
npm run dev
# Expected: "Server running on port 5000"
```

### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Expected: "Local: http://localhost:5173"
```

---

## ✅ Verify Installation

### Test Backend API
```bash
# Test if API is running
curl http://localhost:5000/api

# Expected Response:
# "TLB LMS API Running..."
```

### Test Frontend
Open browser: `http://localhost:5173`
- Should see TLB LMS homepage
- Navigation working
- Can browse courses

---

## 🔐 Create Your First Users

### 1. Create Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@tlb.edu.lk",
    "phone": "+94701234567",
    "password": "Admin@123456",
    "adminSecret": "TLB_ADMIN_SECRET_2025"
  }'
```

### 2. Create Teacher Account
```bash
curl -X POST http://localhost:5000/api/auth/register-teacher \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teacher User",
    "email": "teacher@tlb.edu.lk",
    "phone": "+94702234567",
    "password": "Teacher@123456"
  }'
```

### 3. Create Student Account
Use the frontend or:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student User",
    "email": "student@tlb.edu.lk",
    "phone": "+94703234567",
    "password": "Student@123456"
  }'
```

---

## 🧪 Test Key Features

### Login (Frontend)
1. Navigate to http://localhost:5173
2. Click "Sign In"
3. Enter credentials:
   - Email: `admin@tlb.edu.lk`
   - Password: `Admin@123456`
4. Should redirect to dashboard

### Test Student Dashboard (Upcoming)
After frontend dashboards are built:
```
/dashboard - Should show user's enrolled courses
```

### Test Admin Functions (Via API)
```bash
# Get all users (requires admin token)
TOKEN="admin_jwt_token_here"
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Create new user (requires admin token)
curl -X POST http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Student",
    "email": "newstudent@tlb.edu.lk",
    "phone": "+94704234567",
    "password": "Password@123456",
    "role": "student"
  }'

# Get dashboard stats
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Test Teacher Functions (Via API)
```bash
# Create a quiz (requires teacher token + course ID)
TEACHER_TOKEN="teacher_jwt_token_here"
COURSE_ID="course_id_here"

curl -X POST http://localhost:5000/api/teacher/courses/$COURSE_ID/quizzes \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chapter 1 Quiz",
    "description": "Test your knowledge",
    "duration": 30,
    "passingScore": 60,
    "questions": [
      {
        "questionText": "What is 2+2?",
        "type": "mcq",
        "options": ["3", "4", "5"],
        "correctAnswer": "4",
        "points": 5
      }
    ]
  }'
```

### Test Student Functions (Via API)
```bash
# Get my enrolled courses
STUDENT_TOKEN="student_jwt_token_here"

curl -X GET http://localhost:5000/api/student/my-courses \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Get quizzes for a course
curl -X GET http://localhost:5000/api/student/courses/$COURSE_ID/quizzes \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Submit quiz answers
curl -X POST http://localhost:5000/api/student/quizzes/$QUIZ_ID/submit \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "question_id",
        "selectedAnswer": "4"
      }
    ],
    "timeSpent": 600
  }'
```

---

## 📂 Project Structure

```
lms-project/
├── backend/                          # Express.js API
│   ├── models/index.js              # Database models (Quiz, Assignment, etc.)
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── studentController.js     # NEW
│   │   ├── teacherController.js     # NEW
│   │   └── adminController.js       # NEW
│   ├── routes/                      # API routes
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js         # NEW
│   │   ├── teacherRoutes.js         # NEW
│   │   └── adminRoutes.js           # NEW
│   ├── middleware/
│   │   └── authMiddleware.js        # Role-based access control
│   ├── .env                         # Environment variables
│   └── index.js                     # Express app setup
│
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── redux/                   # State management
│   │   │   └── slices/              # Redux slices (to be created)
│   │   ├── pages/
│   │   │   ├── Dashboard/           # Dashboard pages (PENDING)
│   │   │   └── ...existing pages
│   │   ├── components/              # Reusable components
│   │   └── utils/api.js             # API integration
│   └── package.json
│
├── API_DOCUMENTATION.md             # Complete API reference
├── AUTH_GUIDE.md                    # Authentication guide
├── IMPLEMENTATION_SUMMARY.md        # What's done, what's pending
└── README.md                        # Project overview
```

---

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Development server (with auto-reload)
npm run dev

# Production start
npm start

# Run tests (when implemented)
npm test
```

### Frontend
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (when implemented)
npm test
```

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module" error
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: MongoDB connection failed
```bash
# Check:
1. Verify MONGO_URI in .env
2. Ensure internet connection (for MongoDB Atlas)
3. Check IP whitelist on MongoDB Atlas
```

### Issue: CORS error in frontend
```bash
# Frontend can't reach backend - check:
1. Backend is running on port 5000
2. Frontend CLIENT_URL is set correctly in backend .env
3. CORS is enabled in backend
```

### Issue: JWT token expired
```bash
# Login again to get new token
# Default token expiry: 30 days (JWT_EXPIRE=30d)
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `API_DOCUMENTATION.md` | Complete API endpoints reference |
| `AUTH_GUIDE.md` | Authentication & roles guide |
| `IMPLEMENTATION_SUMMARY.md` | What's built, what's pending |
| `.env.example` | Environment variables template |
| `README.md` | Project overview |

---

## 🎯 Next Steps

### For Frontend Development
1. Review `IMPLEMENTATION_SUMMARY.md` for pending tasks
2. Create Redux slices (quiz, assignment, materials, admin)
3. Build Student Dashboard components
4. Build Teacher Dashboard components
5. Build Admin Dashboard components

### For Testing
1. Use Postman or cURL for API testing
2. Test all endpoints with different roles
3. Verify role-based access control
4. Test file uploads (when implemented)

### For Production
1. Update `.env` with production values
2. Enable HTTPS
3. Add rate limiting
4. Implement logging
5. Setup database backups
6. Configure CDN for files
7. Setup monitoring

---

## 📞 Useful Links

- **Rest Client**: [Postman](https://www.postman.com/downloads/)
- **DB Management**: [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
- **API Testing**: [Thunder Client](https://www.thunderclient.com/) (VS Code extension)
- **Documentation**: See `API_DOCUMENTATION.md` in project root

---

## 💡 Tips & Best Practices

1. **Always use `.env` for sensitive data** - Never commit `.env` to git
2. **Test with multiple roles** - Verify access control works
3. **Check API response codes** - Use proper HTTP status codes
4. **Enable CORS carefully** - Specify origins instead of `*` in production
5. **Validate all inputs** - Both frontend and backend
6. **Use meaningful error messages** - Help developers debug
7. **Log important events** - For troubleshooting
8. **Keep tokens secure** - Store in httpOnly cookies or secure storage

---

## 🐛 Debugging

### View Backend Logs
```bash
# Run with logging
NODE_ENV=development npm run dev
```

### Browser DevTools
```
F12 → Network tab
- Check API requests/responses
- Verify headers and tokens
```

### MongoDB Query
```javascript
// In MongoDB Compass
db.quizzes.find()
db.assignments.find()
db.coursematerials.find()
```

---

## 🚀 Performance Tips

- Use pagination for large lists
- Cache static assets
- Optimize database queries with indexes
- Use CDN for file delivery
- Implement lazy loading for components
- Monitor API response times

---

## ✨ Version History

- **v1.0-beta** (April 13, 2025)
  - Backend implementation complete
  - Authentication system implemented
  - Quiz and assignment system ready
  - Material upload system ready
  - Admin management system ready
  - Frontend dashboards pending

---

## 📝 License

TLB LMS © 2025. All rights reserved.

---

**Happy Coding! 🚀**

For detailed API information, see `API_DOCUMENTATION.md`
For authentication details, see `AUTH_GUIDE.md`
