# MediCare — Medical Chamber Management System

A modern, full-stack medical chamber management platform built as a SaaS web application. MediCare lets doctors run one or more private chambers, patients book a daily serial number online instead of a fixed time slot, and a platform admin oversees the system — from chamber schedules and prescriptions to a shared medicine reference list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL |
| HTTP Client | Axios / Fetch |
| Validation | Zod (backend DTOs) |
| Icons | Lucide React |
| Auth | JWT (JSON Web Tokens) |
| Language | TypeScript |

---

## Project Structure

```
MediCare/
├── frontend/               # Next.js application
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # Landing page
│       │   ├── login/                      # Login page
│       │   ├── register/                   # Registration page
│       │   ├── forgot-password/            # Password reset
│       │   └── dashboard/
│       │       ├── admin/                  # Admin portal
│       │       │   ├── doctors/
│       │       │   ├── patients/
│       │       │   ├── appointments/
│       │       │   ├── medicines/
│       │       │   ├── backups/
│       │       │   └── profile/
│       │       ├── doctor/                 # Doctor portal
│       │       │   ├── appointments/       # Daily serial queue
│       │       │   ├── patients/
│       │       │   ├── prescriptions/
│       │       │   ├── chambers/           # Chamber locations & schedules
│       │       │   └── profile/
│       │       └── patient/                # Patient portal
│       │           ├── book-appointment/   # Doctor → chamber → serial
│       │           ├── appointments/
│       │           ├── prescriptions/
│       │           └── profile/
│       ├── components/
│       │   └── DashboardLayout.tsx         # Shared sidebar layout
│       └── lib/
│           └── api/                        # API client (all endpoints)
│
└── backend/                # NestJS application
    └── src/
        ├── auth/           # JWT auth, login, register, password reset
        ├── admin/          # Admin routes & business logic
        ├── doctor/         # Doctor routes & business logic
        ├── chamber/        # Chamber CRUD (locations, schedules, fees)
        ├── patient/        # Patient routes & business logic
        └── entities/       # TypeORM entities (DB models)
```

---

## Database Schema

```
Admin          — adminId, fullName, phoneNumber, email
Doctor         — doctorId, fullName, phoneNumber, specialization, visitFee
Chamber        — chamberId, doctorId, name, address, days, startTime, endTime, visitFee
Patient        — patientId, fullName, phoneNumber, age, gender, address
Login          — loginId, email, password (bcrypt), role, adminId?, doctorId?, patientId?
Appointment    — appointmentId, doctorId, patientId, chamberId, date, serialNumber, status, reason
Medicine       — medicineId, name, type, strength, manufacturerName
Prescription   — prescriptionId, doctorId, patientId, date, medicineId, dosage, duration, notes
Backup         — backupId, fileName, createdAt, createdBy
```

---

## Features

### Admin Portal
- **Dashboard** — live stats (doctors, patients, chambers, appointments, medicines)
- **Doctors** — platform-wide read-only view of registered doctors
- **Patients** — platform-wide read-only view of registered patients
- **Appointments** — platform-wide read-only view of all bookings
- **Medicines** — add, list, delete the shared medicine reference list
- **Backups** — create and manage database backup records
- **Profile** — update name, email, phone, and password

### Doctor Portal
- **Dashboard** — profile overview and quick links
- **Chambers** — manage the locations, days, hours, and visit fee for each chamber
- **Appointments** — today's serial-ordered queue per chamber; call next / mark done / no-show
- **My Patients** — list of patients who have had appointments
- **Prescriptions** — view and issue digital prescriptions
- **Profile** — update professional info and login credentials

### Patient Portal
- **Dashboard** — personal info summary and quick links
- **Book Appointment** — pick a doctor, pick one of their chambers, and get the next serial number for that date
- **My Appointments** — view booking history and serial numbers, cancel active bookings
- **My Prescriptions** — view digital prescriptions with medicine details
- **Profile** — update personal information

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### 1 — Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE chamber_management_system;
```

### 2 — Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=chamber_management_system
JWT_SECRET=your_super_secret_key
```

Start the backend:

```bash
npm run start:dev
```

The API runs on **http://localhost:3001**

### 3 — Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

The app runs on **http://localhost:3000**

---

## User Roles & Default Credentials

| Role | Description |
|---|---|
| `admin` | Platform-level oversight — read-only visibility into doctors/patients/appointments, manages medicines and backups |
| `doctor` | Manages own chambers, appointment queue, patients, and prescriptions |
| `patient` | Books appointments against a chamber, views prescriptions, manages profile |

Register a new account at `/register` and select the appropriate role.

---

## API Overview

All endpoints are prefixed with `/api`.

| Module | Base Route | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `POST /forgot-password` |
| Admin | `/api/admin` | `/dashboard`, `/doctors`, `/patients`, `/appointments`, `/medicines`, `/backups`, `/profile` |
| Doctor | `/api/doctor` | `/profile`, `/appointments`, `/patients`, `/prescriptions` |
| Chamber | `/api/doctor/chambers` | CRUD for a doctor's chambers |
| Patient | `/api/patient` | `/profile`, `/doctors`, `/doctors/:doctorId/chambers`, `/appointments`, `/prescriptions` |

Protected routes require a `Bearer` token in the `Authorization` header.

---

## Development

```bash
# Run frontend dev server
cd frontend && npm run dev

# Run backend dev server
cd backend && npm run start:dev

# Type-check frontend
cd frontend && npx tsc --noEmit

# Build frontend for production
cd frontend && npm run build
```

---

## License

This project was built as a university assignment for the Web Technology course (9th Semester).
