-- CreateEnum
CREATE TYPE "FinTxnType" AS ENUM ('CHARGE', 'PAYMENT', 'CREDIT_NOTE', 'REFUND', 'WRITE_OFF', 'TRANSFER');


-- CreateEnum
CREATE TYPE "FinTxnStatus" AS ENUM ('POSTED', 'REVERSED', 'PENDING');


-- CreateEnum
CREATE TYPE "FinPeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'LOCKED');


-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('BALANCED', 'UNBALANCED', 'PENDING_REVIEW');


-- CreateEnum
CREATE TYPE "DataClassLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SPECIAL_CATEGORY');


-- CreateEnum
CREATE TYPE "GdprBasis" AS ENUM ('CONSENT', 'LEGITIMATE_INTEREST', 'LEGAL_OBLIGATION', 'VITAL_INTEREST', 'PUBLIC_TASK', 'OFFICIAL_AUTHORITY');


-- CreateEnum
CREATE TYPE "HESAYearType" AS ENUM ('STANDARD', 'SANDWICH', 'STUDY_ABROAD', 'INTERCALATED');


-- AlterEnum
ALTER TYPE "ConsentType" ADD VALUE 'THIRD_PARTY';


-- AlterTable
ALTER TABLE "consent_records" ADD COLUMN     "evidence_path" TEXT,
ADD COLUMN     "legal_basis" "GdprBasis",
ADD COLUMN     "purpose" TEXT;


-- AlterTable
ALTER TABLE "data_protection_requests" ADD COLUMN     "acknowledged_date" TIMESTAMP(3),
ADD COLUMN     "completed_by" TEXT,
ADD COLUMN     "refusal_reason" TEXT;


-- AlterTable
ALTER TABLE "person_addresses" ADD COLUMN     "hesa_postcode" TEXT;


-- AlterTable
ALTER TABLE "student_accounts" ADD COLUMN     "last_reconciled_by" TEXT,
ADD COLUMN     "last_reconciled_date" TIMESTAMP(3),
ADD COLUMN     "last_transaction_date" TIMESTAMP(3),
ADD COLUMN     "reconciliation_status" "ReconciliationStatus" NOT NULL DEFAULT 'BALANCED',
ADD COLUMN     "total_credits" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_debits" DECIMAL(10,2) NOT NULL DEFAULT 0;


-- CreateTable
CREATE TABLE "student_course_sessions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "husid" TEXT,
    "ukprn" TEXT DEFAULT '10099999',
    "course_id" TEXT,
    "com_date" DATE,
    "end_date" DATE,
    "rsn_end" TEXT,
    "fund_code" TEXT,
    "fee_elig" TEXT,
    "mstu_fee" TEXT,
    "lo_session" TEXT,
    "type_yr" "HESAYearType",
    "mode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_course_sessions_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "hesa_code_tables" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "valid_from" DATE,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_code_tables_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "student_instances" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "bridge_session" BOOLEAN NOT NULL DEFAULT false,
    "hesa_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_instances_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "statutory_return_runs" (
    "id" TEXT NOT NULL,
    "return_type" "StatReturnType" NOT NULL,
    "academic_year" TEXT NOT NULL,
    "run_number" INTEGER NOT NULL,
    "status" "HESAReturnStatus" NOT NULL DEFAULT 'PREPARATION',
    "validation_errors" JSONB,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "warning_count" INTEGER NOT NULL DEFAULT 0,
    "submitted_by" TEXT,
    "submitted_date" TIMESTAMP(3),
    "acknowledged_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "statutory_return_runs_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "transaction_type" "FinTxnType" NOT NULL,
    "debit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "running_balance" DECIMAL(10,2) NOT NULL,
    "reference" TEXT,
    "description" TEXT NOT NULL,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "posted_date" TIMESTAMP(3) NOT NULL,
    "effective_date" DATE NOT NULL,
    "financial_period_id" TEXT,
    "reversed_by_transaction_id" TEXT,
    "status" "FinTxnStatus" NOT NULL DEFAULT 'POSTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "financial_periods" (
    "id" TEXT NOT NULL,
    "period_code" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "FinPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closed_by" TEXT,
    "closed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "financial_periods_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "data_classifications" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "classification" "DataClassLevel" NOT NULL,
    "gdpr_basis" "GdprBasis",
    "retention_period" INTEGER,
    "encryption_required" BOOLEAN NOT NULL DEFAULT false,
    "access_roles" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "data_classifications_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE INDEX "student_course_sessions_student_id_idx" ON "student_course_sessions"("student_id");


-- CreateIndex
CREATE INDEX "student_course_sessions_programme_id_idx" ON "student_course_sessions"("programme_id");


-- CreateIndex
CREATE INDEX "student_course_sessions_academic_year_idx" ON "student_course_sessions"("academic_year");


-- CreateIndex
CREATE INDEX "hesa_code_tables_field_idx" ON "hesa_code_tables"("field");


-- CreateIndex
CREATE UNIQUE INDEX "hesa_code_tables_field_code_key" ON "hesa_code_tables"("field", "code");


-- CreateIndex
CREATE INDEX "student_instances_student_id_idx" ON "student_instances"("student_id");


-- CreateIndex
CREATE INDEX "student_instances_programme_id_idx" ON "student_instances"("programme_id");


-- CreateIndex
CREATE INDEX "student_instances_academic_year_id_idx" ON "student_instances"("academic_year_id");


-- CreateIndex
CREATE INDEX "statutory_return_runs_return_type_academic_year_idx" ON "statutory_return_runs"("return_type", "academic_year");


-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_transaction_ref_key" ON "financial_transactions"("transaction_ref");


-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_reversed_by_transaction_id_key" ON "financial_transactions"("reversed_by_transaction_id");


-- CreateIndex
CREATE INDEX "financial_transactions_student_account_id_idx" ON "financial_transactions"("student_account_id");


-- CreateIndex
CREATE INDEX "financial_transactions_posted_date_idx" ON "financial_transactions"("posted_date");


-- CreateIndex
CREATE INDEX "financial_transactions_financial_period_id_idx" ON "financial_transactions"("financial_period_id");


-- CreateIndex
CREATE UNIQUE INDEX "financial_periods_period_code_key" ON "financial_periods"("period_code");


-- CreateIndex
CREATE UNIQUE INDEX "data_classifications_model_name_field_name_key" ON "data_classifications"("model_name", "field_name");


-- AddForeignKey
ALTER TABLE "student_course_sessions" ADD CONSTRAINT "student_course_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "student_course_sessions" ADD CONSTRAINT "student_course_sessions_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "student_instances" ADD CONSTRAINT "student_instances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "student_instances" ADD CONSTRAINT "student_instances_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "student_instances" ADD CONSTRAINT "student_instances_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_financial_period_id_fkey" FOREIGN KEY ("financial_period_id") REFERENCES "financial_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_reversed_by_transaction_id_fkey" FOREIGN KEY ("reversed_by_transaction_id") REFERENCES "financial_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

