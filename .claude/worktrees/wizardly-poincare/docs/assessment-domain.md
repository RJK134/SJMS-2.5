# Assessment Domain — 7-Stage Marks Pipeline

## Pipeline Stages

```
DRAFT → FIRST_MARK → SECOND_MARK → MODERATED → EXTERNAL_REVIEWED → BOARD_APPROVED → RELEASED
```

Each transition creates a **new MarkEntry row** (append-only audit trail). The mark value at each stage may differ due to moderation, scaling, or board decisions.

---

## Entity Relationships

```
Assessment (module-level: coursework, exam, etc.)
  └── AssessmentComponent (sub-parts: essay 60%, presentation 40%)
        └── MarkEntry (one per stage per student per attempt — append-only)
                │
  └── AssessmentAttempt (summary record: raw/moderated/final marks, grade)
                │
  └── Submission (file upload: MinIO path, Turnitin score, late penalty)
                │
  └── SecondMarkingRecord (first marker mark, second marker mark, agreed mark)
                │
  └── ModerationRecord (sample size, outcome, adjustment applied)
```

---

## Stage Transitions

| Stage | Who | What Happens |
|-------|-----|-------------|
| DRAFT | Module Leader | Creates assessment, sets up components/criteria |
| FIRST_MARK | First Marker | Enters raw mark + feedback per student |
| SECOND_MARK | Second Marker | Double-marks sample (>70%, <40%, borderline) |
| MODERATED | Module Leader | Reviews sample, applies scaling if needed |
| EXTERNAL_REVIEWED | External Examiner | Reviews sample + moderation report |
| BOARD_APPROVED | Exam Board | Confirms marks, makes progression decisions |
| RELEASED | Registry | Publishes marks to student portal |

---

## Double-Marking Rules

- **Mandatory sample:** All marks >=70 (First), all marks <40 (Fail), borderline (within 2% of boundary), plus random 10% sample.
- If first and second marker disagree by >10 marks, a third marker is appointed.
- SecondMarkingRecord stores: firstMarkerMark, secondMarkerMark, agreedMark.

---

## Grade Boundaries (configurable per programme)

| Classification | Mark Range |
|---------------|-----------|
| First | >= 70% |
| Upper Second (2:1) | 60-69% |
| Lower Second (2:2) | 50-59% |
| Third | 40-49% |
| Fail | < 40% |

---

## Degree Calculation

- Year 2 weight: 33%, Year 3 weight: 67%
- Best 100 credits per level OR all credits — whichever benefits the student.
- Borderline: if within 2% of higher classification AND >=50% of credits at higher level → upgrade.

---

## Critical Data Integrity Rule

**onDelete: Restrict throughout the marks chain.**

```
Assessment → AssessmentComponent: onDelete: Restrict
AssessmentComponent → MarkEntry: onDelete: Restrict
```

Academic marks must NEVER cascade-delete. Deleting an assessment that has confirmed marks would destroy academic records. This is a regulatory requirement.

---

## Exam Board Workflow

1. Registry creates ExamBoard record (programme, academic year, type, date, chair)
2. Module leaders confirm all marks at MODERATED stage
3. External examiner reviews and confirms at EXTERNAL_REVIEWED
4. Board meeting: chair reviews marks, makes progression decisions
5. ExamBoardDecision created per student: pass/fail/refer/defer/compensate/award
6. Registry transitions all marks to BOARD_APPROVED
7. Registry releases marks to portal → RELEASED stage
