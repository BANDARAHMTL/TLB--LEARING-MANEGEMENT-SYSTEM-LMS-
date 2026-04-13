# TLB LMS - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints (`/auth`)

### Register as Student
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94701234567",
  "password": "Password123"
}
```
**Response:** `201 Created`
```json
{
  "_id": "userId",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token"
}
```

### Register as Teacher
```http
POST /auth/register-teacher
```
Same payload as student registration. Creates user with `role: "instructor"`

### Register as Admin
```http
POST /auth/register-admin
{
  "name": "Admin User",
  "email": "admin@tlb.edu.lk",
  "phone": "+94701234567",
  "password": "AdminPassword123",
  "adminSecret": "TLB_ADMIN_SECRET_2025"
}
```
**Required:** `adminSecret` from `.env` file

### Login
```http
POST /auth/login
{
  "email": "user@example.com",
  "password": "Password123"
}
```
**Response:** Returns user data with JWT token

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```
Returns authenticated user's full profile

### Forgot Password
```http
POST /auth/forgot-password
{
  "email": "user@example.com"
}
```

### Reset Password
```http
PUT /auth/reset-password/:token
{
  "password": "NewPassword123"
}
```

---

## 👨‍🏫 Teacher Endpoints (`/teacher`)

All require: `Authorization` + `instructor` role middleware

### Materials Management

#### Upload Material (PDF)
```http
POST /teacher/courses/:courseId/materials
{
  "title": "Lecture 1 Notes",
  "description": "Introduction to course",
  "fileUrl": "https://cloudinary.com/...",
  "fileName": "lecture1.pdf",
  "fileSize": 2048,
  "section": "Introduction"
}
```

#### Get Course Materials
```http
GET /teacher/courses/:courseId/materials
```

#### Delete Material
```http
DELETE /teacher/materials/:materialId
```

### Quiz Management

#### Create Quiz
```http
POST /teacher/courses/:courseId/quizzes
{
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
    },
    {
      "questionText": "Is the sky blue?",
      "type": "trueFalse",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "points": 3
    }
  ]
}
```

#### Get Course Quizzes
```http
GET /teacher/courses/:courseId/quizzes
```

#### Update Quiz
```http
PUT /teacher/quizzes/:quizId
{
  "title": "Updated title",
  "duration": 45,
  "passingScore": 70
}
```

#### Delete Quiz
```http
DELETE /teacher/quizzes/:quizId
```

### Assignment Management

#### Create Assignment
```http
POST /teacher/courses/:courseId/assignments
{
  "title": "Project Work",
  "description": "Complete the project",
  "instructions": "Follow the guidelines...",
  "deadline": "2025-05-30T23:59:59Z",
  "totalPoints": 100
}
```

#### Get Course Assignments
```http
GET /teacher/courses/:courseId/assignments
```

#### Update Assignment
```http
PUT /teacher/assignments/:assignmentId
```

#### Delete Assignment
```http
DELETE /teacher/assignments/:assignmentId
```

#### Get Assignment Submissions
```http
GET /teacher/assignments/:assignmentId/submissions
```
**Response:**
```json
{
  "assignment": {...},
  "submissions": [
    {
      "student": "studentId",
      "submissionFile": "url",
      "submittedAt": "2025-04-15T10:30:00Z",
      "grade": 85,
      "isGraded": true
    }
  ]
}
```

#### Grade Student Submission
```http
PUT /teacher/assignments/:assignmentId/submissions/:studentId
{
  "grade": 85,
  "feedback": "Great work!"
}
```

#### Get Teacher Stats
```http
GET /teacher/stats
```
**Response:**
```json
{
  "totalCourses": 5,
  "totalQuizzes": 12,
  "totalAssignments": 8,
  "totalQuizSubmissions": 45
}
```

---

## 🎓 Student Endpoints (`/student`)

All require: `Authorization` + `student` role middleware

### My Courses

#### Get Enrolled Courses
```http
GET /student/my-courses
```

#### Get Course Progress
```http
GET /student/courses/:courseId/progress
```
**Response:**
```json
{
  "completionPercentage": 65,
  "completedLectures": [...],
  "isCompleted": false,
  "certificateIssued": false
}
```

### Materials

#### Get Course Materials
```http
GET /student/courses/:courseId/materials
```

#### Download Material
```http
GET /student/materials/:materialId/download
```
**Response:**
```json
{
  "fileUrl": "cloudinary_url",
  "title": "Lecture Notes",
  "fileName": "lecture1.pdf"
}
```

### Quizzes

#### Get Course Quizzes
```http
GET /student/courses/:courseId/quizzes
```

#### Get Quiz Details
```http
GET /student/quizzes/:quizId
```
**Response:** Quiz with questions (without revealing answers initially)

