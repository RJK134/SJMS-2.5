# UKVI Compliance (Student Route)

Contact Points:
- Registration (start of each term)
- Attendance monitoring (min 80 percent, tracked weekly)
- Meeting with personal tutor (minimum termly)

Automated Alerts (via n8n):
- Attendance below 85 percent: amber warning to student + tutor
- Attendance below 80 percent: red alert to compliance officer
- 3 consecutive unexplained absences: escalation
- Missed contact point: 48hr reminder, 7-day escalation, Home Office report

CAS Management: CAS number, assigned date, expiry, visa type, start/end, passport details, BRP, sponsorship dates, work hours limit.

SJMS Fields: VisaRecord, CasRecord, UKVIContactPoint, UKVIReport — all with audit trail
