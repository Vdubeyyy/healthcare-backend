# 🏥 Healthcare Backend Management System

A robust, secure, and production-ready RESTful backend system for a healthcare application built with **Node.js**, **Express**, **Sequelize ORM** (providing the same model relationships and migrations as Django ORM), **PostgreSQL** support, and **JWT Authentication** (via `jsonwebtoken` and `bcryptjs`).

---

## 🌟 Key Features

- **JWT Authentication**: Secure user registration and login with bcrypt password hashing and 24h expiration tokens.
- **Role & Record Ownership**: Patient records are securely tied to the authenticated user who created them (`created_by`).
- **Doctor Management**: Full CRUD operations for medical practitioners with specializations and schedules.
- **Patient-Doctor Mapping**: Assign doctors to patients with appointment scheduling and consultation notes, preventing duplicate assignments.
- **PostgreSQL Ready with Zero-Config Fallback**: Built-in support for PostgreSQL databases (`pg`/`pg-hstore`) and automated local fallback for immediate out-of-the-box evaluation.
- **Interactive API Studio**: A built-in web test studio at `http://localhost:5000/` with live API response logs.
- **Interactive Swagger / OpenAPI Docs**: Explore and execute requests directly at `http://localhost:5000/api/docs`.
- **Postman Collection Included**: Ready-to-import `Healthcare_Backend.postman_collection.json`.
- **Comprehensive Automated Tests**: 100% test pass rate across 21 integration tests covering all endpoints.

---

## 🏗️ Project Architecture

```
healthcare-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection (PostgreSQL / SQLite)
│   │   ├── jwt.js               # JWT signing and verification helpers
│   │   └── swagger.json         # OpenAPI 3.0 specification
│   ├── controllers/
│   │   ├── auth.controller.js   # User registration & login
│   │   ├── patient.controller.js# Patient CRUD & user-scoping
│   │   ├── doctor.controller.js # Doctor CRUD
│   │   └── mapping.controller.js# Patient-Doctor associations
│   ├── middleware/
│   │   ├── auth.middleware.js   # Bearer JWT token verification
│   │   ├── error.middleware.js  # Centralized error handler
│   │   └── validation.middleware.js # express-validator wrapper
│   ├── models/
│   │   ├── index.js             # Model associations & relations
│   │   ├── user.model.js        # User model
│   │   ├── patient.model.js     # Patient model
│   │   ├── doctor.model.js      # Doctor model
│   │   └── mapping.model.js     # PatientDoctorMapping model
│   ├── routes/
│   │   ├── index.js             # Main router
│   │   ├── auth.routes.js       # /api/auth/*
│   │   ├── patient.routes.js    # /api/patients/*
│   │   ├── doctor.routes.js     # /api/doctors/*
│   │   └── mapping.routes.js    # /api/mappings/*
│   ├── public/                  # Interactive API Studio Web UI
│   │   ├── index.html
│   │   └── app.js
│   ├── utils/
│   │   └── response.js          # Standardized API response formatter
│   └── app.js                   # Application entry point
├── tests/
│   ├── auth.test.js             # Auth test suite
│   ├── patients.test.js         # Patients test suite
│   ├── doctors.test.js          # Doctors test suite
│   └── mappings.test.js         # Mappings test suite
├── Healthcare_Backend.postman_collection.json
├── .env.example
├── .env
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL** (Optional for production; local development will default to SQLite if PostgreSQL daemon is offline).

### 2. Installation
```bash
# Navigate to the project directory
cd healthcare-backend

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the template `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `.env` settings:
```ini
PORT=5000
NODE_ENV=development

# Database Configuration: 'postgres' or 'sqlite'
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Or using a single connection string:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/healthcare_db

# JWT Configuration
JWT_SECRET=super_secret_healthcare_jwt_key_2026
JWT_EXPIRES_IN=24h
```

### 4. Running the Server
```bash
npm start
```
Or with auto-reload during development:
```bash
npm run dev
```

The server will be available at:
- **Base API**: `http://localhost:5000/api`
- **Interactive Web Studio**: `http://localhost:5000/`
- **Swagger Documentation**: `http://localhost:5000/api/docs`

