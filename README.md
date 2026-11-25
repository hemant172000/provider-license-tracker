# Provider License Tracker

A full-stack web application for tracking healthcare provider licenses and their documents, with role-based dashboards for each type of user.

> Demo project. It contains no real data. All users, names and documents are fake.

## Features
- JWT authentication with role-based access control (Admin, Team Leader, Group Manager, Team, Provider)
- Provider profile and license records
- Document upload, download and version history
- User activity tracking (active, idle, away, break)
- Admin dashboard for user management

## Tech stack
- **Backend:** Java 17, Spring Boot, Spring Security, JWT, JPA/Hibernate
- **Database:** PostgreSQL
- **Frontend:** React, Axios

## Run locally

### Prerequisites
- JDK 17
- PostgreSQL 17
- Node.js 18 or later

### 1. Database
```bash
psql -U postgres -c "CREATE USER admin1 WITH PASSWORD 'secret';"
psql -U postgres -c "CREATE DATABASE license_tracker OWNER admin1;"
```
Tables are created automatically on first start.

### 2. Backend
```bash
cd backend
mvnw.cmd spring-boot:run
```
On macOS/Linux use `./mvnw spring-boot:run`. The API runs on http://localhost:8080.

The database password and JWT secret in `application.properties` are demo-only defaults. For any real deployment, set these environment variables:

| Variable | Default (demo) | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/license_tracker` | Database URL |
| `DB_USERNAME` | `admin1` | Database user |
| `DB_PASSWORD` | `secret` | Database password |
| `JWT_SECRET` | demo value | Signing key, 32+ characters |

### 3. Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm start
```
On macOS/Linux use `cp .env.example .env`. The app runs on http://localhost:3000.

### 4. Log in
A default admin user is created on first start: `admin` / `admin123` (demo only). Create the other roles from the admin dashboard.

## Screenshots
Add screenshots here (fake data only).

## Notes
Uploaded files are stored in an `uploads/` folder next to where the backend is run.