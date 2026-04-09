-- BugBot fixes: cascade delete chain + redundant indexes

-- MEDIUM: Change AssessmentComponent→Assessment from CASCADE to RESTRICT
-- Academic marks must NEVER cascade-delete
ALTER TABLE "assessment_components" DROP CONSTRAINT IF EXISTS "assessment_components_assessment_id_fkey";
ALTER TABLE "assessment_components" ADD CONSTRAINT "assessment_components_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LOW: Remove redundant indexes (covered by @@unique constraints)
DROP INDEX IF EXISTS "programme_modules_programme_id_idx";
DROP INDEX IF EXISTS "hesa_students_student_id_idx";
DROP INDEX IF EXISTS "hesa_modules_module_id_idx";
DROP INDEX IF EXISTS "hesa_student_modules_hesa_student_id_idx";
DROP INDEX IF EXISTS "hesa_code_tables_field_idx";
