# Task Manager Backend (task-04)

A Node.js + Express backend for managing tasks with authentication, role-based access, and password reset via email.  
Database is MySQL (via XAMPP).

---

## Features

- **User Authentication**
  - Register, Login with JWT
  - Role-based access (`admin` / `user`)
- **Task Management**
  - CRUD tasks
  - Search, filter by status, sort by creation
  - Admins can view/delete all tasks
- **Password Reset**
  - Secure password reset with email link
- **Security**
  - JWT authentication middleware
  - Encrypted passwords with bcrypt
- **Error Handling & Logging**
  - Centralized error handler
  - Logging

---

## 📂 Project Structure

backend/
│── config/
│ └── db.js # MySQL connection pool
│── controllers/
│ ├── authController.js
│ └── taskController.js
│── middleware/
│ ├── authMiddleware.js
│ ├── errorHandler.js
│ └── roleMiddleware.js
│── models/
│ ├── userModel.js
│ ├── taskModel.js
│ └── tokenModel.js
│── routes/
│ ├── authRoutes.js
│ └── taskRoutes.js
│── utils/
│ ├── logger.js
│ └── mailer.js
│── database.sql # Schema for MySQL
│── server.js # Entry point
│── package.json
│── .env

---

## Installation & Setup

clone this repo

```bash
cd backend
npm install

```

Start Apache & MySQL in XAMPP Control Panel.

Open http://localhost/phpmyadmin.

Use database.sql script to create tables

```bash
node server.js

```

## API Endpoints

| Method | Endpoint                           | Description        |
| ------ | ---------------------------------- | ------------------ |
| POST   | `/api/auth/register`               | Register new user  |
| POST   | `/api/auth/login`                  | Login & get JWT    |
| POST   | `/api/auth/request-password-reset` | Request reset link |
| POST   | `/api/auth/reset-password`         | Reset password     |

## Tasks (Protected)

Requires Authorization: Bearer <token>

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| POST   | `/api/tasks`     | Create task                           |
| GET    | `/api/tasks`     | Get tasks (admin = all, user = own)   |
| PUT    | `/api/tasks/:id` | Update task                           |
| DELETE | `/api/tasks/:id` | Delete task (admin = any, user = own) |