#### Submit Quiz Answers
```http
POST /student/quizzes/:quizId/submit
{
  "answers": [
    {
      "questionId": "qId1",
      "selectedAnswer": "4"
    },
    {
      "questionId": "qId2",
      "selectedAnswer": "True"
    }
  ],
  "timeSpent": 1200
}
```
**Response:**
```json
{
  "_id": "submissionId",
  "score": 8,
  "percentage": 80,
  "isPassed": true,
  "feedback": "Congratulations! You passed the quiz."
}
```

#### Get Quiz Result
```http
GET /student/quizzes/:quizId/result
```
Returns detailed result with correct answers and explanation

### Assignments

#### Get Course Assignments
```http
GET /student/courses/:courseId/assignments
```

#### Get Assignment Details
```http
GET /student/assignments/:assignmentId
```

#### Submit Assignment
```http
POST /student/assignments/:assignmentId/submit
{
  "submissionFile": "https://cloudinary.com/..."
}
```

#### Get My Submissions
```http
GET /student/my-submissions
```
**Response:**
```json
{
  "quizzes": [...],
  "assignments": [...],
  "total": 15
}
```

---

## 👨‍💼 Admin Endpoints (`/admin`)

All require: `Authorization` + `admin` role middleware

### User Management

#### Get All Users
```http
GET /admin/users?role=student&search=john&page=1&limit=10
```

#### Get Single User
```http
GET /admin/users/:userId
```

#### Create User
```http
POST /admin/users
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+94701234567",
  "password": "Password123",
  "role": "student"
}
```
**Roles:** `student`, `instructor`, `admin`

#### Update User
```http
PUT /admin/users/:userId
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "instructor",
  "isVerified": true
}
```

#### Delete User
```http
DELETE /admin/users/:userId
```

### Course Management

#### Get All Courses
```http
GET /admin/courses?category=tech&status=published&page=1&limit=10
```

#### Create Course
```http
POST /admin/courses
{
  "title": "React Basics",
  "description": "Learn React",
  "category": "categoryId",
  "instructor": "instructorUserId",
  "price": 99
}
```

#### Update Course
```http
PUT /admin/courses/:courseId
{
  "title": "Updated title",
  "price": 149
}
```

#### Delete Course
```http
DELETE /admin/courses/:courseId
```

### Order Management

#### Get All Orders
```http
GET /admin/orders?status=completed&page=1&limit=10
```
**Status options:** `pending`, `completed`, `failed`, `refunded`

#### Update Order Status
```http
PUT /admin/orders/:orderId
{
  "paymentStatus": "completed"
}
```

### Dashboard

#### Get Dashboard Stats
```http
GET /admin/stats
```
**Response:**
```json
{
  "users": {
    "total": 150,
    "students": 120,
    "instructors": 25,
    "admins": 5
  },
  "courses": 30,
  "orders": {
    "total": 200,
    "completed": 180
  },
  "revenue": 45000
}
```

---

## 📚 Courses Endpoints (`/courses`)

### Browse Courses
```http
GET /courses?category=tech&level=beginner&sort=newest&page=1&limit=12
```

### Get Course Details
```http
GET /courses/:slug
```

### Get Featured Courses
```http
GET /courses/featured
```

### Get Categories
```http
GET /categories
```

---

## 🛒 Orders Endpoints (`/orders`)

### Get My Orders
```http
GET /orders/myorders
Authorization: Bearer <token>
```

### Create Order (Enroll in Course)
```http
POST /orders
Authorization: Bearer <token>
{
  "courseIds": ["courseId1", "courseId2"],
  "paymentMethod": "stripe"
}
```

### Mark Order as Paid
```http
PUT /orders/:orderId/pay
```

---

## ⭐ Reviews Endpoints (`/reviews`)

### Get Course Reviews
```http
GET /reviews/course/:courseId
```

### Create Review
```http
POST /reviews
Authorization: Bearer <token>
{
  "course": "courseId",
  "rating": 5,
  "comment": "Excellent course!"
}
```

---

## 👤 User Endpoints (`/users`)

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
{
  "name": "New Name",
  "bio": "Bio text",
  "avatar": "avatar_url"
}
```

### Toggle Wishlist
```http
POST /users/wishlist/:courseId
Authorization: Bearer <token>
```

### Mark Notifications as Read
```http
PUT /users/notifications/read
Authorization: Bearer <token>
```

---

## Error Response Format

All errors follow this format:
```json
{
  "message": "Error message",
  "status": 400
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Testing with cURL

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Example: Get Enrolled Courses (Student)
```bash
curl -X GET http://localhost:5000/api/student/my-courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Create Quiz (Teacher)
```bash
curl -X POST http://localhost:5000/api/teacher/courses/COURSE_ID/quizzes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quiz Title",
    "questions": [...]
  }'
```

---

## Pagination

All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Response includes:
```json
{
  "data": [...],
  "totalItems": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

---

## File Upload

For file uploads (materials, assignments), use Cloudinary URLs:
1. Upload file to Cloudinary
2. Get the secure URL
3. Pass URL in request body

Example:
```json
{
  "fileUrl": "https://res.cloudinary.com/...",
  "fileName": "document.pdf"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- Auth endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

---

Last Updated: April 13, 2025
