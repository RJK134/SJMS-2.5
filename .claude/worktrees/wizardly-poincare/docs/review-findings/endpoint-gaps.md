# Endpoint Gap Register

> **Generated:** 2026-04-09 | **Source:** Post-mock-purge audit | **Status:** 10 of 14 implemented

After the Category A mock data purge, 14 API endpoint gaps were identified. 10 have now been implemented; 4 remain (LOW priority).

## Gap Summary

| # | Page | Method + Path | Data Required | Status |
|---|------|--------------|---------------|--------|
| G-01 | TimetableView | `GET /api/v1/timetable/sessions` | Weekly teaching sessions with day, time, room, module, type | **DONE** |
| G-02 | Dashboard | `GET /api/v1/notifications` | System notifications + `PATCH /:id` mark-as-read | **DONE** |
| G-03 | Dashboard | `GET /api/v1/calendar/events` | Academic calendar events (exam periods, board meetings, graduation) | **DONE** |
| G-04 | StudentDashboard | `GET /api/v1/announcements` | Institutional notices (term dates, library hours, registration deadlines) | PENDING |
| G-05 | AuditLogViewer | `GET /api/v1/audit-logs` | Paginated audit trail with entity/action/user/timestamp filters | **DONE** |
| G-06 | StatutoryReturns | `GET /api/v1/statutory-returns` | Return schedule (HESES, NSS, TEF, ILR, Graduate Outcomes) with status/due dates | **DONE** |
| G-07 | CustomReports | `POST /api/v1/reports/execute` | Report generation: entity, academic year, filters → JSON results | **DONE** |
| G-08 | Accommodation (3 pages) | `GET /api/v1/accommodation/blocks` | Accommodation blocks, rooms, and bookings CRUD | PENDING |
| G-09 | TimetableView + RoomManagement | `GET /api/v1/rooms` | Room catalogue with capacity, type, equipment, availability | PENDING |
| G-10 | ClashDetection | `GET /api/v1/timetable/clashes` | Timetable conflicts: overlapping sessions for students/staff/rooms | PENDING |
| G-11 | AlertsList | `GET /api/v1/attendance/alerts` | Attendance threshold alerts (amber <85%, red <80%, 3+ consecutive absences) | **DONE** |
| G-12 | ContactPoints + HomeOfficeReports | `GET /api/v1/ukvi/contact-points` | UKVI contact point schedule and Home Office reporting data | **DONE** |
| G-13 | MyAccount | `GET /api/v1/finance/transactions/:accountId` | Student financial transactions (charges, payments, credits, refunds) | **DONE** |
| G-14 | AcademicDashboard | `GET /api/v1/dashboard/staff/:staffId/tutees` | Personal tutee list with attendance/engagement data per tutee | **DONE** |

## Detail

### G-01: Timetable Sessions

**Page:** `client/src/pages/timetable/TimetableView.tsx`
**Current state:** Empty weekly grid with message "Timetable data is not yet available"
**Endpoint:** `GET /api/v1/timetable/sessions?week=2026-W15&userId={id}`
**Response shape:**
```json
{
  "data": [
    {
      "id": "string",
      "day": 0,
      "startTime": "09:00",
      "endTime": "11:00",
      "moduleCode": "CS4001",
      "moduleTitle": "Introduction to Programming",
      "room": "LAB-003",
      "sessionType": "LAB",
      "staffName": "Dr Smith"
    }
  ]
}
```
**Depends on:** Room catalogue (G-09), module registrations, staff assignments

---

### G-02: System Notifications

**Page:** `client/src/pages/Dashboard.tsx`
**Current state:** "No recent notifications" empty state
**Endpoint:** `GET /api/v1/notifications?limit=10`
**Response shape:**
```json
{
  "data": [
    {
      "id": "string",
      "type": "OVERDUE_MARKS | NEW_APPLICATION | DEADLINE_APPROACHING",
      "message": "string",
      "createdAt": "ISO-8601",
      "read": false,
      "link": "/admin/assessment/marks-entry"
    }
  ]
}
```
**Implementation note:** Could be event-driven from existing webhook/audit infrastructure

---

### G-03: Calendar Events

**Page:** `client/src/pages/Dashboard.tsx`
**Current state:** "No upcoming events" empty state
**Endpoint:** `GET /api/v1/calendar/events?from=2026-04-01&to=2026-07-31`
**Response shape:** Array of `{ id, title, date, type, description }`
**Depends on:** Academic calendar configuration (settings)

---

### G-04: Announcements

**Page:** `client/src/pages/student-portal/StudentDashboard.tsx`
**Current state:** "No announcements at this time" empty state
**Endpoint:** `GET /api/v1/announcements?active=true&limit=5`
**Response shape:** Array of `{ id, title, body, publishDate, expiryDate, audience }`

---

### G-05: Audit Log Query

**Page:** `client/src/pages/settings/AuditLogViewer.tsx`
**Current state:** Filter UI exists but no data loads; shows descriptive placeholder
**Endpoint:** `GET /api/v1/audit-logs?entityType=Student&action=CREATE&from=&to=&page=1&limit=25`
**Response shape:** Paginated array of `{ id, entityType, entityId, action, userId, userName, ipAddress, timestamp, before, after }`
**Implementation note:** AuditLog model and `logAudit()` utility already exist — need a read endpoint

