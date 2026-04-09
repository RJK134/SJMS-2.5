-- Category B Remediation: B-02 (marks pipeline) + B-04 (HESA Data Futures entities)
-- B-01, B-03, B-05, B-06 were already implemented in prior migrations.

-- ═══════════════════════════════════════════════════════════════════════════
-- B-02: 7-Stage Marks Pipeline
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateEnum: MarkStage
CREATE TYPE "MarkStage" AS ENUM (
  'DRAFT',
  'FIRST_MARK',
  'SECOND_MARK',
  'MODERATED',
  'EXTERNAL_REVIEWED',
  'BOARD_APPROVED',
  'RELEASED'
);

-- CreateTable: assessment_components
CREATE TABLE "assessment_components" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "component_type" "AssessmentType" NOT NULL,
    "weighting" INTEGER NOT NULL,
    "max_mark" DECIMAL(6,2) NOT NULL,
    "pass_mark" DECIMAL(6,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessment_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable: mark_entries (append-only audit trail)
CREATE TABLE "mark_entries" (
    "id" TEXT NOT NULL,
    "assessment_component_id" TEXT NOT NULL,
    "module_registration_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "stage" "MarkStage" NOT NULL,
    "mark" DECIMAL(6,2),
    "grade" TEXT,
    "marker_id" TEXT,
    "marker_name" TEXT,
    "feedback" TEXT,
    "marked_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "mark_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_components_assessment_id_idx" ON "assessment_components"("assessment_id");
CREATE INDEX "mark_entries_assessment_component_id_idx" ON "mark_entries"("assessment_component_id");
CREATE INDEX "mark_entries_module_registration_id_idx" ON "mark_entries"("module_registration_id");
CREATE INDEX "mark_entries_stage_idx" ON "mark_entries"("stage");

-- AddForeignKey
ALTER TABLE "assessment_components" ADD CONSTRAINT "assessment_components_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mark_entries" ADD CONSTRAINT "mark_entries_assessment_component_id_fkey"
  FOREIGN KEY ("assessment_component_id") REFERENCES "assessment_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "mark_entries" ADD CONSTRAINT "mark_entries_module_registration_id_fkey"
  FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ═══════════════════════════════════════════════════════════════════════════
-- B-04: HESA Data Futures Entities
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateTable: hesa_students (student-level HESA entity)
CREATE TABLE "hesa_students" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "husid" TEXT,
    "ownstu" TEXT,
    "numhus" TEXT,
    "ttaccom" TEXT,
    "disable" TEXT,
    "ethnic" TEXT,
    "sexort" TEXT,
    "relblf" TEXT,
    "genderid" TEXT,
    "nation" TEXT,
    "domicile" TEXT,
    "soc_class" TEXT,
    "sec" TEXT,
    "postcode" TEXT,
    "comdate" DATE,
    "enddate" DATE,
    "hesa_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable: hesa_modules (module-level HESA entity)
CREATE TABLE "hesa_modules" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "mod_id" TEXT,
    "crdt_pts" INTEGER,
    "crdt_scm" TEXT,
    "levlpts" TEXT,
    "fte" DECIMAL(5,2),
    "pcolab" DECIMAL(5,2),
    "hesa_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: hesa_student_modules (student-module outcome for HESA)
CREATE TABLE "hesa_student_modules" (
    "id" TEXT NOT NULL,
    "hesa_student_id" TEXT NOT NULL,
    "hesa_module_id" TEXT NOT NULL,
    "mod_out" TEXT,
    "mod_grade" TEXT,
    "mod_mark" DECIMAL(6,2),
    "crdt_atmp" INTEGER,
    "crdt_achv" INTEGER,
    "hesa_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_student_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: hesa_entry_qualifications
CREATE TABLE "hesa_entry_qualifications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "qual_type" TEXT NOT NULL,
    "qual_ent3" TEXT,
    "qual_cls2" TEXT,
    "qual_sbj1" TEXT,
    "qual_sbj2" TEXT,
    "qual_sbj3" TEXT,
    "qual_grade" TEXT,
    "qual_year" INTEGER,
    "institution" TEXT,
    "country" TEXT,
    "tariff_points" INTEGER,
    "hesa_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_entry_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hesa_students_husid_key" ON "hesa_students"("husid");
CREATE INDEX "hesa_students_student_id_idx" ON "hesa_students"("student_id");
CREATE INDEX "hesa_modules_module_id_idx" ON "hesa_modules"("module_id");
CREATE INDEX "hesa_modules_academic_year_idx" ON "hesa_modules"("academic_year");
CREATE INDEX "hesa_student_modules_hesa_student_id_idx" ON "hesa_student_modules"("hesa_student_id");
CREATE INDEX "hesa_student_modules_hesa_module_id_idx" ON "hesa_student_modules"("hesa_module_id");
CREATE INDEX "hesa_entry_qualifications_student_id_idx" ON "hesa_entry_qualifications"("student_id");

-- AddForeignKey
ALTER TABLE "hesa_students" ADD CONSTRAINT "hesa_students_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hesa_modules" ADD CONSTRAINT "hesa_modules_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hesa_student_modules" ADD CONSTRAINT "hesa_student_modules_hesa_student_id_fkey"
  FOREIGN KEY ("hesa_student_id") REFERENCES "hesa_students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hesa_student_modules" ADD CONSTRAINT "hesa_student_modules_hesa_module_id_fkey"
  FOREIGN KEY ("hesa_module_id") REFERENCES "hesa_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hesa_entry_qualifications" ADD CONSTRAINT "hesa_entry_qualifications_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
