-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "LegalSex" AS ENUM ('MALE', 'FEMALE', 'INDETERMINATE');

-- CreateEnum
CREATE TYPE "NameType" AS ENUM ('LEGAL', 'PREFERRED', 'PREVIOUS', 'ALIAS');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'CORRESPONDENCE', 'TERM_TIME', 'OVERSEAS', 'NEXT_OF_KIN');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'PHONE', 'MOBILE', 'WORK_EMAIL', 'WORK_PHONE');

-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('HUSID', 'ULN', 'UCAS_ID', 'SLC_SSN', 'PASSPORT', 'NATIONAL_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "Ethnicity" AS ENUM ('WHITE_BRITISH', 'WHITE_IRISH', 'WHITE_GYPSY_TRAVELLER', 'WHITE_OTHER', 'MIXED_WHITE_BLACK_CARIBBEAN', 'MIXED_WHITE_BLACK_AFRICAN', 'MIXED_WHITE_ASIAN', 'MIXED_OTHER', 'ASIAN_INDIAN', 'ASIAN_PAKISTANI', 'ASIAN_BANGLADESHI', 'ASIAN_CHINESE', 'ASIAN_OTHER', 'BLACK_AFRICAN', 'BLACK_CARIBBEAN', 'BLACK_OTHER', 'ARAB', 'OTHER_ETHNIC', 'NOT_KNOWN', 'REFUSED');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('NO_RELIGION', 'CHRISTIAN', 'BUDDHIST', 'HINDU', 'JEWISH', 'MUSLIM', 'SIKH', 'SPIRITUAL', 'OTHER_RELIGION', 'NOT_KNOWN', 'REFUSED');

-- CreateEnum
CREATE TYPE "SexualOrientation" AS ENUM ('HETEROSEXUAL', 'GAY_MAN', 'GAY_WOMAN', 'BISEXUAL', 'OTHER_ORIENTATION', 'NOT_KNOWN', 'REFUSED');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('HOME', 'OVERSEAS', 'EU_TRANSITIONAL', 'ISLANDS', 'CHANNEL_ISLANDS');

-- CreateEnum
CREATE TYPE "EntryRoute" AS ENUM ('UCAS', 'DIRECT', 'CLEARING', 'INTERNATIONAL', 'INTERNAL_TRANSFER');

-- CreateEnum
CREATE TYPE "ApplicationRoute" AS ENUM ('UCAS', 'DIRECT', 'CLEARING', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'FIXED_TERM', 'HOURLY', 'VISITING', 'EMERITUS');

-- CreateEnum
CREATE TYPE "ProgrammeLevel" AS ENUM ('LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_7', 'LEVEL_8');

-- CreateEnum
CREATE TYPE "ProgrammeStatus" AS ENUM ('DRAFT', 'APPROVED', 'SUSPENDED', 'WITHDRAWN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ModeOfStudy" AS ENUM ('FULL_TIME', 'PART_TIME', 'SANDWICH', 'DISTANCE', 'BLOCK_RELEASE');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('DRAFT', 'APPROVED', 'RUNNING', 'SUSPENDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProgrammeModuleType" AS ENUM ('CORE', 'OPTIONAL', 'ELECTIVE');

-- CreateEnum
CREATE TYPE "ApprovalStage" AS ENUM ('INITIAL', 'FACULTY', 'ACADEMIC_BOARD', 'SENATE');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'FIRM', 'INSURANCE', 'DECLINED', 'WITHDRAWN', 'REJECTED');

-- CreateEnum
CREATE TYPE "OfferConditionType" AS ENUM ('ACADEMIC', 'ENGLISH_LANGUAGE', 'FINANCIAL', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "OfferConditionStatus" AS ENUM ('PENDING', 'MET', 'NOT_MET', 'WAIVED');

-- CreateEnum
CREATE TYPE "InterviewFormat" AS ENUM ('IN_PERSON', 'ONLINE', 'PHONE', 'GROUP');

-- CreateEnum
CREATE TYPE "ClearanceCheckType" AS ENUM ('DBS', 'OCCUPATIONAL_HEALTH', 'ATAS', 'FINANCIAL', 'RIGHT_TO_STUDY');

-- CreateEnum
CREATE TYPE "ClearanceCheckStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'CLEARED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EnrolmentStatus" AS ENUM ('ENROLLED', 'INTERRUPTED', 'SUSPENDED', 'WITHDRAWN', 'COMPLETED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('CORE', 'OPTIONAL', 'ELECTIVE');

-- CreateEnum
CREATE TYPE "ModuleRegStatus" AS ENUM ('REGISTERED', 'WITHDRAWN', 'DEFERRED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('COURSEWORK', 'EXAM', 'PRACTICAL', 'PRESENTATION', 'PORTFOLIO', 'DISSERTATION', 'GROUP_WORK', 'VIVA', 'LAB_REPORT');

-- CreateEnum
CREATE TYPE "SubmissionMethod" AS ENUM ('ONLINE', 'IN_PERSON', 'POSTAL');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('PENDING', 'SUBMITTED', 'MARKED', 'MODERATED', 'CONFIRMED', 'REFERRED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ModuleResultStatus" AS ENUM ('PROVISIONAL', 'CONFIRMED', 'REFERRED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ExamBoardType" AS ENUM ('MODULE', 'PROGRESSION', 'AWARD');

-- CreateEnum
CREATE TYPE "ExamBoardStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BoardDecisionType" AS ENUM ('PASS', 'FAIL', 'REFER', 'DEFER', 'COMPENSATE', 'AWARD', 'REPEAT');

-- CreateEnum
CREATE TYPE "BoardMemberRole" AS ENUM ('CHAIR', 'INTERNAL_EXAMINER', 'EXTERNAL_EXAMINER', 'SECRETARY');

-- CreateEnum
CREATE TYPE "MemberAttendance" AS ENUM ('ATTENDING', 'ABSENT', 'APOLOGIES');

-- CreateEnum
CREATE TYPE "ProgressionDecision" AS ENUM ('PROGRESS', 'REPEAT_YEAR', 'REPEAT_MODULES', 'WITHDRAW', 'TRANSFER', 'AWARD');

-- CreateEnum
CREATE TYPE "AwardClassification" AS ENUM ('FIRST', 'UPPER_SECOND', 'LOWER_SECOND', 'THIRD', 'PASS', 'FAIL', 'DISTINCTION', 'MERIT', 'COMMENDATION');

-- CreateEnum
CREATE TYPE "AwardStatus" AS ENUM ('RECOMMENDED', 'APPROVED', 'CONFERRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "TranscriptType" AS ENUM ('INTERIM', 'FINAL', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('TUITION', 'BENCH_FEE', 'RESIT', 'LATE_FEE', 'LIBRARY_FINE', 'ACCOMMODATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID', 'CREDITED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CARD', 'DIRECT_DEBIT', 'CASH', 'SLC', 'SPONSOR', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SponsorType" AS ENUM ('SLC', 'EMPLOYER', 'GOVERNMENT', 'CHARITY', 'EMBASSY', 'OTHER');

-- CreateEnum
CREATE TYPE "BursaryFundType" AS ENUM ('BURSARY', 'SCHOLARSHIP', 'HARDSHIP', 'PRIZE', 'ACCESS');

-- CreateEnum
CREATE TYPE "BursaryAppStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "AttendanceMarkStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'AUTHORISED_ABSENCE');

-- CreateEnum
CREATE TYPE "AttendanceMarkMethod" AS ENUM ('REGISTER', 'CARD_SWIPE', 'BIOMETRIC', 'ONLINE', 'SELF_REPORTED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('GREEN', 'AMBER', 'RED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InterventionType" AS ENUM ('EMAIL', 'PHONE', 'MEETING', 'REFERRAL', 'FORMAL_WARNING');

-- CreateEnum
CREATE TYPE "InterventionStatus" AS ENUM ('PENDING', 'COMPLETED', 'ESCALATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_ATTENDANCE', 'CONSECUTIVE_ABSENCE', 'TIER4_RISK', 'ENGAGEMENT_DROP', 'DEBT');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LECTURE', 'SEMINAR', 'TUTORIAL', 'LAB', 'WORKSHOP', 'PLACEMENT', 'FIELD_TRIP');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('LECTURE_THEATRE', 'SEMINAR_ROOM', 'LAB', 'COMPUTER_LAB', 'OFFICE', 'STUDIO');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('CONFIRMED', 'TENTATIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClashType" AS ENUM ('ROOM', 'STAFF', 'STUDENT_GROUP', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('ACADEMIC', 'FINANCIAL', 'WELLBEING', 'ACCOMMODATION', 'DISABILITY', 'COMPLAINTS', 'IT', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('NOTE', 'EMAIL_MSG', 'PHONE_CALL', 'MEETING_NOTE', 'LETTER');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('AT_RISK', 'TIER4', 'DEBT', 'DISCIPLINARY', 'SAFEGUARDING', 'WELLBEING');

-- CreateEnum
CREATE TYPE "FlagSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VisaStatus" AS ENUM ('SPONSORED', 'NOT_SPONSORED', 'PENDING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'AT_RISK', 'NON_COMPLIANT', 'REPORTED');

-- CreateEnum
CREATE TYPE "ContactPointType" AS ENUM ('REGISTRATION', 'ATTENDANCE', 'MEETING', 'ENROLMENT');

-- CreateEnum
CREATE TYPE "UKVIReportType" AS ENUM ('NO_SHOW', 'WITHDRAWAL', 'SUSPENSION', 'NON_COMPLIANCE');

-- CreateEnum
CREATE TYPE "ECStatus" AS ENUM ('SUBMITTED', 'EVIDENCE_RECEIVED', 'PRE_PANEL', 'PANEL', 'DECIDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ECDecision" AS ENUM ('APPROVED', 'REJECTED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "AppealType" AS ENUM ('ASSESSMENT', 'PROGRESSION', 'AWARD', 'DISCIPLINARY', 'EC');

-- CreateEnum
CREATE TYPE "AppealOutcome" AS ENUM ('UPHELD', 'PARTIALLY_UPHELD', 'REJECTED', 'REFERRED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'HEARING_SCHEDULED', 'HEARD', 'DECIDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('RAISED', 'INVESTIGATION', 'HEARING', 'DECIDED', 'APPEAL', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisabilityStatus" AS ENUM ('REGISTERED', 'ASSESSED', 'ADJUSTMENTS_AGREED', 'REVIEW_DUE');

-- CreateEnum
CREATE TYPE "AdjustmentCategory" AS ENUM ('EXAM', 'TEACHING', 'ASSESSMENT', 'PHYSICAL', 'COMMUNICATION', 'DIGITAL');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('REQUESTED', 'APPROVED', 'IMPLEMENTED', 'REVIEW_DUE', 'ENDED');

-- CreateEnum
CREATE TYPE "CeremonyStatus" AS ENUM ('PLANNED', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GradAttendance" AS ENUM ('ATTENDING', 'IN_ABSENTIA', 'DEFERRED');

-- CreateEnum
CREATE TYPE "GradRegStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('GENERATED', 'POSTED', 'COLLECTED', 'REPLACEMENT_ISSUED');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('INDUSTRIAL', 'CLINICAL', 'EDUCATION', 'RESEARCH', 'STUDY_ABROAD');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('APPROVED', 'CONDITIONAL', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'CERTIFICATE', 'EVIDENCE', 'LETTER', 'PASSPORT', 'VISA', 'QUALIFICATION', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommChannel" AS ENUM ('EMAIL', 'SMS', 'PORTAL', 'LETTER', 'PUSH');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "BulkCommStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "HESAReturnType" AS ENUM ('STUDENT', 'COURSE', 'MODULE', 'STAFF', 'DATA_FUTURES');

-- CreateEnum
CREATE TYPE "HESAReturnStatus" AS ENUM ('PREPARATION', 'VALIDATION', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ValidationSeverity" AS ENUM ('ERROR', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "StatReturnType" AS ENUM ('HESES', 'HEIFES', 'NSS', 'GRADUATE_OUTCOMES', 'TEF', 'ILR');

-- CreateEnum
CREATE TYPE "AccommRoomType" AS ENUM ('SINGLE', 'DOUBLE', 'EN_SUITE', 'STUDIO', 'SHARED', 'ACCESSIBLE');

-- CreateEnum
CREATE TYPE "AccommRoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('APPLIED', 'OFFERED', 'ACCEPTED', 'OCCUPIED', 'VACATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('INTERRUPTION', 'WITHDRAWAL', 'TRANSFER', 'MODE_CHANGE', 'PROGRAMME_CHANGE', 'NAME_CHANGE', 'ADDRESS_CHANGE');

-- CreateEnum
CREATE TYPE "ChangeStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "CommitteeType" AS ENUM ('SENATE', 'ACADEMIC_BOARD', 'FACULTY_BOARD', 'EXAM_BOARD', 'QUALITY', 'DISCIPLINARY');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommMemberRole" AS ENUM ('CHAIR', 'SECRETARY', 'MEMBER', 'EX_OFFICIO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('KNOWLEDGE', 'INTELLECTUAL', 'PRACTICAL', 'TRANSFERABLE');

-- CreateEnum
CREATE TYPE "AccredStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'WITHDRAWN', 'PENDING');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DataRequestType" AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'REFUSED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('MARKETING', 'RESEARCH', 'DATA_SHARING', 'PHOTOGRAPHY', 'ALUMNI', 'THIRD_PARTY');

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

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "first_name" TEXT NOT NULL,
    "middle_names" TEXT,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender",
    "legal_sex" "LegalSex",
    "pronouns" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_names" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "name_type" "NameType" NOT NULL,
    "title" TEXT,
    "first_name" TEXT NOT NULL,
    "middle_names" TEXT,
    "last_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_addresses" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "address_type" "AddressType" NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "address_line_3" TEXT,
    "city" TEXT NOT NULL,
    "county" TEXT,
    "postcode" TEXT,
    "hesa_postcode" TEXT,
    "country_code" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_contacts" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "contact_type" "ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_identifiers" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "identifier_type" "IdentifierType" NOT NULL,
    "value" TEXT NOT NULL,
    "issuer" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_demographics" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "ethnicity" "Ethnicity",
    "disability" TEXT,
    "religion" "Religion",
    "sexual_orientation" "SexualOrientation",
    "care_leaver" BOOLEAN,
    "parental_education" BOOLEAN,
    "polar_quintile" INTEGER,
    "imd_quintile" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_nationalities" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_nationalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_photos" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "person_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "next_of_kin" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "title" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "next_of_kin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "student_number" TEXT NOT NULL,
    "fee_status" "FeeStatus" NOT NULL,
    "entry_route" "EntryRoute" NOT NULL,
    "original_entry_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "staff_number" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "department_id" TEXT,
    "faculty_id" TEXT,
    "contract_type" "ContractType" NOT NULL,
    "fte" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_contracts" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "fte" DECIMAL(3,2) NOT NULL,
    "salary" DECIMAL(10,2),
    "department" TEXT,
    "job_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "staff_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_qualifications" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "qual_title" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "subject" TEXT,
    "date_awarded" DATE,
    "grade" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "staff_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "applicant_number" TEXT NOT NULL,
    "application_route" "ApplicationRoute" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prior_qualifications" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "qualification_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT,
    "institution" TEXT,
    "date_awarded" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "prior_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "keycloak_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "person_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dean_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "head_of_school_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "programme_code" TEXT NOT NULL,
    "ucas_code" TEXT,
    "jacs_code" TEXT,
    "hecos_codes" JSONB,
    "title" TEXT NOT NULL,
    "level" "ProgrammeLevel" NOT NULL,
    "credit_total" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "mode_of_study" "ModeOfStudy" NOT NULL,
    "awarding_body" TEXT NOT NULL,
    "accreditations" JSONB,
    "status" "ProgrammeStatus" NOT NULL DEFAULT 'DRAFT',
    "valid_from" DATE,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_specifications" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "learning_outcomes" JSONB,
    "teaching_methods" TEXT,
    "assessment_strategy" TEXT,
    "entry_requirements" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "approved_date" TIMESTAMP(3),
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_pathways" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "pathway_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_pathways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_accreditations" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "accrediting_body" TEXT NOT NULL,
    "accreditation_ref" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "AccredStatus" NOT NULL DEFAULT 'ACTIVE',
    "conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_accreditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "semester" TEXT,
    "prerequisites" JSONB,
    "corequisites" JSONB,
    "assessment_pattern" TEXT,
    "status" "ModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_specifications" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "aims" TEXT,
    "learning_outcomes" JSONB,
    "indicative_content" TEXT,
    "teaching_hours" JSONB,
    "assessment_methods" JSONB,
    "bibliography" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "module_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_modules" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "module_type" "ProgrammeModuleType" NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "semester" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_approvals" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "stage" "ApprovalStage" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "comments" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_outcomes" (
    "id" TEXT NOT NULL,
    "programme_specification_id" TEXT,
    "module_id" TEXT,
    "outcome_type" "OutcomeType" NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "learning_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_patterns" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "pattern_name" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "total_weight" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessment_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_frameworks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "levels" JSONB NOT NULL,
    "credit_unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "credit_frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualification_aims" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "aim_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "qualification_aims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_deliveries" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "capacity" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "module_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_versions" (
    "id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "change_note" TEXT,
    "effective_from" DATE NOT NULL,
    "snapshot_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "programme_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_prerequisites" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "prerequisite_module_id" TEXT NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "module_prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "application_route" "ApplicationRoute" NOT NULL,
    "ucas_application_code" TEXT,
    "entry_point" TEXT,
    "personal_statement" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "decision_date" TIMESTAMP(3),
    "decision_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_qualifications" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "qualification_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT,
    "predicted" BOOLEAN NOT NULL DEFAULT false,
    "institution" TEXT,
    "date_awarded" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "application_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_references" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "referee_name" TEXT NOT NULL,
    "referee_email" TEXT NOT NULL,
    "referee_position" TEXT,
    "reference_text" TEXT,
    "received_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "application_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_conditions" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "condition_type" "OfferConditionType" NOT NULL,
    "description" TEXT NOT NULL,
    "target_grade" TEXT,
    "status" "OfferConditionStatus" NOT NULL DEFAULT 'PENDING',
    "evidence_provided" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "offer_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "interview_date" TIMESTAMP(3) NOT NULL,
    "interviewer_ids" JSONB,
    "format" "InterviewFormat" NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,
    "score" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clearance_checks" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "check_type" "ClearanceCheckType" NOT NULL,
    "status" "ClearanceCheckStatus" NOT NULL DEFAULT 'PENDING',
    "completed_date" TIMESTAMP(3),
    "expiry_date" DATE,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "clearance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "venue" TEXT,
    "capacity" INTEGER,
    "registered_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "admissions_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions_event_attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_email" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "admissions_event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "agency_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "territory" TEXT,
    "commission_rate" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_applications" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "commission_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "agent_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ucas_choices" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "choice_number" INTEGER NOT NULL,
    "institution_code" TEXT NOT NULL,
    "course_code" TEXT NOT NULL,
    "decision_code" TEXT,
    "reply_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ucas_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrolments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "mode_of_study" "ModeOfStudy" NOT NULL,
    "start_date" DATE NOT NULL,
    "expected_end_date" DATE,
    "actual_end_date" DATE,
    "status" "EnrolmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "fee_status" "FeeStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enrolments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrolment_status_history" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "previous_status" "EnrolmentStatus" NOT NULL,
    "new_status" "EnrolmentStatus" NOT NULL,
    "change_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "changed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "enrolment_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_registrations" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "registration_type" "RegistrationType" NOT NULL,
    "status" "ModuleRegStatus" NOT NULL DEFAULT 'REGISTERED',
    "withdrawal_date" DATE,
    "withdrawal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "module_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_programme_routes" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "route_code" TEXT NOT NULL,
    "pathway_code" TEXT,
    "cohort" TEXT,
    "entry_date" DATE NOT NULL,
    "qualification_aim" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_programme_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrolment_tasks" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "task_name" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "enrolment_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_assessments" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "fee_status" "FeeStatus" NOT NULL,
    "assessed_date" TIMESTAMP(3) NOT NULL,
    "total_fee" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2),
    "final_fee" DECIMAL(10,2) NOT NULL,
    "assessed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "fee_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_periods" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "period_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "registration_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrolment_documents" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "received_date" TIMESTAMP(3),
    "verified_date" TIMESTAMP(3),
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "enrolment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL,
    "weighting" INTEGER NOT NULL,
    "max_mark" DECIMAL(6,2) NOT NULL,
    "pass_mark" DECIMAL(6,2) NOT NULL,
    "due_date" TIMESTAMP(3),
    "submission_method" "SubmissionMethod",
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "allow_late_submission" BOOLEAN NOT NULL DEFAULT false,
    "late_policy" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "module_registration_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "raw_mark" DECIMAL(6,2),
    "moderated_mark" DECIMAL(6,2),
    "final_mark" DECIMAL(6,2),
    "grade" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_date" TIMESTAMP(3),
    "marked_date" TIMESTAMP(3),
    "marked_by" TEXT,
    "moderated_date" TIMESTAMP(3),
    "moderated_by" TEXT,
    "feedback" TEXT,
    "has_extenuating_circumstances" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_criteria" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "max_mark" DECIMAL(6,2) NOT NULL,
    "weighting" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessment_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_extensions" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "original_due_date" TIMESTAMP(3) NOT NULL,
    "extended_due_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "assessment_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_results" (
    "id" TEXT NOT NULL,
    "module_registration_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "aggregate_mark" DECIMAL(6,2),
    "grade" TEXT,
    "classification" TEXT,
    "status" "ModuleResultStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "confirmed_date" TIMESTAMP(3),
    "confirmed_by" TEXT,
    "board_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "module_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_boards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "board_type" "ExamBoardType" NOT NULL,
    "scheduled_date" TIMESTAMP(3),
    "chair_id" TEXT,
    "status" "ExamBoardStatus" NOT NULL DEFAULT 'SCHEDULED',
    "minutes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "exam_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_board_decisions" (
    "id" TEXT NOT NULL,
    "exam_board_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "decision" "BoardDecisionType" NOT NULL,
    "conditions" TEXT,
    "notes" TEXT,
    "decided_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "exam_board_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_board_members" (
    "id" TEXT NOT NULL,
    "exam_board_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "role" "BoardMemberRole" NOT NULL,
    "attendance_status" "MemberAttendance" NOT NULL DEFAULT 'ATTENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "exam_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_examiners" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "appointment_start" DATE NOT NULL,
    "appointment_end" DATE NOT NULL,
    "institution" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "programme_ids" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "external_examiners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "module_registration_id" TEXT NOT NULL,
    "submitted_date" TIMESTAMP(3) NOT NULL,
    "file_name" TEXT,
    "file_path" TEXT,
    "file_size" INTEGER,
    "submission_type" TEXT,
    "turnitin_score" DECIMAL(5,2),
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "late_penalty_applied" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_records" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "moderation_date" TIMESTAMP(3) NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "comments" TEXT,
    "adjustment_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "moderation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marking_schemes" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "marking_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_boundaries" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "lower_bound" DECIMAL(6,2) NOT NULL,
    "upper_bound" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "grade_boundaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymous_markings" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "revealed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "anonymous_markings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "second_marking_records" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "first_marker_mark" DECIMAL(6,2) NOT NULL,
    "second_marker_mark" DECIMAL(6,2) NOT NULL,
    "agreed_mark" DECIMAL(6,2),
    "second_marker_id" TEXT NOT NULL,
    "completed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "second_marking_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progression_records" (
    "id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "total_credits_attempted" INTEGER NOT NULL,
    "total_credits_passed" INTEGER NOT NULL,
    "average_mark" DECIMAL(6,2),
    "progression_decision" "ProgressionDecision" NOT NULL,
    "decision_date" TIMESTAMP(3),
    "board_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "progression_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progression_rules" (
    "id" TEXT NOT NULL,
    "programme_level" "ProgrammeLevel" NOT NULL,
    "year_of_study" INTEGER NOT NULL,
    "min_credits_to_pass" INTEGER NOT NULL,
    "min_average_mark" DECIMAL(6,2),
    "compensation_allowed" BOOLEAN NOT NULL DEFAULT false,
    "max_compensated_credits" INTEGER,
    "rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "progression_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "award_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "programme_id" TEXT NOT NULL,
    "award_title" TEXT NOT NULL,
    "classification" "AwardClassification",
    "final_average" DECIMAL(6,2),
    "total_credits" INTEGER NOT NULL,
    "award_date" DATE,
    "certificate_number" TEXT,
    "transcript_issued" BOOLEAN NOT NULL DEFAULT false,
    "status" "AwardStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "award_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classification_rules" (
    "id" TEXT NOT NULL,
    "programme_level" "ProgrammeLevel" NOT NULL,
    "classification" "AwardClassification" NOT NULL,
    "min_average_mark" DECIMAL(6,2) NOT NULL,
    "max_average_mark" DECIMAL(6,2) NOT NULL,
    "additional_criteria" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "classification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degree_calculations" (
    "id" TEXT NOT NULL,
    "award_record_id" TEXT NOT NULL,
    "calculation_method" TEXT NOT NULL,
    "year_weights" JSONB NOT NULL,
    "module_marks" JSONB NOT NULL,
    "final_average" DECIMAL(6,2) NOT NULL,
    "classification" "AwardClassification" NOT NULL,
    "calculated_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "degree_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "transcript_type" "TranscriptType" NOT NULL,
    "generated_date" TIMESTAMP(3) NOT NULL,
    "generated_by" TEXT,
    "modules" JSONB,
    "awards" JSONB,
    "document_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_lines" (
    "id" TEXT NOT NULL,
    "transcript_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "module_title" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "mark" DECIMAL(6,2),
    "grade" TEXT,
    "academic_year" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "transcript_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diploma_supplements" (
    "id" TEXT NOT NULL,
    "award_record_id" TEXT NOT NULL,
    "qualification_title" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "grading_scheme" TEXT,
    "overall_classification" TEXT,
    "access_requirements" TEXT,
    "further_study_access" TEXT,
    "professional_status" TEXT,
    "supplement_info" JSONB,
    "document_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "diploma_supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_accounts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "credit_limit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "total_debits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_credits" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_transaction_date" TIMESTAMP(3),
    "reconciliation_status" "ReconciliationStatus" NOT NULL DEFAULT 'BALANCED',
    "last_reconciled_date" TIMESTAMP(3),
    "last_reconciled_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_lines" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "charge_type" "ChargeType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "tax_code" TEXT,
    "invoice_id" TEXT,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "charge_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "sent_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "number_of_instalments" INTEGER NOT NULL,
    "instalment_amount" DECIMAL(10,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_instalments" (
    "id" TEXT NOT NULL,
    "payment_plan_id" TEXT NOT NULL,
    "instalment_num" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_date" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "payment_instalments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_agreements" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "sponsor_name" TEXT NOT NULL,
    "sponsor_type" "SponsorType" NOT NULL,
    "agreement_ref" TEXT,
    "academic_year" TEXT NOT NULL,
    "amount_agreed" DECIMAL(10,2) NOT NULL,
    "amount_received" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "sponsor_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bursary_funds" (
    "id" TEXT NOT NULL,
    "fund_name" TEXT NOT NULL,
    "fund_type" "BursaryFundType" NOT NULL,
    "academic_year" TEXT NOT NULL,
    "total_budget" DECIMAL(10,2) NOT NULL,
    "allocated" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remaining" DECIMAL(10,2) NOT NULL,
    "eligibility" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "bursary_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bursary_applications" (
    "id" TEXT NOT NULL,
    "bursary_fund_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL,
    "circumstances_desc" TEXT,
    "household_income" DECIMAL(10,2),
    "status" "BursaryAppStatus" NOT NULL DEFAULT 'SUBMITTED',
    "award_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "bursary_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_approvals" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "processed_date" TIMESTAMP(3),
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "refund_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "issued_by" TEXT,
    "issued_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_rates" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "fee_status" "FeeStatus" NOT NULL,
    "programme_level" "ProgrammeLevel" NOT NULL,
    "mode_of_study" "ModeOfStudy" NOT NULL,
    "annual_fee" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "fee_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_actions" (
    "id" TEXT NOT NULL,
    "student_account_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "action_date" TIMESTAMP(3) NOT NULL,
    "resolved_date" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "debt_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "module_registration_id" TEXT NOT NULL,
    "teaching_event_id" TEXT,
    "student_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceMarkStatus" NOT NULL DEFAULT 'ABSENT',
    "marked_by" TEXT,
    "marked_date" TIMESTAMP(3),
    "method" "AttendanceMarkMethod",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_scores" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "attendance_score" DECIMAL(5,2),
    "submission_score" DECIMAL(5,2),
    "vle_score" DECIMAL(5,2),
    "library_score" DECIMAL(5,2),
    "overall_score" DECIMAL(5,2),
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'GREEN',
    "calculated_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "engagement_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_interventions" (
    "id" TEXT NOT NULL,
    "engagement_score_id" TEXT,
    "student_id" TEXT NOT NULL,
    "intervention_type" "InterventionType" NOT NULL,
    "assigned_to" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "outcome" TEXT,
    "status" "InterventionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "engagement_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_alerts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "alert_type" "AlertType" NOT NULL,
    "threshold" DECIMAL(5,2),
    "current_value" DECIMAL(5,2),
    "trigger_date" TIMESTAMP(3) NOT NULL,
    "acknowledged_by" TEXT,
    "resolved_date" TIMESTAMP(3),
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "attendance_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_targets" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "programme_level" "ProgrammeLevel",
    "target_percentage" DECIMAL(5,2) NOT NULL,
    "warning_threshold" DECIMAL(5,2) NOT NULL,
    "critical_threshold" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "attendance_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_exemptions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "module_code" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "attendance_exemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_events" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "event_type" "EventType" NOT NULL,
    "title" TEXT,
    "academic_year" TEXT NOT NULL,
    "week_pattern" TEXT,
    "day_of_week" INTEGER,
    "start_time" TEXT,
    "end_time" TEXT,
    "duration" INTEGER,
    "room_id" TEXT,
    "staff_id" TEXT,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "teaching_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_code" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL,
    "room_type" "RoomType" NOT NULL,
    "facilities" JSONB,
    "is_accessible" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" TEXT NOT NULL,
    "teaching_event_id" TEXT NOT NULL,
    "room_id" TEXT,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "week_numbers" JSONB,
    "status" "SlotStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_clashes" (
    "id" TEXT NOT NULL,
    "slot_a_id" TEXT NOT NULL,
    "slot_b_id" TEXT NOT NULL,
    "clash_type" "ClashType" NOT NULL,
    "severity" TEXT NOT NULL,
    "resolved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "timetable_clashes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_groups" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "teaching_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "teaching_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_bookings" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "booked_by" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_availabilities" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "staff_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_to" TEXT,
    "resolved_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_interactions" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "interaction_type" "InteractionType" NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "support_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_flags" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "flag_type" "FlagType" NOT NULL,
    "severity" "FlagSeverity" NOT NULL,
    "raised_by" TEXT,
    "raised_date" TIMESTAMP(3) NOT NULL,
    "resolved_date" TIMESTAMP(3),
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_tutoring" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "action_items" JSONB,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "personal_tutoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "referral_source" TEXT NOT NULL,
    "referred_to" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "outcome" TEXT,
    "referral_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "referral_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutoring_actions" (
    "id" TEXT NOT NULL,
    "tutoring_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "tutoring_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ukvi_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tier4_status" "VisaStatus" NOT NULL,
    "cas_number" TEXT,
    "cas_assigned_date" TIMESTAMP(3),
    "cas_expiry_date" DATE,
    "visa_type" TEXT,
    "visa_start" DATE,
    "visa_expiry" DATE,
    "passport_number" TEXT,
    "passport_expiry" DATE,
    "brp_number" TEXT,
    "brp_collected" BOOLEAN NOT NULL DEFAULT false,
    "sponsorship_start" DATE,
    "sponsorship_end" DATE,
    "work_hours_limit" INTEGER,
    "compliance_status" "ComplianceStatus" NOT NULL DEFAULT 'COMPLIANT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ukvi_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ukvi_contact_points" (
    "id" TEXT NOT NULL,
    "ukvi_record_id" TEXT NOT NULL,
    "contact_type" "ContactPointType" NOT NULL,
    "contact_date" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL,
    "verified_by" TEXT,
    "evidence_type" TEXT,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ukvi_contact_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ukvi_reports" (
    "id" TEXT NOT NULL,
    "ukvi_record_id" TEXT NOT NULL,
    "report_type" "UKVIReportType" NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "reported_by" TEXT,
    "home_office_ref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ukvi_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ukvi_attendance_monitoring" (
    "id" TEXT NOT NULL,
    "ukvi_record_id" TEXT NOT NULL,
    "monitoring_date" TIMESTAMP(3) NOT NULL,
    "attendance_percentage" DECIMAL(5,2) NOT NULL,
    "compliant" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ukvi_attendance_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ec_claims" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "module_registration_id" TEXT,
    "reason" TEXT NOT NULL,
    "evidence_type" TEXT,
    "evidence_path" TEXT,
    "impact_description" TEXT,
    "requested_outcome" TEXT,
    "submitted_date" TIMESTAMP(3) NOT NULL,
    "panel_date" TIMESTAMP(3),
    "decision" "ECDecision",
    "decision_by" TEXT,
    "outcome_detail" TEXT,
    "status" "ECStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ec_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appeals" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "appeal_type" "AppealType" NOT NULL,
    "related_entity_id" TEXT,
    "grounds" TEXT NOT NULL,
    "evidence" JSONB,
    "submitted_date" TIMESTAMP(3) NOT NULL,
    "hearing_date" TIMESTAMP(3),
    "panel_members" JSONB,
    "outcome" "AppealOutcome",
    "decision_date" TIMESTAMP(3),
    "status" "AppealStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "appeals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plagiarism_cases" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "submission_id" TEXT,
    "detection_method" TEXT,
    "similarity_score" DECIMAL(5,2),
    "allegation_detail" TEXT,
    "evidence" JSONB,
    "investigator_id" TEXT,
    "hearing_date" TIMESTAMP(3),
    "outcome" TEXT,
    "penalty" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'RAISED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "plagiarism_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinary_cases" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "allegation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "evidence" JSONB,
    "investigator_id" TEXT,
    "hearing_date" TIMESTAMP(3),
    "outcome" TEXT,
    "sanction" TEXT,
    "appeal_deadline" DATE,
    "status" "CaseStatus" NOT NULL DEFAULT 'RAISED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "disciplinary_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fitness_to_study" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "referral_source" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "panel_date" TIMESTAMP(3),
    "outcome" TEXT,
    "support_plan" JSONB,
    "review_date" DATE,
    "status" "CaseStatus" NOT NULL DEFAULT 'RAISED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "fitness_to_study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "investigator_id" TEXT,
    "submitted_date" TIMESTAMP(3) NOT NULL,
    "resolved_date" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disability_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "disability_type" TEXT NOT NULL,
    "diagnosis_details" TEXT,
    "evidence_provided" BOOLEAN NOT NULL DEFAULT false,
    "dsa_funded" BOOLEAN NOT NULL DEFAULT false,
    "adviser_id" TEXT,
    "status" "DisabilityStatus" NOT NULL DEFAULT 'REGISTERED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "disability_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disability_adjustments" (
    "id" TEXT NOT NULL,
    "disability_record_id" TEXT NOT NULL,
    "adjustment_category" "AdjustmentCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "implemented_date" TIMESTAMP(3),
    "review_date" DATE,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "disability_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellbeing_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "referral_source" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'GREEN',
    "assigned_to" TEXT,
    "action_plan" JSONB,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wellbeing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mental_health_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "referral_date" TIMESTAMP(3) NOT NULL,
    "concern" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'GREEN',
    "assigned_to" TEXT,
    "support_plan" JSONB,
    "review_date" DATE,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mental_health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_requirements" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_by" DATE,
    "implemented_date" TIMESTAMP(3),
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "accessibility_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_ceremonies" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "ceremony_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT,
    "venue" TEXT NOT NULL,
    "capacity" INTEGER,
    "chief_guest" TEXT,
    "status" "CeremonyStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "graduation_ceremonies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_registrations" (
    "id" TEXT NOT NULL,
    "ceremony_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "award_id" TEXT,
    "attendance" "GradAttendance" NOT NULL DEFAULT 'ATTENDING',
    "guest_count" INTEGER NOT NULL DEFAULT 0,
    "guest_names" JSONB,
    "special_requirements" TEXT,
    "robe_ordered" BOOLEAN NOT NULL DEFAULT false,
    "status" "GradRegStatus" NOT NULL DEFAULT 'REGISTERED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "graduation_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "award_id" TEXT,
    "certificate_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "collected_date" TIMESTAMP(3),
    "status" "CertificateStatus" NOT NULL DEFAULT 'GENERATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "graduation_date" DATE,
    "employer_name" TEXT,
    "job_title" TEXT,
    "sector" TEXT,
    "further_study" TEXT,
    "contact_consent" BOOLEAN NOT NULL DEFAULT false,
    "last_contact_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "alumni_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_providers" (
    "id" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "sector" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "address" JSONB,
    "risk_assessment_date" DATE,
    "risk_status" "ProviderStatus" NOT NULL DEFAULT 'APPROVED',
    "dbs_required" BOOLEAN NOT NULL DEFAULT false,
    "insurance_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "placement_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "placement_type" "PlacementType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "hours_per_week" INTEGER,
    "supervisor_name" TEXT,
    "academic_tutor_id" TEXT,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_visits" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "visitor_name" TEXT NOT NULL,
    "notes" TEXT,
    "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "placement_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_assessments" (
    "id" TEXT NOT NULL,
    "placement_id" TEXT NOT NULL,
    "assessor_name" TEXT NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL,
    "competencies" JSONB,
    "overall_grade" TEXT,
    "comments" TEXT,
    "status" "AttemptStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "placement_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "student_id" TEXT,
    "document_type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_by" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "retention_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_verifications" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "verified_by" TEXT,
    "verified_date" TIMESTAMP(3),
    "method" TEXT,
    "notes" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "document_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_templates" (
    "id" TEXT NOT NULL,
    "template_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "letter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_letters" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "student_id" TEXT,
    "generated_by" TEXT,
    "generated_date" TIMESTAMP(3) NOT NULL,
    "document_path" TEXT,
    "sent_date" TIMESTAMP(3),
    "sent_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "generated_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_variables" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "variable_name" TEXT NOT NULL,
    "description" TEXT,
    "default_value" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "template_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_templates" (
    "id" TEXT NOT NULL,
    "template_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "channel" "CommChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "communication_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_logs" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "template_id" TEXT,
    "channel" "CommChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "sent_date" TIMESTAMP(3),
    "sent_by" TEXT,
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "read_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "communication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bulk_communications" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "recipient_query" JSONB,
    "total_recipients" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "scheduled_date" TIMESTAMP(3),
    "status" "BulkCommStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "bulk_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" "CommChannel" NOT NULL,
    "category" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hesa_returns" (
    "id" TEXT NOT NULL,
    "return_type" "HESAReturnType" NOT NULL,
    "academic_year" TEXT NOT NULL,
    "status" "HESAReturnStatus" NOT NULL DEFAULT 'PREPARATION',
    "submission_date" TIMESTAMP(3),
    "validation_errors" JSONB,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hesa_snapshots" (
    "id" TEXT NOT NULL,
    "hesa_return_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hesa_validation_rules" (
    "id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "validation_type" TEXT NOT NULL,
    "expected_values" JSONB,
    "severity" "ValidationSeverity" NOT NULL DEFAULT 'ERROR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statutory_returns" (
    "id" TEXT NOT NULL,
    "return_type" "StatReturnType" NOT NULL,
    "academic_year" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'preparation',
    "due_date" DATE,
    "submission_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "statutory_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_futures_entities" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "hesa_field_mapping" JSONB,
    "last_sync_date" TIMESTAMP(3),
    "validation_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "data_futures_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hesa_field_mappings" (
    "id" TEXT NOT NULL,
    "hesa_entity" TEXT NOT NULL,
    "hesa_field" TEXT NOT NULL,
    "local_model" TEXT NOT NULL,
    "local_field" TEXT NOT NULL,
    "transformation" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hesa_field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_blocks" (
    "id" TEXT NOT NULL,
    "block_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "total_rooms" INTEGER NOT NULL,
    "room_types" JSONB,
    "facilities" JSONB,
    "contact_email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "accommodation_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_rooms" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "room_type" "AccommRoomType" NOT NULL,
    "weekly_rent" DECIMAL(8,2) NOT NULL,
    "contract_length" INTEGER NOT NULL,
    "status" "AccommRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "accommodation_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_bookings" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "weekly_rent" DECIMAL(8,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'APPLIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "accommodation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_applications" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "preferred_block_id" TEXT,
    "room_type_preference" "AccommRoomType",
    "special_requirements" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'APPLIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "accommodation_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_of_circumstances" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "request_type" "ChangeType" NOT NULL,
    "current_value" TEXT,
    "requested_value" TEXT,
    "reason" TEXT NOT NULL,
    "evidence_path" TEXT,
    "request_date" TIMESTAMP(3) NOT NULL,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "effective_date" DATE,
    "status" "ChangeStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "change_of_circumstances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interruption_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "expected_return_date" DATE,
    "actual_return_date" DATE,
    "reason" TEXT NOT NULL,
    "status" "EnrolmentStatus" NOT NULL DEFAULT 'INTERRUPTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "interruption_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "enrolment_id" TEXT NOT NULL,
    "withdrawal_date" DATE NOT NULL,
    "last_attendance_date" DATE,
    "reason" TEXT NOT NULL,
    "destination" TEXT,
    "status" "EnrolmentStatus" NOT NULL DEFAULT 'WITHDRAWN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "withdrawal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL,
    "committee_name" TEXT NOT NULL,
    "committee_type" "CommitteeType" NOT NULL,
    "chair_id" TEXT,
    "meeting_frequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "committees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_meetings" (
    "id" TEXT NOT NULL,
    "committee_id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "agenda_path" TEXT,
    "minutes_path" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "committee_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_members" (
    "id" TEXT NOT NULL,
    "committee_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "role" "CommMemberRole" NOT NULL DEFAULT 'MEMBER',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "committee_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_agenda_items" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "item_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "presenter" TEXT,
    "documentation" TEXT,
    "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "committee_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "document_path" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_date" TIMESTAMP(3),
    "effective_date" DATE,
    "review_date" DATE,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "user_id" TEXT,
    "user_role" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "previous_data" JSONB,
    "new_data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3) NOT NULL,
    "logout_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_subscriptions" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "event_types" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "secret_key" TEXT NOT NULL,
    "last_triggered_at" TIMESTAMP(3),
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_errors" (
    "id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "payload" JSONB,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "resolved_at" TIMESTAMP(3),
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "workflow_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_protection_requests" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "request_type" "DataRequestType" NOT NULL,
    "description" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL,
    "acknowledged_date" TIMESTAMP(3),
    "due_date" DATE NOT NULL,
    "completed_date" TIMESTAMP(3),
    "completed_by" TEXT,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "refusal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "data_protection_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_date" TIMESTAMP(3),
    "revoked_date" TIMESTAMP(3),
    "version" TEXT,
    "purpose" TEXT,
    "legal_basis" "GdprBasis",
    "evidence_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_logs" (
    "id" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "http_status" INTEGER,
    "duration_ms" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendar" (
    "id" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "academic_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "year_code" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "enrolment_open" TIMESTAMP(3),
    "enrolment_close" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term_dates" (
    "id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "term_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "term_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_weeks" (
    "id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_teaching_week" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "teaching_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alpha3" TEXT,
    "numeric_code" TEXT,
    "is_eu" BOOLEAN NOT NULL DEFAULT false,
    "is_eea" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "institution_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution_type" TEXT NOT NULL,
    "country" TEXT,
    "is_uk" BOOLEAN NOT NULL DEFAULT false,
    "ukprn" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualification_references" (
    "id" TEXT NOT NULL,
    "qual_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER,
    "tariff_points" INTEGER,
    "is_higher_education" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "qualification_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scales" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scale_entries" (
    "id" TEXT NOT NULL,
    "grade_scale_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "lower_bound" DECIMAL(6,2) NOT NULL,
    "upper_bound" DECIMAL(6,2) NOT NULL,
    "grade_point" DECIMAL(4,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "grade_scale_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hecos_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cah2_code" TEXT,
    "cah3_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "hecos_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jacs_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject_area" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "jacs_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ucas_tariffs" (
    "id" TEXT NOT NULL,
    "qualification_type" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "tariff_points" INTEGER NOT NULL,
    "valid_from" DATE,
    "valid_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ucas_tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_type" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "student_group_members_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "persons_last_name_first_name_idx" ON "persons"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "persons_date_of_birth_idx" ON "persons"("date_of_birth");

-- CreateIndex
CREATE INDEX "person_names_person_id_idx" ON "person_names"("person_id");

-- CreateIndex
CREATE INDEX "person_addresses_person_id_idx" ON "person_addresses"("person_id");

-- CreateIndex
CREATE INDEX "person_contacts_person_id_idx" ON "person_contacts"("person_id");

-- CreateIndex
CREATE INDEX "person_identifiers_person_id_idx" ON "person_identifiers"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_identifiers_identifier_type_value_key" ON "person_identifiers"("identifier_type", "value");

-- CreateIndex
CREATE UNIQUE INDEX "person_demographics_person_id_key" ON "person_demographics"("person_id");

-- CreateIndex
CREATE INDEX "person_nationalities_person_id_idx" ON "person_nationalities"("person_id");

-- CreateIndex
CREATE INDEX "person_photos_person_id_idx" ON "person_photos"("person_id");

-- CreateIndex
CREATE INDEX "next_of_kin_person_id_idx" ON "next_of_kin"("person_id");

-- CreateIndex
CREATE INDEX "emergency_contacts_person_id_idx" ON "emergency_contacts"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_person_id_key" ON "students"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_number_key" ON "students"("student_number");

-- CreateIndex
CREATE INDEX "students_fee_status_idx" ON "students"("fee_status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_person_id_key" ON "staff"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_staff_number_key" ON "staff"("staff_number");

-- CreateIndex
CREATE INDEX "staff_department_id_idx" ON "staff"("department_id");

-- CreateIndex
CREATE INDEX "staff_contracts_staff_id_idx" ON "staff_contracts"("staff_id");

-- CreateIndex
CREATE INDEX "staff_qualifications_staff_id_idx" ON "staff_qualifications"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_person_id_key" ON "applicants"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_applicant_number_key" ON "applicants"("applicant_number");

-- CreateIndex
CREATE INDEX "prior_qualifications_person_id_idx" ON "prior_qualifications"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloak_id_key" ON "users"("keycloak_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_person_id_key" ON "users"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_dean_id_key" ON "faculties"("dean_id");

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_head_of_school_id_key" ON "schools"("head_of_school_id");

-- CreateIndex
CREATE INDEX "schools_faculty_id_idx" ON "schools"("faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_school_id_idx" ON "departments"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_programme_code_key" ON "programmes"("programme_code");

-- CreateIndex
CREATE INDEX "programmes_department_id_idx" ON "programmes"("department_id");

-- CreateIndex
CREATE INDEX "programmes_status_idx" ON "programmes"("status");

-- CreateIndex
CREATE INDEX "programme_specifications_programme_id_idx" ON "programme_specifications"("programme_id");

-- CreateIndex
CREATE INDEX "programme_pathways_programme_id_idx" ON "programme_pathways"("programme_id");

-- CreateIndex
CREATE INDEX "programme_accreditations_programme_id_idx" ON "programme_accreditations"("programme_id");

-- CreateIndex
CREATE UNIQUE INDEX "modules_module_code_key" ON "modules"("module_code");

-- CreateIndex
CREATE INDEX "modules_department_id_idx" ON "modules"("department_id");

-- CreateIndex
CREATE INDEX "modules_status_idx" ON "modules"("status");

-- CreateIndex
CREATE INDEX "module_specifications_module_id_idx" ON "module_specifications"("module_id");

-- CreateIndex
CREATE INDEX "programme_modules_programme_id_idx" ON "programme_modules"("programme_id");

-- CreateIndex
CREATE INDEX "programme_modules_module_id_idx" ON "programme_modules"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "programme_modules_programme_id_module_id_key" ON "programme_modules"("programme_id", "module_id");

-- CreateIndex
CREATE INDEX "programme_approvals_programme_id_idx" ON "programme_approvals"("programme_id");

-- CreateIndex
CREATE INDEX "learning_outcomes_programme_specification_id_idx" ON "learning_outcomes"("programme_specification_id");

-- CreateIndex
CREATE INDEX "learning_outcomes_module_id_idx" ON "learning_outcomes"("module_id");

-- CreateIndex
CREATE INDEX "assessment_patterns_module_id_idx" ON "assessment_patterns"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_frameworks_name_key" ON "credit_frameworks"("name");

-- CreateIndex
CREATE INDEX "qualification_aims_programme_id_idx" ON "qualification_aims"("programme_id");

-- CreateIndex
CREATE INDEX "module_deliveries_module_id_idx" ON "module_deliveries"("module_id");

-- CreateIndex
CREATE INDEX "module_deliveries_staff_id_idx" ON "module_deliveries"("staff_id");

-- CreateIndex
CREATE INDEX "module_deliveries_academic_year_idx" ON "module_deliveries"("academic_year");

-- CreateIndex
CREATE INDEX "programme_versions_programme_id_idx" ON "programme_versions"("programme_id");

-- CreateIndex
CREATE UNIQUE INDEX "module_prerequisites_module_id_prerequisite_module_id_key" ON "module_prerequisites"("module_id", "prerequisite_module_id");

-- CreateIndex
CREATE INDEX "applications_applicant_id_idx" ON "applications"("applicant_id");

-- CreateIndex
CREATE INDEX "applications_programme_id_idx" ON "applications"("programme_id");

-- CreateIndex
CREATE INDEX "applications_academic_year_idx" ON "applications"("academic_year");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "application_qualifications_application_id_idx" ON "application_qualifications"("application_id");

-- CreateIndex
CREATE INDEX "application_references_application_id_idx" ON "application_references"("application_id");

-- CreateIndex
CREATE INDEX "offer_conditions_application_id_idx" ON "offer_conditions"("application_id");

-- CreateIndex
CREATE INDEX "interviews_application_id_idx" ON "interviews"("application_id");

-- CreateIndex
CREATE INDEX "clearance_checks_application_id_idx" ON "clearance_checks"("application_id");

-- CreateIndex
CREATE INDEX "admissions_event_attendees_event_id_idx" ON "admissions_event_attendees"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_applications_agent_id_application_id_key" ON "agent_applications"("agent_id", "application_id");

-- CreateIndex
CREATE INDEX "ucas_choices_application_id_idx" ON "ucas_choices"("application_id");

-- CreateIndex
CREATE INDEX "enrolments_student_id_idx" ON "enrolments"("student_id");

-- CreateIndex
CREATE INDEX "enrolments_programme_id_idx" ON "enrolments"("programme_id");

-- CreateIndex
CREATE INDEX "enrolments_academic_year_idx" ON "enrolments"("academic_year");

-- CreateIndex
CREATE INDEX "enrolments_status_idx" ON "enrolments"("status");

-- CreateIndex
CREATE INDEX "enrolment_status_history_enrolment_id_idx" ON "enrolment_status_history"("enrolment_id");

-- CreateIndex
CREATE INDEX "module_registrations_enrolment_id_idx" ON "module_registrations"("enrolment_id");

-- CreateIndex
CREATE INDEX "module_registrations_module_id_idx" ON "module_registrations"("module_id");

-- CreateIndex
CREATE INDEX "module_registrations_academic_year_idx" ON "module_registrations"("academic_year");

-- CreateIndex
CREATE INDEX "module_registrations_status_idx" ON "module_registrations"("status");

-- CreateIndex
CREATE INDEX "student_programme_routes_student_id_idx" ON "student_programme_routes"("student_id");

-- CreateIndex
CREATE INDEX "student_programme_routes_programme_id_idx" ON "student_programme_routes"("programme_id");

-- CreateIndex
CREATE INDEX "enrolment_tasks_enrolment_id_idx" ON "enrolment_tasks"("enrolment_id");

-- CreateIndex
CREATE INDEX "fee_assessments_enrolment_id_idx" ON "fee_assessments"("enrolment_id");

-- CreateIndex
CREATE INDEX "registration_periods_academic_year_idx" ON "registration_periods"("academic_year");

-- CreateIndex
CREATE INDEX "enrolment_documents_enrolment_id_idx" ON "enrolment_documents"("enrolment_id");

-- CreateIndex
CREATE INDEX "assessments_module_id_idx" ON "assessments"("module_id");

-- CreateIndex
CREATE INDEX "assessments_academic_year_idx" ON "assessments"("academic_year");

-- CreateIndex
CREATE INDEX "assessment_attempts_assessment_id_idx" ON "assessment_attempts"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_module_registration_id_idx" ON "assessment_attempts"("module_registration_id");

-- CreateIndex
CREATE INDEX "assessment_attempts_status_idx" ON "assessment_attempts"("status");

-- CreateIndex
CREATE INDEX "assessment_criteria_assessment_id_idx" ON "assessment_criteria"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_extensions_assessment_id_idx" ON "assessment_extensions"("assessment_id");

-- CreateIndex
CREATE INDEX "module_results_module_registration_id_idx" ON "module_results"("module_registration_id");

-- CreateIndex
CREATE INDEX "module_results_module_id_idx" ON "module_results"("module_id");

-- CreateIndex
CREATE INDEX "module_results_academic_year_idx" ON "module_results"("academic_year");

-- CreateIndex
CREATE INDEX "exam_boards_programme_id_idx" ON "exam_boards"("programme_id");

-- CreateIndex
CREATE INDEX "exam_boards_academic_year_idx" ON "exam_boards"("academic_year");

-- CreateIndex
CREATE INDEX "exam_board_decisions_exam_board_id_idx" ON "exam_board_decisions"("exam_board_id");

-- CreateIndex
CREATE INDEX "exam_board_decisions_student_id_idx" ON "exam_board_decisions"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_board_members_exam_board_id_staff_id_key" ON "exam_board_members"("exam_board_id", "staff_id");

-- CreateIndex
CREATE INDEX "external_examiners_staff_id_idx" ON "external_examiners"("staff_id");

-- CreateIndex
CREATE INDEX "submissions_assessment_id_idx" ON "submissions"("assessment_id");

-- CreateIndex
CREATE INDEX "submissions_module_registration_id_idx" ON "submissions"("module_registration_id");

-- CreateIndex
CREATE INDEX "moderation_records_assessment_id_idx" ON "moderation_records"("assessment_id");

-- CreateIndex
CREATE INDEX "marking_schemes_assessment_id_idx" ON "marking_schemes"("assessment_id");

-- CreateIndex
CREATE INDEX "grade_boundaries_assessment_id_idx" ON "grade_boundaries"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_markings_anonymous_id_key" ON "anonymous_markings"("anonymous_id");

-- CreateIndex
CREATE INDEX "anonymous_markings_assessment_id_idx" ON "anonymous_markings"("assessment_id");

-- CreateIndex
CREATE INDEX "second_marking_records_assessment_id_idx" ON "second_marking_records"("assessment_id");

-- CreateIndex
CREATE INDEX "progression_records_enrolment_id_idx" ON "progression_records"("enrolment_id");

-- CreateIndex
CREATE INDEX "progression_records_academic_year_idx" ON "progression_records"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "award_records_certificate_number_key" ON "award_records"("certificate_number");

-- CreateIndex
CREATE INDEX "award_records_student_id_idx" ON "award_records"("student_id");

-- CreateIndex
CREATE INDEX "award_records_programme_id_idx" ON "award_records"("programme_id");

-- CreateIndex
CREATE UNIQUE INDEX "degree_calculations_award_record_id_key" ON "degree_calculations"("award_record_id");

-- CreateIndex
CREATE INDEX "transcripts_student_id_idx" ON "transcripts"("student_id");

-- CreateIndex
CREATE INDEX "transcript_lines_transcript_id_idx" ON "transcript_lines"("transcript_id");

-- CreateIndex
CREATE UNIQUE INDEX "diploma_supplements_award_record_id_key" ON "diploma_supplements"("award_record_id");

-- CreateIndex
CREATE INDEX "student_accounts_student_id_idx" ON "student_accounts"("student_id");

-- CreateIndex
CREATE INDEX "student_accounts_academic_year_idx" ON "student_accounts"("academic_year");

-- CreateIndex
CREATE INDEX "charge_lines_student_account_id_idx" ON "charge_lines"("student_account_id");

-- CreateIndex
CREATE INDEX "charge_lines_invoice_id_idx" ON "charge_lines"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_student_account_id_idx" ON "invoices"("student_account_id");

-- CreateIndex
CREATE INDEX "payments_student_account_id_idx" ON "payments"("student_account_id");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_plans_student_account_id_idx" ON "payment_plans"("student_account_id");

-- CreateIndex
CREATE INDEX "payment_instalments_payment_plan_id_idx" ON "payment_instalments"("payment_plan_id");

-- CreateIndex
CREATE INDEX "sponsor_agreements_student_account_id_idx" ON "sponsor_agreements"("student_account_id");

-- CreateIndex
CREATE INDEX "bursary_funds_academic_year_idx" ON "bursary_funds"("academic_year");

-- CreateIndex
CREATE INDEX "bursary_applications_bursary_fund_id_idx" ON "bursary_applications"("bursary_fund_id");

-- CreateIndex
CREATE INDEX "bursary_applications_student_id_idx" ON "bursary_applications"("student_id");

-- CreateIndex
CREATE INDEX "refund_approvals_student_account_id_idx" ON "refund_approvals"("student_account_id");

-- CreateIndex
CREATE INDEX "credit_notes_invoice_id_idx" ON "credit_notes"("invoice_id");

-- CreateIndex
CREATE INDEX "fee_rates_academic_year_idx" ON "fee_rates"("academic_year");

-- CreateIndex
CREATE INDEX "debt_actions_student_account_id_idx" ON "debt_actions"("student_account_id");

-- CreateIndex
CREATE INDEX "attendance_records_module_registration_id_idx" ON "attendance_records"("module_registration_id");

-- CreateIndex
CREATE INDEX "attendance_records_student_id_idx" ON "attendance_records"("student_id");

-- CreateIndex
CREATE INDEX "attendance_records_date_idx" ON "attendance_records"("date");

-- CreateIndex
CREATE INDEX "engagement_scores_student_id_idx" ON "engagement_scores"("student_id");

-- CreateIndex
CREATE INDEX "engagement_scores_academic_year_idx" ON "engagement_scores"("academic_year");

-- CreateIndex
CREATE INDEX "engagement_scores_risk_level_idx" ON "engagement_scores"("risk_level");

-- CreateIndex
CREATE INDEX "engagement_interventions_student_id_idx" ON "engagement_interventions"("student_id");

-- CreateIndex
CREATE INDEX "attendance_alerts_student_id_idx" ON "attendance_alerts"("student_id");

-- CreateIndex
CREATE INDEX "attendance_alerts_status_idx" ON "attendance_alerts"("status");

-- CreateIndex
CREATE INDEX "attendance_targets_academic_year_idx" ON "attendance_targets"("academic_year");

-- CreateIndex
CREATE INDEX "attendance_exemptions_student_id_idx" ON "attendance_exemptions"("student_id");

-- CreateIndex
CREATE INDEX "teaching_events_module_id_idx" ON "teaching_events"("module_id");

-- CreateIndex
CREATE INDEX "teaching_events_staff_id_idx" ON "teaching_events"("staff_id");

-- CreateIndex
CREATE INDEX "teaching_events_academic_year_idx" ON "teaching_events"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_room_code_key" ON "rooms"("room_code");

-- CreateIndex
CREATE INDEX "timetable_slots_teaching_event_id_idx" ON "timetable_slots"("teaching_event_id");

-- CreateIndex
CREATE INDEX "teaching_groups_module_id_idx" ON "teaching_groups"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_group_members_group_id_student_id_key" ON "teaching_group_members"("group_id", "student_id");

-- CreateIndex
CREATE INDEX "room_bookings_room_id_idx" ON "room_bookings"("room_id");

-- CreateIndex
CREATE INDEX "room_bookings_date_idx" ON "room_bookings"("date");

-- CreateIndex
CREATE INDEX "staff_availabilities_staff_id_idx" ON "staff_availabilities"("staff_id");

-- CreateIndex
CREATE INDEX "support_tickets_student_id_idx" ON "support_tickets"("student_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_interactions_ticket_id_idx" ON "support_interactions"("ticket_id");

-- CreateIndex
CREATE INDEX "student_flags_student_id_idx" ON "student_flags"("student_id");

-- CreateIndex
CREATE INDEX "student_flags_flag_type_idx" ON "student_flags"("flag_type");

-- CreateIndex
CREATE INDEX "student_flags_status_idx" ON "student_flags"("status");

-- CreateIndex
CREATE INDEX "personal_tutoring_student_id_idx" ON "personal_tutoring"("student_id");

-- CreateIndex
CREATE INDEX "personal_tutoring_tutor_id_idx" ON "personal_tutoring"("tutor_id");

-- CreateIndex
CREATE INDEX "referral_records_student_id_idx" ON "referral_records"("student_id");

-- CreateIndex
CREATE INDEX "tutoring_actions_tutoring_id_idx" ON "tutoring_actions"("tutoring_id");

-- CreateIndex
CREATE INDEX "ukvi_records_student_id_idx" ON "ukvi_records"("student_id");

-- CreateIndex
CREATE INDEX "ukvi_records_compliance_status_idx" ON "ukvi_records"("compliance_status");

-- CreateIndex
CREATE INDEX "ukvi_contact_points_ukvi_record_id_idx" ON "ukvi_contact_points"("ukvi_record_id");

-- CreateIndex
CREATE INDEX "ukvi_reports_ukvi_record_id_idx" ON "ukvi_reports"("ukvi_record_id");

-- CreateIndex
CREATE INDEX "ukvi_attendance_monitoring_ukvi_record_id_idx" ON "ukvi_attendance_monitoring"("ukvi_record_id");

-- CreateIndex
CREATE INDEX "ec_claims_student_id_idx" ON "ec_claims"("student_id");

-- CreateIndex
CREATE INDEX "ec_claims_status_idx" ON "ec_claims"("status");

-- CreateIndex
CREATE INDEX "appeals_student_id_idx" ON "appeals"("student_id");

-- CreateIndex
CREATE INDEX "appeals_status_idx" ON "appeals"("status");

-- CreateIndex
CREATE INDEX "plagiarism_cases_student_id_idx" ON "plagiarism_cases"("student_id");

-- CreateIndex
CREATE INDEX "plagiarism_cases_status_idx" ON "plagiarism_cases"("status");

-- CreateIndex
CREATE INDEX "disciplinary_cases_student_id_idx" ON "disciplinary_cases"("student_id");

-- CreateIndex
CREATE INDEX "disciplinary_cases_status_idx" ON "disciplinary_cases"("status");

-- CreateIndex
CREATE INDEX "fitness_to_study_student_id_idx" ON "fitness_to_study"("student_id");

-- CreateIndex
CREATE INDEX "complaints_student_id_idx" ON "complaints"("student_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "disability_records_student_id_idx" ON "disability_records"("student_id");

-- CreateIndex
CREATE INDEX "disability_adjustments_disability_record_id_idx" ON "disability_adjustments"("disability_record_id");

-- CreateIndex
CREATE INDEX "wellbeing_records_student_id_idx" ON "wellbeing_records"("student_id");

-- CreateIndex
CREATE INDEX "mental_health_records_student_id_idx" ON "mental_health_records"("student_id");

-- CreateIndex
CREATE INDEX "accessibility_requirements_student_id_idx" ON "accessibility_requirements"("student_id");

-- CreateIndex
CREATE INDEX "graduation_ceremonies_academic_year_idx" ON "graduation_ceremonies"("academic_year");

-- CreateIndex
CREATE INDEX "graduation_registrations_ceremony_id_idx" ON "graduation_registrations"("ceremony_id");

-- CreateIndex
CREATE INDEX "graduation_registrations_student_id_idx" ON "graduation_registrations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE INDEX "certificates_student_id_idx" ON "certificates"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_records_student_id_key" ON "alumni_records"("student_id");

-- CreateIndex
CREATE INDEX "placements_student_id_idx" ON "placements"("student_id");

-- CreateIndex
CREATE INDEX "placements_enrolment_id_idx" ON "placements"("enrolment_id");

-- CreateIndex
CREATE INDEX "placements_provider_id_idx" ON "placements"("provider_id");

-- CreateIndex
CREATE INDEX "placement_visits_placement_id_idx" ON "placement_visits"("placement_id");

-- CreateIndex
CREATE INDEX "placement_assessments_placement_id_idx" ON "placement_assessments"("placement_id");

-- CreateIndex
CREATE INDEX "documents_student_id_idx" ON "documents"("student_id");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "document_verifications_document_id_idx" ON "document_verifications"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "letter_templates_template_code_key" ON "letter_templates"("template_code");

-- CreateIndex
CREATE INDEX "generated_letters_template_id_idx" ON "generated_letters"("template_id");

-- CreateIndex
CREATE INDEX "template_variables_template_id_idx" ON "template_variables"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "communication_templates_template_code_key" ON "communication_templates"("template_code");

-- CreateIndex
CREATE INDEX "communication_logs_recipient_id_idx" ON "communication_logs"("recipient_id");

-- CreateIndex
CREATE INDEX "communication_logs_delivery_status_idx" ON "communication_logs"("delivery_status");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "hesa_returns_academic_year_idx" ON "hesa_returns"("academic_year");

-- CreateIndex
CREATE INDEX "hesa_snapshots_hesa_return_id_idx" ON "hesa_snapshots"("hesa_return_id");

-- CreateIndex
CREATE INDEX "hesa_snapshots_entity_type_entity_id_idx" ON "hesa_snapshots"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "hesa_validation_rules_rule_code_key" ON "hesa_validation_rules"("rule_code");

-- CreateIndex
CREATE INDEX "statutory_returns_academic_year_idx" ON "statutory_returns"("academic_year");

-- CreateIndex
CREATE INDEX "data_futures_entities_entity_type_entity_id_idx" ON "data_futures_entities"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "hesa_field_mappings_hesa_entity_hesa_field_key" ON "hesa_field_mappings"("hesa_entity", "hesa_field");

-- CreateIndex
CREATE INDEX "accommodation_rooms_block_id_idx" ON "accommodation_rooms"("block_id");

-- CreateIndex
CREATE INDEX "accommodation_rooms_status_idx" ON "accommodation_rooms"("status");

-- CreateIndex
CREATE INDEX "accommodation_bookings_room_id_idx" ON "accommodation_bookings"("room_id");

-- CreateIndex
CREATE INDEX "accommodation_bookings_student_id_idx" ON "accommodation_bookings"("student_id");

-- CreateIndex
CREATE INDEX "accommodation_applications_student_id_idx" ON "accommodation_applications"("student_id");

-- CreateIndex
CREATE INDEX "change_of_circumstances_student_id_idx" ON "change_of_circumstances"("student_id");

-- CreateIndex
CREATE INDEX "change_of_circumstances_status_idx" ON "change_of_circumstances"("status");

-- CreateIndex
CREATE INDEX "interruption_records_student_id_idx" ON "interruption_records"("student_id");

-- CreateIndex
CREATE INDEX "interruption_records_enrolment_id_idx" ON "interruption_records"("enrolment_id");

-- CreateIndex
CREATE INDEX "withdrawal_records_student_id_idx" ON "withdrawal_records"("student_id");

-- CreateIndex
CREATE INDEX "withdrawal_records_enrolment_id_idx" ON "withdrawal_records"("enrolment_id");

-- CreateIndex
CREATE INDEX "committee_meetings_committee_id_idx" ON "committee_meetings"("committee_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_members_committee_id_staff_id_key" ON "committee_members"("committee_id", "staff_id");

-- CreateIndex
CREATE INDEX "committee_agenda_items_meeting_id_idx" ON "committee_agenda_items"("meeting_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_setting_key_key" ON "system_settings"("setting_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions"("is_active");

-- CreateIndex
CREATE INDEX "data_protection_requests_student_id_idx" ON "data_protection_requests"("student_id");

-- CreateIndex
CREATE INDEX "data_protection_requests_status_idx" ON "data_protection_requests"("status");

-- CreateIndex
CREATE INDEX "consent_records_student_id_idx" ON "consent_records"("student_id");

-- CreateIndex
CREATE INDEX "integration_logs_system_name_idx" ON "integration_logs"("system_name");

-- CreateIndex
CREATE INDEX "integration_logs_created_at_idx" ON "integration_logs"("created_at");

-- CreateIndex
CREATE INDEX "academic_calendar_academic_year_idx" ON "academic_calendar"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_year_code_key" ON "academic_years"("year_code");

-- CreateIndex
CREATE INDEX "term_dates_academic_year_id_idx" ON "term_dates"("academic_year_id");

-- CreateIndex
CREATE INDEX "teaching_weeks_academic_year_id_idx" ON "teaching_weeks"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_alpha3_key" ON "countries"("alpha3");

-- CreateIndex
CREATE UNIQUE INDEX "countries_numeric_code_key" ON "countries"("numeric_code");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institution_code_key" ON "institutions"("institution_code");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_ukprn_key" ON "institutions"("ukprn");

-- CreateIndex
CREATE UNIQUE INDEX "qualification_references_qual_code_key" ON "qualification_references"("qual_code");

-- CreateIndex
CREATE UNIQUE INDEX "grade_scales_name_key" ON "grade_scales"("name");

-- CreateIndex
CREATE INDEX "grade_scale_entries_grade_scale_id_idx" ON "grade_scale_entries"("grade_scale_id");

-- CreateIndex
CREATE UNIQUE INDEX "hecos_codes_code_key" ON "hecos_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "jacs_codes_code_key" ON "jacs_codes"("code");

-- CreateIndex
CREATE INDEX "student_groups_academic_year_idx" ON "student_groups"("academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "student_group_members_group_id_student_id_key" ON "student_group_members"("group_id", "student_id");

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
ALTER TABLE "person_names" ADD CONSTRAINT "person_names_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_addresses" ADD CONSTRAINT "person_addresses_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_contacts" ADD CONSTRAINT "person_contacts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_identifiers" ADD CONSTRAINT "person_identifiers_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_demographics" ADD CONSTRAINT "person_demographics_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_nationalities" ADD CONSTRAINT "person_nationalities_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_photos" ADD CONSTRAINT "person_photos_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "next_of_kin" ADD CONSTRAINT "next_of_kin_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_contracts" ADD CONSTRAINT "staff_contracts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_qualifications" ADD CONSTRAINT "staff_qualifications_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prior_qualifications" ADD CONSTRAINT "prior_qualifications_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_dean_id_fkey" FOREIGN KEY ("dean_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_head_of_school_id_fkey" FOREIGN KEY ("head_of_school_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_specifications" ADD CONSTRAINT "programme_specifications_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_pathways" ADD CONSTRAINT "programme_pathways_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_accreditations" ADD CONSTRAINT "programme_accreditations_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_specifications" ADD CONSTRAINT "module_specifications_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_modules" ADD CONSTRAINT "programme_modules_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_modules" ADD CONSTRAINT "programme_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_approvals" ADD CONSTRAINT "programme_approvals_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_outcomes" ADD CONSTRAINT "learning_outcomes_programme_specification_id_fkey" FOREIGN KEY ("programme_specification_id") REFERENCES "programme_specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_outcomes" ADD CONSTRAINT "learning_outcomes_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_patterns" ADD CONSTRAINT "assessment_patterns_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualification_aims" ADD CONSTRAINT "qualification_aims_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_deliveries" ADD CONSTRAINT "module_deliveries_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_deliveries" ADD CONSTRAINT "module_deliveries_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_versions" ADD CONSTRAINT "programme_versions_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_prerequisites" ADD CONSTRAINT "module_prerequisites_prerequisite_module_id_fkey" FOREIGN KEY ("prerequisite_module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_qualifications" ADD CONSTRAINT "application_qualifications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_references" ADD CONSTRAINT "application_references_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_conditions" ADD CONSTRAINT "offer_conditions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clearance_checks" ADD CONSTRAINT "clearance_checks_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions_event_attendees" ADD CONSTRAINT "admissions_event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "admissions_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_applications" ADD CONSTRAINT "agent_applications_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_applications" ADD CONSTRAINT "agent_applications_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ucas_choices" ADD CONSTRAINT "ucas_choices_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolment_status_history" ADD CONSTRAINT "enrolment_status_history_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_registrations" ADD CONSTRAINT "module_registrations_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_registrations" ADD CONSTRAINT "module_registrations_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_programme_routes" ADD CONSTRAINT "student_programme_routes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_programme_routes" ADD CONSTRAINT "student_programme_routes_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolment_tasks" ADD CONSTRAINT "enrolment_tasks_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_assessments" ADD CONSTRAINT "fee_assessments_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolment_documents" ADD CONSTRAINT "enrolment_documents_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_module_registration_id_fkey" FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_criteria" ADD CONSTRAINT "assessment_criteria_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_extensions" ADD CONSTRAINT "assessment_extensions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_results" ADD CONSTRAINT "module_results_module_registration_id_fkey" FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_results" ADD CONSTRAINT "module_results_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_boards" ADD CONSTRAINT "exam_boards_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_board_decisions" ADD CONSTRAINT "exam_board_decisions_exam_board_id_fkey" FOREIGN KEY ("exam_board_id") REFERENCES "exam_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_board_decisions" ADD CONSTRAINT "exam_board_decisions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_board_members" ADD CONSTRAINT "exam_board_members_exam_board_id_fkey" FOREIGN KEY ("exam_board_id") REFERENCES "exam_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_board_members" ADD CONSTRAINT "exam_board_members_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_examiners" ADD CONSTRAINT "external_examiners_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_module_registration_id_fkey" FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marking_schemes" ADD CONSTRAINT "marking_schemes_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_boundaries" ADD CONSTRAINT "grade_boundaries_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anonymous_markings" ADD CONSTRAINT "anonymous_markings_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "second_marking_records" ADD CONSTRAINT "second_marking_records_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_records" ADD CONSTRAINT "progression_records_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_records" ADD CONSTRAINT "award_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_records" ADD CONSTRAINT "award_records_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "award_records" ADD CONSTRAINT "award_records_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degree_calculations" ADD CONSTRAINT "degree_calculations_award_record_id_fkey" FOREIGN KEY ("award_record_id") REFERENCES "award_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_lines" ADD CONSTRAINT "transcript_lines_transcript_id_fkey" FOREIGN KEY ("transcript_id") REFERENCES "transcripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diploma_supplements" ADD CONSTRAINT "diploma_supplements_award_record_id_fkey" FOREIGN KEY ("award_record_id") REFERENCES "award_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_accounts" ADD CONSTRAINT "student_accounts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_lines" ADD CONSTRAINT "charge_lines_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_lines" ADD CONSTRAINT "charge_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_instalments" ADD CONSTRAINT "payment_instalments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_agreements" ADD CONSTRAINT "sponsor_agreements_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bursary_applications" ADD CONSTRAINT "bursary_applications_bursary_fund_id_fkey" FOREIGN KEY ("bursary_fund_id") REFERENCES "bursary_funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bursary_applications" ADD CONSTRAINT "bursary_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_approvals" ADD CONSTRAINT "refund_approvals_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_actions" ADD CONSTRAINT "debt_actions_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "student_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_module_registration_id_fkey" FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_teaching_event_id_fkey" FOREIGN KEY ("teaching_event_id") REFERENCES "teaching_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_scores" ADD CONSTRAINT "engagement_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_interventions" ADD CONSTRAINT "engagement_interventions_engagement_score_id_fkey" FOREIGN KEY ("engagement_score_id") REFERENCES "engagement_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_interventions" ADD CONSTRAINT "engagement_interventions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_alerts" ADD CONSTRAINT "attendance_alerts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_events" ADD CONSTRAINT "teaching_events_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_events" ADD CONSTRAINT "teaching_events_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_events" ADD CONSTRAINT "teaching_events_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_teaching_event_id_fkey" FOREIGN KEY ("teaching_event_id") REFERENCES "teaching_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_clashes" ADD CONSTRAINT "timetable_clashes_slot_a_id_fkey" FOREIGN KEY ("slot_a_id") REFERENCES "timetable_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_clashes" ADD CONSTRAINT "timetable_clashes_slot_b_id_fkey" FOREIGN KEY ("slot_b_id") REFERENCES "timetable_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_groups" ADD CONSTRAINT "teaching_groups_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_group_members" ADD CONSTRAINT "teaching_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "teaching_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_group_members" ADD CONSTRAINT "teaching_group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_availabilities" ADD CONSTRAINT "staff_availabilities_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_interactions" ADD CONSTRAINT "support_interactions_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_flags" ADD CONSTRAINT "student_flags_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tutoring" ADD CONSTRAINT "personal_tutoring_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tutoring" ADD CONSTRAINT "personal_tutoring_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_records" ADD CONSTRAINT "referral_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutoring_actions" ADD CONSTRAINT "tutoring_actions_tutoring_id_fkey" FOREIGN KEY ("tutoring_id") REFERENCES "personal_tutoring"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ukvi_records" ADD CONSTRAINT "ukvi_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ukvi_contact_points" ADD CONSTRAINT "ukvi_contact_points_ukvi_record_id_fkey" FOREIGN KEY ("ukvi_record_id") REFERENCES "ukvi_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ukvi_reports" ADD CONSTRAINT "ukvi_reports_ukvi_record_id_fkey" FOREIGN KEY ("ukvi_record_id") REFERENCES "ukvi_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ukvi_attendance_monitoring" ADD CONSTRAINT "ukvi_attendance_monitoring_ukvi_record_id_fkey" FOREIGN KEY ("ukvi_record_id") REFERENCES "ukvi_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ec_claims" ADD CONSTRAINT "ec_claims_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ec_claims" ADD CONSTRAINT "ec_claims_module_registration_id_fkey" FOREIGN KEY ("module_registration_id") REFERENCES "module_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_cases" ADD CONSTRAINT "plagiarism_cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_cases" ADD CONSTRAINT "plagiarism_cases_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "disciplinary_cases_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_to_study" ADD CONSTRAINT "fitness_to_study_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disability_records" ADD CONSTRAINT "disability_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disability_adjustments" ADD CONSTRAINT "disability_adjustments_disability_record_id_fkey" FOREIGN KEY ("disability_record_id") REFERENCES "disability_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellbeing_records" ADD CONSTRAINT "wellbeing_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mental_health_records" ADD CONSTRAINT "mental_health_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessibility_requirements" ADD CONSTRAINT "accessibility_requirements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_registrations" ADD CONSTRAINT "graduation_registrations_ceremony_id_fkey" FOREIGN KEY ("ceremony_id") REFERENCES "graduation_ceremonies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_registrations" ADD CONSTRAINT "graduation_registrations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_records" ADD CONSTRAINT "alumni_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "placement_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_academic_tutor_id_fkey" FOREIGN KEY ("academic_tutor_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_visits" ADD CONSTRAINT "placement_visits_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_assessments" ADD CONSTRAINT "placement_assessments_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_verifications" ADD CONSTRAINT "document_verifications_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_letters" ADD CONSTRAINT "generated_letters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "letter_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_variables" ADD CONSTRAINT "template_variables_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "letter_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "communication_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bulk_communications" ADD CONSTRAINT "bulk_communications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "communication_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hesa_snapshots" ADD CONSTRAINT "hesa_snapshots_hesa_return_id_fkey" FOREIGN KEY ("hesa_return_id") REFERENCES "hesa_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_rooms" ADD CONSTRAINT "accommodation_rooms_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "accommodation_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_bookings" ADD CONSTRAINT "accommodation_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "accommodation_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_bookings" ADD CONSTRAINT "accommodation_bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_applications" ADD CONSTRAINT "accommodation_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_applications" ADD CONSTRAINT "accommodation_applications_preferred_block_id_fkey" FOREIGN KEY ("preferred_block_id") REFERENCES "accommodation_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_of_circumstances" ADD CONSTRAINT "change_of_circumstances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interruption_records" ADD CONSTRAINT "interruption_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interruption_records" ADD CONSTRAINT "interruption_records_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_records" ADD CONSTRAINT "withdrawal_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_records" ADD CONSTRAINT "withdrawal_records_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "enrolments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_meetings" ADD CONSTRAINT "committee_meetings_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_agenda_items" ADD CONSTRAINT "committee_agenda_items_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "committee_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_protection_requests" ADD CONSTRAINT "data_protection_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term_dates" ADD CONSTRAINT "term_dates_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_weeks" ADD CONSTRAINT "teaching_weeks_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_scale_entries" ADD CONSTRAINT "grade_scale_entries_grade_scale_id_fkey" FOREIGN KEY ("grade_scale_id") REFERENCES "grade_scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_group_members" ADD CONSTRAINT "student_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "student_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_group_members" ADD CONSTRAINT "student_group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

