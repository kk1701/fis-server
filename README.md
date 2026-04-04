# FIS Server

Backend API for the **Faculty Information System (FIS)** — a platform for managing faculty profiles, academic contributions, research output, and institutional analytics.

Built with **NestJS + Prisma + PostgreSQL**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (passport-jwt) |
| Password Hashing | bcrypt |
| File Uploads | Multer + Cloudinary |
| Email | Resend |
| Validation | class-validator + class-transformer |

---

## Prerequisites

- Node.js v18+
- PostgreSQL (local or hosted)
- Cloudinary account (for profile picture uploads)
- Resend account (for OTP emails)

---

## Project Setup

```bash
# clone and install
npm install

# copy environment file
cp .env.example .env
```

---

## Environment Variables

Create a `.env` file at the project root with the following:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fis"

JWT_SECRET="your_jwt_secret_here"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

RESEND_API_KEY="re_your_api_key_here"
FROM_EMAIL="onboarding@resend.dev"
```

---

## Database Setup

```bash
# run migrations
npx prisma migrate dev

# seed admin account and sample department
npm run seed
```

---

## Running the App

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

Server runs on `http://localhost:3000` by default.

---

## API Overview

All routes are prefixed relative to the base URL. Protected routes require a `Bearer` token in the `Authorization` header.

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new faculty |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Get current user info |
| POST | `/auth/forgot-password` | Public | Send OTP to email |
| POST | `/auth/verify-otp` | Public | Verify OTP, get reset token |
| POST | `/auth/reset-password` | Public | Reset password using token |
| PATCH | `/auth/change-password` | Authenticated | Change own password |

### Faculty Profile
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/faculty/profile` | Faculty | Get own profile |
| PATCH | `/faculty/profile/personal` | Faculty (Approved) | Update personal info |
| PATCH | `/faculty/profile/academic` | Faculty (Approved) | Update academic info |
| POST | `/faculty/profile/picture` | Faculty (Approved) | Upload profile picture |
| GET | `/faculty/addresses` | Faculty (Approved) | Get own addresses |
| PATCH | `/faculty/addresses` | Faculty (Approved) | Add/update address |
| DELETE | `/faculty/addresses` | Faculty (Approved) | Delete address |
| GET | `/faculty/directory` | Public | Paginated faculty directory |
| GET | `/faculty/:id/public` | Public | Single faculty public profile |

### Faculty Education
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/faculty/education` | Faculty (Approved) | Add degree record |
| GET | `/faculty/education` | Faculty (Approved) | Get own degrees |
| PATCH | `/faculty/education/:id` | Faculty (Approved) | Update degree |
| DELETE | `/faculty/education/:id` | Faculty (Approved) | Delete degree |

### Faculty Courses
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/faculty/courses` | Faculty (Approved) | Add course record |
| GET | `/faculty/courses` | Faculty (Approved) | Get own courses |
| GET | `/faculty/:id/courses` | Public | Get faculty's courses |
| PATCH | `/faculty/courses/:id` | Faculty (Approved) | Update course record |
| DELETE | `/faculty/courses/:id` | Faculty (Approved) | Delete course record |

### Faculty Experiences
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/faculty/experiences` | Faculty (Approved) | Add experience entry |
| GET | `/faculty/experiences` | Faculty (Approved) | Get own experiences |
| GET | `/faculty/:id/experiences` | Public | Get faculty's experiences |
| PATCH | `/faculty/experiences/:id` | Faculty (Approved) | Update experience |
| DELETE | `/faculty/experiences/:id` | Faculty (Approved) | Delete experience |

### Faculty Publications
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/faculty/publications` | Faculty (Approved) | Add publication |
| GET | `/faculty/publications` | Faculty (Approved) | Get own publications |
| GET | `/faculty/:id/publications` | Public | Get faculty's publications |
| PATCH | `/faculty/publications/:id` | Faculty (Approved) | Update publication |
| DELETE | `/faculty/publications/:id` | Faculty (Approved) | Delete publication |

### Faculty Supervision (Thesis & Dissertation)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/faculty/thesis` | Faculty (Approved) | Add thesis supervision |
| GET | `/faculty/thesis` | Faculty (Approved) | Get own theses |
| PATCH | `/faculty/thesis/:id` | Faculty (Approved) | Update thesis |
| DELETE | `/faculty/thesis/:id` | Faculty (Approved) | Delete thesis |
| POST | `/faculty/dissertation` | Faculty (Approved) | Add dissertation supervision |
| GET | `/faculty/dissertation` | Faculty (Approved) | Get own dissertations |
| PATCH | `/faculty/dissertation/:id` | Faculty (Approved) | Update dissertation |
| DELETE | `/faculty/dissertation/:id` | Faculty (Approved) | Delete dissertation |

