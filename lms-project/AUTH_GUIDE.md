# TLB LMS Authentication & Role-Based Access Control

## Overview
TLB LMS supports three user roles:
- **Student**: Regular users who enroll in courses
- **Instructor (Teacher)**: Users who create and teach courses
- **Admin**: System administrators with full access

---

## API Endpoints

### 1. Register as Student
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94701234567",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "avatar": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Register as Teacher/Instructor
```http
POST /api/auth/register-teacher
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+94702234567",
  "password": "TeacherPassword123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "instructor",
  "avatar": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Register as Admin
```http
POST /api/auth/register-admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@tlb.edu.lk",
  "phone": "+94701234567",
  "password": "AdminPassword123",
  "adminSecret": "TLB_ADMIN_SECRET_2025"
}
```

**Requirements:**
- Must provide correct `adminSecret` from `.env` file
- Admin secret: `TLB_ADMIN_SECRET_2025` (stored in `ADMIN_SECRET` env var)

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Admin User",
  "email": "admin@tlb.edu.lk",
  "role": "admin",
  "avatar": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Login (Any Role)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Note:** Can also use phone number instead of email

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "avatar": "",
  "wallet": 0,
  "enrolledCourses": [],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "avatar": "",
  "wallet": 0,
  "enrolledCourses": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "JavaScript Basics",
      "thumbnail": "...",
      "slug": "javascript-basics"
    }
  ],
  "wishlist": [],
  "notifications": []
}
```

---

## Middleware & Role Authorization

### Using Role Protection in Routes

**Admin Only:**
```javascript
import { protect, admin } from '../middleware/authMiddleware.js';

router.delete('/courses/:id', protect, admin, deleteCourse);
```

**Instructor/Teacher (or Admin):**
```javascript
import { protect, instructor } from '../middleware/authMiddleware.js';

router.post('/courses', protect, instructor, createCourse);
```

**Student Only:**
```javascript
import { protect, student } from '../middleware/authMiddleware.js';

router.post('/courses/:id/enroll', protect, student, enrollCourse);
```

**Any Logged-in User:**
```javascript
import { protect } from '../middleware/authMiddleware.js';

router.get('/profile', protect, getProfile);
```

---

## Available Middleware

- **`protect`** - Authentication (requires valid JWT token)
- **`admin`** - Admin-only access
- **`instructor`** - Instructor or Admin access
- **`student`** - Student-only access
- **`studentOrInstructor`** - Student, Instructor, or Admin access

---

## User Roles & Permissions

| Feature | Student | Instructor | Admin |
|---------|---------|-----------|-------|
| View Courses | ✅ | ✅ | ✅ |
| Enroll Courses | ✅ | ✅ | ✅ |
| Create Courses | ❌ | ✅ | ✅ |
| Edit Own Courses | ❌ | ✅ | ✅ |
| Delete Own Courses | ❌ | ✅ | ✅ |
| Delete Any Course | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Reports | ❌ | ✅ | ✅ |
| Manage Categories | ❌ | ❌ | ✅ |

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=30d

# Admin Registration
ADMIN_SECRET=TLB_ADMIN_SECRET_2025
```

**Important:** Change `ADMIN_SECRET` in production to a secure random value!

---

## Example Usage in Frontend (React)

### Register as Student
```javascript
const registerStudent = async (formData) => {
  const response = await axios.post('/api/auth/register', {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password
  });
  localStorage.setItem('token', response.data.token);
};
```

### Register as Teacher
```javascript
const registerTeacher = async (formData) => {
  const response = await axios.post('/api/auth/register-teacher', {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password
  });
  localStorage.setItem('token', response.data.token);
};
```

### Register as Admin
```javascript
const registerAdmin = async (formData) => {
  const response = await axios.post('/api/auth/register-admin', {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
    adminSecret: 'TLB_ADMIN_SECRET_2025'
  });
  localStorage.setItem('token', response.data.token);
};
```

### Login
```javascript
const login = async (email, password) => {
  const response = await axios.post('/api/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};
```

---

## Quick Start - Create First Admin

1. **Using the API:**
```bash
curl -X POST http://localhost:5000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@tlb.edu.lk",
    "phone": "+94701234567",
    "password": "AdminPassword123",
    "adminSecret": "TLB_ADMIN_SECRET_2025"
  }'
```

2. **Using MongoDB (Alternative):**
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@tlb.edu.lk",
  phone: "+94701234567",
  password: "$2a$10$...", // bcryptjs hashed password
  role: "admin",
  isVerified: true,
  createdAt: new Date()
})
```

---

## Troubleshooting

### "Invalid admin secret key"
- Make sure you're using the correct `ADMIN_SECRET` from `.env`
- The secret is case-sensitive
- Default: `TLB_ADMIN_SECRET_2025`

### "Not authorized, token failed"
- The JWT token is invalid or expired
- Make sure token is included in Authorization header: `Bearer <token>`

### "User already exists"
- Email or phone number is already registered
- Use a different email/phone for registration

---

## Security Notes

⚠️ **Important:**
- Never expose `ADMIN_SECRET` in frontend code
- Always use HTTPS in production
- Implement rate limiting on auth endpoints
- Hash passwords (automatically done by bcryptjs)
- Use strong JWT_SECRET in production