---

### G-06: Statutory Returns

**Page:** `client/src/pages/reports/StatutoryReturns.tsx`
**Current state:** Full placeholder "not yet configured"
**Endpoint:** `GET /api/v1/statutory-returns`
**Response shape:** Array of `{ id, name, dueDate, status, academicYear, submittedDate, submittedBy }`

---

### G-07: Custom Report Execution

**Page:** `client/src/pages/reports/CustomReports.tsx`
**Current state:** Form UI exists but no report generation backend
**Endpoint:** `POST /api/v1/reports/execute` with body `{ entity, academicYear, filters, format }`
**Response:** File download (CSV/PDF/Excel)

---

### G-08: Accommodation Management

**Pages:** `client/src/pages/accommodation/Blocks.tsx`, `Rooms.tsx`, `Bookings.tsx`
**Current state:** Descriptive placeholder text only
**Endpoints:**
- `GET /api/v1/accommodation/blocks` — blocks with capacity, occupancy
- `GET /api/v1/accommodation/rooms` — rooms with type, floor, status
- `GET /api/v1/accommodation/bookings` — student room bookings

---

### G-09: Room Catalogue

**Pages:** `client/src/pages/timetable/RoomManagement.tsx`
**Current state:** May attempt API call but no rooms endpoint
**Endpoint:** `GET /api/v1/rooms?building=&type=LAB|LECTURE|SEMINAR&capacity_gte=30`
**Response shape:** Paginated array of `{ id, code, building, floor, capacity, type, equipment, status }`

---

### G-10: Clash Detection

**Page:** `client/src/pages/timetable/ClashDetection.tsx`
**Current state:** Descriptive placeholder
**Endpoint:** `GET /api/v1/timetable/clashes?academicYear=2025/26&semester=1`
**Response shape:** Array of `{ sessionA, sessionB, clashType, affectedStudents }`
**Depends on:** Timetable sessions (G-01)

---

### G-11: Attendance Alerts

**Page:** `client/src/pages/attendance/AlertsList.tsx`
**Current state:** Descriptive placeholder
**Endpoint:** `GET /api/v1/attendance/alerts?severity=RED|AMBER&resolved=false`
**Response shape:** Paginated array of `{ id, studentId, studentName, attendanceRate, threshold, severity, triggerDate, resolved }`
**Implementation note:** Could be computed from existing `/v1/attendance` data with aggregation

---

### G-12: UKVI Contact Points & Home Office Reports

**Pages:** `client/src/pages/compliance/ContactPoints.tsx`, `HomeOfficeReports.tsx`
**Current state:** Descriptive placeholder
**Endpoints:**
- `GET /api/v1/ukvi/contact-points?status=PENDING|OVERDUE` — scheduled contact points with students
- `GET /api/v1/ukvi/home-office-reports` — generated HO reports
**Depends on:** Existing `/v1/ukvi` module (may need sub-routes added)

---

### G-13: Financial Transactions

**Page:** `client/src/pages/student-portal/MyAccount.tsx`
**Current state:** "Your financial transactions will appear here" placeholder
**Endpoint:** `GET /api/v1/finance/transactions?studentId={id}&page=1&limit=25`
**Response shape:** Paginated array of `{ id, type, description, amount, date, balance }`
**Depends on:** Existing `/v1/finance` module (may need sub-route)

---

### G-14: Academic Tutees

**Page:** `client/src/pages/academic/AcademicDashboard.tsx`
**Current state:** "My Tutees — Not yet configured" stat card
**Endpoint:** `GET /api/v1/dashboard/academic/tutees`
**Response shape:** Array of `{ studentId, studentNumber, name, programme, attendanceRate, engagementRating }`
**Depends on:** Staff-to-student tutoring assignment model (may need schema addition)

---

## Existing Endpoints That Work Correctly

The following 37 domain modules are fully operational and all staff/portal pages using them make real API calls:

`students` · `persons` · `demographics` · `identifiers` · `faculties` · `schools` · `departments` · `programmes` · `modules` · `programme-modules` · `programme-approvals` · `programme-routes` · `applications` · `qualifications` · `references` · `offers` · `interviews` · `clearance-checks` · `admissions-events` · `enrolments` · `module-registrations` · `assessments` · `marks` · `submissions` · `module-results` · `exam-boards` · `progressions` · `awards` · `transcripts` · `finance` · `attendance` · `support` · `ukvi` · `ec-claims` · `appeals` · `documents` · `communications`

Plus the new `dashboard` module added during this remediation (provides `/v1/dashboard/stats`, `/v1/dashboard/academic`, `/v1/dashboard/student/:id`, `/v1/dashboard/applicant/:id`).

## Recommended Implementation Order

1. **Phase 6 (Workflows):** G-02 Notifications (webhook-driven), G-05 Audit Log Query
2. **Phase 7 (Integrations):** G-01 Timetable, G-09 Rooms, G-12 UKVI Contact Points
3. **Phase 8 (AMBER/GREEN):** G-08 Accommodation, G-11 Alerts, G-13 Transactions, G-14 Tutees
4. **Phase 9 (QA):** G-03 Calendar, G-04 Announcements, G-06 Statutory Returns, G-07 Reports, G-10 Clashes
