# E-Learning Platform API V2

A robust RESTful API for an e-learning platform that enables course management, student enrollment, and progress tracking. Built with Node.js, Express, and MongoDB.

## Table of Contents

-  [Features](#features)
-  [Installation](#installation)
-  [Environment Variables](#environment-variables)
-  [Email Functionality](#email-functionality)
-  [Course Media Upload](#course-media-upload)
-  [Analytics](#analytics)
-  [API Documentation](#api-documentation)
-  [Authentication](#authentication)
-  [Third-Party Integration](#third-party-integration)
-  [Error Handling](#error-handling)
-  [Deployment](#deployment)

## Features

-  **User Management**

   -  Role-based access control (Student, Instructor)
   -  JWT and Bcrypt authentication
   -  Secure password handling
   -  Email notifications for account actions

-  **Course Management**

   -  Create, read, update, and delete courses
   -  Course enrollment system
   -  Media upload support (images, videos, documents)
   -  Course analytics and tracking

-  **Student Management**

   -  Student enrollment
   -  Course removal
   -  Progress tracking

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/e-learning.git
cd e-learning
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret

# Email Configuration
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
APP_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Email Functionality

The platform uses Nodemailer for sending automated emails. The following features are supported:

### Email Notifications

1. **Account Creation**

   -  Welcome emails for new students and instructors
   -  Customized messages based on user role

2. **Password Management**

   -  Password reset requests
   -  Password change confirmations
   -  Security notifications

3. **Course Updates**
   -  Enrollment confirmations
   -  Course completion notifications
   -  Important announcements

### Email Configuration

The email service is configured using Gmail SMTP. To set up:

1. Enable 2-factor authentication in your Gmail account
2. Generate an App Password
3. Add the credentials to your `.env` file

## Course Media Upload

The platform supports media uploads using Cloudinary and Multer:

### Supported Media Types

-  Images (JPG, PNG, GIF)
-  Videos (MP4)
-  Documents (PDF, DOC, DOCX)

### Upload Configuration

1. **Cloudinary Setup**

   -  Create a Cloudinary account
   -  Configure cloud name, API key, and secret
   -  Add credentials to `.env` file

2. **Upload Limits**
   -  Maximum file size: 5MB

### Usage Example

```javascript
const upload = multer({
   storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
         folder: "course-media",
      },
   }),
});

// Use in route
router.post("/upload", upload.single("media"), async (req, res) => {
   // Handle upload
});
```

## Analytics

The platform includes built-in analytics features:

### User Analytics

-  Active user tracking

### Course Analytics

-  Enrollment statistics

## API Documentation

## Authentication

### Overview

The API uses JWT (JSON Web Tokens) for authentication and Bcrypt for password hashing. All protected routes require a valid JWT token in the Authorization header.

### Authentication Endpoints

#### Register User

```http
POST /api/auth/signup
```

Request Body:

```json
{
   "username": "johndoe",
   "email": "john@example.com",
   "password": "securepassword123",
   "role": "student" // or "instructor"
}
```

Response:

```json
{
   "message": "User registered successfully",
   "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "student"
   }
}
```

#### Login User

```http
POST /api/auth/login
```

Request Body:

```json
{
   "email": "john@example.com",
   "password": "securepassword123"
}
```

Response:

```json
{
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Forget Password

```http
POST /api/auth/forget-password
```

Request Body:

```json
{
   "email": "john@example.com"
}
```

Response:

```json
{
   "message": "Password reset email has been sent"
}
```

#### Reset Password

```http
POST /api/auth/reset-password/resetToken
```

Request Body:

```json
{
   "email": "john@example.com"
}
```

Response:

```json
{
   "message": "Password has been reset successfully"
}
```

#### Change Password

```http
POST /api/auth/change-password
```

Request Body:

```json
{
   "currentPassword": "securePassword123",
   "newPassword": "newSecurePassword456"
}
```

Response:

```json
{
   "message": "Password has been changed successfully"
}
```

### Error Responses

#### Authentication Errors

```json
{
   "message": "Invalid credentials"
}
```

Status: 400

```json
{
   "message": "Invalid token"
}
```

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Course Endpoints

#### Get All Courses

```http
GET /api/courses
Authorization: Bearer <instructor-jwt-token>
```

Returns a list of all available courses.

#### Create Course (Instructor Only)

```http
POST /api/courses
Authorization: Bearer <instructor-jwt-token>
```

Request Body:

```json
{
   "title": "Web Development",
   "description": "Learn web development",
   "duration": "3 months",
   "price": 99.99
}
```

Response:

```json
{
   "message": "Course created successfully"
}
```

#### Update Course (Instructor Only)

```http
PATCH /api/courses/:courseId
Authorization: Bearer <instructor-jwt-token>
```

Request Body:

```json
{
   "duration": "2 months",
   "price": 69.99
}
```

Response:

```json
{
   "message": "Course updated successfully"
}
```

#### Delete Course (Instructor Only)

```http
DELETE /api/courses/:courseId
Authorization: Bearer <instructor-jwt-token>
```

Response:

```json
{
   "message": "Course deleted successfully"
}
```

### Student Management Endpoints

#### Enroll in Course (Student Only)

```http
POST /api/courses/:courseId/enroll
Authorization: Bearer <student-jwt-token>
```

Response:

```json
{
   "message": "Enrolled successfully"
}
```

## Third-Party Integration

### Course Media Upload (Instructor only)

```http
POST /api/courses/courseId/upload
Authorization: Bearer <instructor-jwt-token>
```

Response:

```json
{
   "message": "Media file uploaded successfully"
}
```

### Analytics

```http
GET /api/courses/analytics/summary
Authorization: Bearer <instructor-jwt-token>
```

Response:

```json
{
   "totalCourses": 1,
   "totalEnrollments": 3
}
```

## Error Handling

The API uses standard HTTP status codes and returns JSON error responses:

```json
{
   "message": "Error description"
}
```

Common status codes:

-  200: Success
-  201: Created
-  400: Bad Request
-  401: Unauthorized
-  403: Forbidden
-  404: Not Found
-  500: Internal Server Error

## Postman Documentation

-  Link: https://documenter.getpostman.com/view/32577214/2sB2cbbKK5
-  Variables:
   -  {{baseUrl}}: Change it to your API URL or http://localhost:3000
   -  {{authToken}}: Change after successful login.
   -  {{courseId}}: Change to a valid course ID.
   -  {{studentId}}: Change to a valid student ID.

## Deployment

-  This API is deployed on Render at https://e-learning-api-v2.onrender.com

## Acknowledgments

-  Express.js
-  MongoDB
-  JWT
-  Mongoose
-  Bcrypt
