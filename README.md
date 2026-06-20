# MediCare — Clinic Management System

A modern, full-stack clinic management platform built as a SaaS web application. MediCare lets administrators, doctors, and patients manage the complete clinic workflow — from appointments and prescriptions to medicine inventory — from a single platform.

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
│       │       │   ├── appointments/
│       │       │   ├── patients/
│       │       │   ├── prescriptions/
│       │       │   ├── slots/
│       │       │   └── profile/
│       │       └── patient/                # Patient portal
│       │           ├── book-appointment/
│       │           ├── appointments/
│       │           ├── prescriptions/
│       │           └── profile/
│       ├── components/
│       │   └── DashboardLayout.tsx         # Shared sidebar layout
│       └── lib/
│           └── api.ts                      # API client (all endpoints)
│
└── backend/                # NestJS application
    └── src/
        ├── auth/           # JWT auth, login, register, password reset
        ├── admin/          # Admin routes & business logic
        ├── doctor/         # Doctor routes & business logic
        ├── patient/        # Patient routes & business logic
        └── entities/       # TypeORM entities (DB models)
```

---

## Database Schema

```
Admin          — adminId, fullName, phoneNumber, email
Doctor         — doctorId, fullName, phoneNumber, specialization, visitFee
Patient        — patientId, fullName, phoneNumber, age, gender, address
Login          — loginId, email, password (bcrypt), role, adminId?, doctorId?, patientId?
Appointment    — appointmentId, doctorId, patientId, date, time, status, reason
AppointmentSlot— slotId, doctorId, startTime, endTime, days
Medicine       — medicineId, name, type, strength, manufacturerName, status
Prescription   — prescriptionId, doctorId, patientId, date, medicineId, dosage, duration, notes
Backup         — backupId, fileName, createdAt, createdBy
```

---

## Features

### Admin Portal
- **Dashboard** — live stats (doctors, patients, appointments, medicines)
- **Doctors** — view, edit, delete doctor records
- **Patients** — view, edit, delete patient records
- **Appointments** — filter by status, update appointment status, delete
- **Medicines** — add medicines, activate/deactivate, delete
- **Backups** — create and manage database backup records
- **Profile** — update name, email, phone, and password

### Doctor Portal
- **Dashboard** — profile overview and quick links
- **Appointments** — view all scheduled appointments with status filtering
- **My Patients** — list of patients who have had appointments
- **Prescriptions** — view and issue digital prescriptions
- **Slots** — manage available appointment time windows per day
- **Profile** — update professional info and login credentials

### Patient Portal
- **Dashboard** — personal info summary and quick links
- **Book Appointment** — browse doctors and book a visit with date/time/reason
- **My Appointments** — view booking history, cancel active appointments
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
CREATE DATABASE clinic_management_system;
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
DB_NAME=clinic_management_system
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
| `admin` | Full system access — manage doctors, patients, medicines, backups |
| `doctor` | Manage own appointments, patients, prescriptions, and slots |
| `patient` | Book appointments, view prescriptions, manage profile |

Register a new account at `/register` and select the appropriate role.

---

## API Overview

All endpoints are prefixed with `/api`.

| Module | Base Route | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | `POST /login`, `POST /register`, `POST /forgot-password` |
| Admin | `/api/admin` | `/dashboard`, `/doctors`, `/patients`, `/appointments`, `/medicines`, `/backups`, `/profile` |
| Doctor | `/api/doctor` | `/profile`, `/appointments`, `/patients`, `/prescriptions`, `/slots` |
| Patient | `/api/patient` | `/profile`, `/doctors`, `/appointments`, `/prescriptions` |

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