### Departments
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/departments` | Admin | Create department |
| GET | `/departments` | Public | List departments |
| GET | `/departments/:id` | Public | Department details |
| PATCH | `/departments/:id` | Admin | Update department |
| DELETE | `/departments/:id` | Admin | Delete department |

### Course Catalog
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/courses` | Admin | Create course |
| GET | `/courses` | Public | List/filter courses |
| GET | `/courses/:id` | Public | Course details |
| PATCH | `/courses/:id` | Admin | Update course |
| DELETE | `/courses/:id` | Admin | Delete course |

### Approvals
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/approvals/pending` | Admin | List pending accounts |
| POST | `/approvals/:userId/approve` | Admin | Approve faculty account |
| POST | `/approvals/:userId/reject` | Admin | Reject with reason |

### Admin
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | System metrics |
| GET | `/admin/faculty` | Admin | Faculty list with filters |
| GET | `/admin/export/faculty` | Admin | Export faculty CSV |
| GET | `/admin/departments` | Admin | Departments with counts |
| POST | `/admin/departments` | Admin | Create department |
| PATCH | `/admin/departments/:id` | Admin | Update department |
| DELETE | `/admin/departments/:id` | Admin | Delete department |
| GET | `/admin/courses` | Admin | Courses with counts |
| POST | `/admin/courses` | Admin | Create course |
| PATCH | `/admin/courses/:id` | Admin | Update course |
| DELETE | `/admin/courses/:id` | Admin | Delete course |
| PATCH | `/admin/faculty/:userId/reset-password` | Admin | Reset faculty password |

### Analytics
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/admin/analytics/research-domains` | Admin | Research domain profiling |
| GET | `/admin/analytics/publication-trends` | Admin | Publication trends by year |
| GET | `/admin/analytics/department-health` | Admin | Department health scores |
| GET | `/admin/analytics/research-momentum` | Admin | Faculty momentum scores |
| GET | `/admin/analytics/qualification-distribution` | Admin | PhD compliance report |
| GET | `/admin/analytics/experience-profile` | Admin | Experience type distribution |
| GET | `/admin/analytics/course-load` | Admin | Course load analysis |
| GET | `/admin/analytics/supervision-pipeline` | Admin | Thesis/dissertation pipeline |

### Published Reports
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/admin/published-reports` | Admin | Publish a report snapshot |
| GET | `/admin/published-reports` | Admin | List all published reports |
| PATCH | `/admin/published-reports/:id` | Admin | Update title/description/visibility |
| DELETE | `/admin/published-reports/:id` | Admin | Remove published report |
| GET | `/public/reports` | Public | List public reports |
| GET | `/public/reports/:id` | Public | Single public report with data |

---

## Module Structure

```
src/
├── auth/                     # JWT auth, OTP, password reset
├── users/                    # User management
├── departments/              # Department CRUD
├── courses/                  # Course catalog CRUD
├── faculty-profile/          # Personal + academic profile, addresses
├── faculty-courses/          # Teaching history
├── faculty-experiences/      # Experience entries
├── faculty-publications/     # Publication records
├── faculty-education/        # Degree records
├── faculty-supervision/      # Thesis & dissertation supervision
├── approvals/                # Faculty account approval flow
├── admin/                    # Admin dashboard, stats, exports
├── analytics/                # All 8 analytics reports
├── published-reports/        # Public report publishing
├── cloudinary/               # Cloudinary upload service
├── mail/                     # Resend email service
└── prisma.service.ts         # Shared Prisma client
```

---

## Guards

| Guard | Purpose |
|---|---|
| `JwtAuthGuard` | Validates JWT token, populates `req.user` |
| `RolesGuard` | Checks `req.user.role` against `@Roles()` decorator |
| `ApprovedGuard` | Ensures faculty `status === APPROVED` before write operations. Admins bypass automatically. |


---

## Key Design Decisions

- **Soft delete** on `User` via `deletedAt` field — deleted users are filtered out but data is preserved
- **Transaction-based registration** — `User` and `Faculty` rows created atomically on register
- **ApprovedGuard** gates all faculty write operations — pending/rejected faculty can log in but cannot edit
- **OTP flow** uses bcrypt-hashed OTPs stored in a dedicated `OTP` table with expiry
- **Cloudinary** handles profile pictures — images auto-cropped to 400×400 with face detection
- **Published reports** store JSON snapshots of analytics data — public sees a point-in-time view, not live data

---

## Scripts

```bash
npm run start:dev     # Start in watch mode
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled output
npm run seed          # Seed admin + sample data
npx prisma studio     # Open Prisma Studio (DB GUI)
npx prisma migrate dev --name <name>   # Create and run migration
```
