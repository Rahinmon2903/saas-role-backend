
---

# 📘 BACKEND README (GitHub)

```md
# RBAC System – Backend API

A secure REST API implementing role-based access control, authentication, request workflows, notifications, and password recovery for internal SaaS platforms.

---

## 🚀 Live API

🔗https://saas-role-backend.onrender.com

---

## 🔐 Features

- JWT authentication
- Role-based authorization (Admin / Manager / User)
- Request lifecycle management
- Manager assignment & workload tracking
- Notification system
- Password reset via email
- Audit history logging
- Secure middleware-based access control

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs
- Brevo (SendinBlue) Email API

---

## 📂 Project Structure

```txt
src/
├── Controller/
│   ├── authController.js
│   ├── adminController.js
│   ├── requestController.js
│   └── notificationController.js
├── Model/
│   ├── userSchema.js
│   ├── requestSchema.js
│   └── notificationSchema.js
├── Middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── Route/
│   ├── authRoute.js
│   ├── adminRoute.js
│   ├── requestRoute.js
│   └── notificationRoute.js
├── utils/
│   └── sendEmail.js
├── config/
│   └── db.js
└── index.js

🧱 System Architecture Overview
High-level flow

React frontend (RBAC Dashboard)

Express / Node.js API

MongoDB database

Brevo (SendinBlue) for emails

JWT-based authentication

🧩 Architecture Diagram (Mermaid – GitHub ready)

✅ GitHub renders this automatically
Just paste this into your README

flowchart LR
    User[👤 User Browser]

    subgraph Frontend["Frontend (React + Tailwind)"]
        UI[RBAC Dashboard]
        Router[Protected Routes]
        Axios[Axios + JWT Interceptor]
    end

    subgraph Backend["Backend (Node.js + Express)"]
        API[REST API]
        Auth[Auth & RBAC Middleware]
        Controllers[Controllers]
    end

    subgraph Database["Database"]
        Mongo[(MongoDB)]
    end

    subgraph External["External Services"]
        Email[Brevo Email API]
    end

    User --> UI
    UI --> Router
    Router --> Axios
    Axios -->|JWT| API

    API --> Auth
    Auth --> Controllers

    Controllers --> Mongo
    Controllers --> Email

    Email --> User

🧠 Architecture Explanation (Readable & Interview-Ready)
1️⃣ Frontend (React)

Handles UI, routing, and user interaction

Uses Protected Routes to enforce role-based access

Axios interceptor attaches JWT to every request

Separate dashboards for Admin / Manager / User

2️⃣ Backend (Node.js + Express)

Central REST API

JWT authentication

Role-based authorization via middleware

Controllers handle:

Requests workflow

User management

Notifications

Password reset logic

3️⃣ Database (MongoDB)

Stores:

Users (roles, auth data)

Requests (status, history)

Notifications

Passwords are hashed

Reset tokens are hashed & time-limited

4️⃣ Email Service (Brevo)

Sends:

Password reset emails

Secure token-based reset links

Decoupled from main API logic

Clone repositories

url:https://github.com/Rahinmon2903/saas-role-backend