---

## 🧪 Running the Automated Test Suite

Run the full Jest test suite with in-memory database isolation:
```bash
npm test
```

Expected output:
```
PASS tests/auth.test.js
PASS tests/patients.test.js
PASS tests/doctors.test.js
PASS tests/mappings.test.js

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

---

## 📋 API Specification & Endpoints

All endpoints support both trailing slashes (Django-style, e.g., `/api/patients/`) and standard URLs (`/api/patients`).

### 1. Authentication APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Public | Register new user with name, email, password |
| `POST` | `/api/auth/login/` | Public | Log in user and return JWT token |
| `GET` | `/api/auth/me/` | Bearer Token | Get current authenticated user profile |

#### Register Request Body:
```json
{
  "name": "Dr. Sarah Connor",
  "email": "sarah@healthcare.com",
  "password": "SecurePass123"
}
```

#### Login Request Body:
```json
{
  "email": "sarah@healthcare.com",
  "password": "SecurePass123"
}
```

---

### 2. Patient Management APIs

*All patient endpoints require a Bearer JWT Token.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/patients/` | Authenticated | Add a new patient |
| `GET` | `/api/patients/` | Authenticated | Retrieve all patients created by the authenticated user |
| `GET` | `/api/patients/<id>/` | Authenticated | Get details of a specific patient |
| `PUT` | `/api/patients/<id>/` | Authenticated | Update patient details (creator only) |
| `DELETE`| `/api/patients/<id>/` | Authenticated | Delete a patient record (creator only) |

#### Add Patient Request Body:
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "contact": "+1-555-0199",
  "address": "123 Elm Street",
  "medical_history": "Hypertension"
}
```

---

### 3. Doctor Management APIs

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/doctors/` | Authenticated | Add a new doctor |
| `GET` | `/api/doctors/` | Public | Retrieve all registered doctors |
| `GET` | `/api/doctors/<id>/` | Public | Get details of a specific doctor |
| `PUT` | `/api/doctors/<id>/` | Authenticated | Update doctor details |
| `DELETE`| `/api/doctors/<id>/` | Authenticated | Delete a doctor record |

#### Add Doctor Request Body:
```json
{
  "name": "Dr. Gregory House",
  "specialization": "Diagnostic Medicine",
  "email": "house@hospital.org",
  "phone": "+1-555-0144",
  "available_days": "Monday, Wednesday, Friday"
}
```

---

### 4. Patient-Doctor Mapping APIs

*All mapping endpoints require a Bearer JWT Token.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/mappings/` | Authenticated | Assign a doctor to a patient |
| `GET` | `/api/mappings/` | Authenticated | Retrieve all patient-doctor mappings |
| `GET` | `/api/mappings/<patient_id>/` | Authenticated | Get all doctors assigned to a specific patient |
| `DELETE`| `/api/mappings/<id>/` | Authenticated | Remove a doctor from a patient (by mapping ID) |

#### Assign Doctor Request Body:
```json
{
  "patient_id": 1,
  "doctor_id": 1,
  "appointment_date": "2026-11-01T10:00:00Z",
  "notes": "Follow-up consultation"
}
```

---

## 📮 Postman Collection

Import `Healthcare_Backend.postman_collection.json` into Postman:
1. Open Postman -> Click **Import**.
2. Select the file `Healthcare_Backend.postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000`.
4. Run the **Register** or **Login** request. The test script will automatically capture and save the `token` collection variable for all subsequent requests!

---

## 🔒 Security Best Practices Implemented

- Passwords hashed with `bcryptjs` using 10 salt rounds.
- Passwords are automatically excluded from JSON responses.
- JWT verification on protected endpoints with expiration checking.
- Unique constraints on User emails, Doctor emails, and `[patient_id, doctor_id]` pairs to prevent duplicate assignments.
- Strict input sanitization and validation on all request parameters and bodies.
