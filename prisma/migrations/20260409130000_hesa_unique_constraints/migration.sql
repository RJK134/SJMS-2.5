-- Prevent duplicate HESA records per student/module/year

CREATE UNIQUE INDEX "hesa_students_student_id_key" ON "hesa_students"("student_id");
CREATE UNIQUE INDEX "hesa_modules_module_id_academic_year_key" ON "hesa_modules"("module_id", "academic_year");
CREATE UNIQUE INDEX "hesa_student_modules_hesa_student_id_hesa_module_id_key" ON "hesa_student_modules"("hesa_student_id", "hesa_module_id");
