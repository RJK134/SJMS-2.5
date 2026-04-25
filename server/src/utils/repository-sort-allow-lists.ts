/**
 * Prisma `orderBy` allow-lists for repository `list` queries, keyed by model.
 * Every field must exist on the corresponding model (schema.prisma) so
 * `safeOrderBy` never forwards an invalid key to Prisma. Include UI `sort`
 * param values used by the client (client/src/pages/**) where those fields exist.
 */
export const ACADEMIC_CALENDAR_SORT = [
  'id',
  'academicYear',
  'eventType',
  'title',
  'startDate',
  'endDate',
  'createdAt',
  'updatedAt',
] as const;

export const ACCOMMODATION_BLOCK_SORT = [
  'id',
  'blockName',
  'status',
  'totalRooms',
  'createdAt',
  'updatedAt',
] as const;

export const ACCOMMODATION_ROOM_SORT = [
  'id',
  'roomNumber',
  'roomType',
  'weeklyRent',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const ACCOMMODATION_BOOKING_SORT = [
  'id',
  'academicYear',
  'startDate',
  'endDate',
  'weeklyRent',
  'totalCost',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const ADMISSIONS_EVENT_SORT = [
  'id',
  'title',
  'eventType',
  'date',
  'venue',
  'registeredCount',
  'createdAt',
  'updatedAt',
] as const;

export const APPLICATION_SORT = [
  'id',
  'academicYear',
  'status',
  'decisionDate',
  'ucasApplicationCode',
  'createdAt',
  'updatedAt',
] as const;

export const APPEAL_SORT = [
  'id',
  'submittedDate',
  'hearingDate',
  'decisionDate',
  'status',
  'appealType',
  'createdAt',
  'updatedAt',
] as const;

export const APPLICATION_QUALIFICATION_SORT = [
  'id',
  'qualificationType',
  'subject',
  'dateAwarded',
  'createdAt',
  'updatedAt',
] as const;

export const APPLICATION_REFERENCE_SORT = [
  'id',
  'refereeName',
  'refereeEmail',
  'receivedDate',
  'createdAt',
  'updatedAt',
] as const;

export const ASSESSMENT_SORT = [
  'id',
  'academicYear',
  'title',
  'assessmentType',
  'weighting',
  'dueDate',
  'maxMark',
  'createdAt',
  'updatedAt',
] as const;

export const ASSESSMENT_ATTEMPT_SORT = [
  'id',
  'attemptNumber',
  'submittedDate',
  'markedDate',
  'status',
  'grade',
  'createdAt',
  'updatedAt',
] as const;

export const ATTENDANCE_RECORD_SORT = [
  'id',
  'date',
  'status',
  'markedDate',
  'createdAt',
  'updatedAt',
] as const;

export const ATTENDANCE_ALERT_SORT = [
  'id',
  'triggerDate',
  'status',
  'currentValue',
  'resolvedDate',
  'createdAt',
  'updatedAt',
] as const;

export const AUDIT_LOG_SORT = [
  'id',
  'timestamp',
  'entityType',
  'action',
  'userId',
  'createdAt',
] as const;

export const AWARD_RECORD_SORT = [
  'id',
  'totalCredits',
  'awardDate',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const CLEARANCE_CHECK_SORT = [
  'id',
  'status',
  'checkType',
  'completedDate',
  'expiryDate',
  'createdAt',
  'updatedAt',
] as const;

export const COMMITTEE_SORT = [
  'id',
  'committeeName',
  'committeeType',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const COMMITTEE_MEETING_SORT = [
  'id',
  'meetingDate',
  'venue',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const COMMUNICATION_LOG_SORT = [
  'id',
  'sentDate',
  'deliveryStatus',
  'readDate',
  'createdAt',
  'updatedAt',
] as const;

export const COMMUNICATION_TEMPLATE_SORT = [
  'id',
  'templateCode',
  'title',
  'category',
  'channel',
  'isActive',
  'createdAt',
  'updatedAt',
] as const;

export const DEPARTMENT_SORT = [
  'id',
  'code',
  'title',
  'createdAt',
  'updatedAt',
] as const;

export const DOCUMENT_SORT = [
  'id',
  'title',
  'documentType',
  'fileSize',
  'verificationStatus',
  'retentionDate',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const EC_CLAIM_SORT = [
  'id',
  'submittedDate',
  'panelDate',
  'status',
  'decision',
  'createdAt',
  'updatedAt',
] as const;

export const ENROLMENT_SORT = [
  'id',
  'academicYear',
  'yearOfStudy',
  'status',
  'startDate',
  'expectedEndDate',
  'feeStatus',
  'createdAt',
  'updatedAt',
] as const;

export const EXAM_BOARD_SORT = [
  'id',
  'title',
  'academicYear',
  'boardType',
  'scheduledDate',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const FACULTY_SORT = ['id', 'code', 'title', 'createdAt', 'updatedAt'] as const;

export const FINANCIAL_TRANSACTION_SORT = [
  'id',
  'transactionRef',
  'postedDate',
  'effectiveDate',
  'debitAmount',
  'creditAmount',
  'runningBalance',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const HESA_NOTIFICATION_SORT = [
  'id',
  'entityType',
  'changeType',
  'status',
  'submittedAt',
  'acknowledgedAt',
  'createdAt',
  'updatedAt',
] as const;

export const INTERVIEW_SORT = [
  'id',
  'interviewDate',
  'outcome',
  'format',
  'createdAt',
  'updatedAt',
] as const;

export const MODULE_SORT = [
  'id',
  'moduleCode',
  'title',
  'credits',
  'level',
  'semester',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const MODULE_REGISTRATION_SORT = [
  'id',
  'academicYear',
  'attempt',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const MODULE_RESULT_SORT = [
  'id',
  'academicYear',
  'aggregateMark',
  'grade',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const NOTIFICATION_SORT = [
  'id',
  'title',
  'category',
  'priority',
  'isRead',
  'readAt',
  'createdAt',
  'updatedAt',
] as const;

export const OFFER_CONDITION_SORT = [
  'id',
  'status',
  'targetGrade',
  'createdAt',
  'updatedAt',
] as const;

export const PERSON_SORT = [
  'id',
  'firstName',
  'lastName',
  'dateOfBirth',
  'createdAt',
  'updatedAt',
] as const;

export const PERSON_DEMOGRAPHIC_SORT = [
  'id',
  'createdAt',
  'updatedAt',
] as const;

export const PERSON_IDENTIFIER_SORT = [
  'id',
  'identifierType',
  'value',
  'issueDate',
  'expiryDate',
  'createdAt',
  'updatedAt',
] as const;

export const PROGRAMME_SORT = [
  'id',
  'programmeCode',
  'ucasCode',
  'title',
  'level',
  'status',
  'validFrom',
  'validTo',
  'createdAt',
  'updatedAt',
] as const;

export const PROGRAMME_MODULE_SORT = [
  'id',
  'moduleType',
  'yearOfStudy',
  'semester',
  'createdAt',
  'updatedAt',
] as const;

export const PROGRAMME_APPROVAL_SORT = [
  'id',
  'stage',
  'status',
  'version',
  'approvedDate',
  'createdAt',
  'updatedAt',
] as const;

export const PROGRESSION_RECORD_SORT = [
  'id',
  'academicYear',
  'yearOfStudy',
  'totalCreditsAttempted',
  'totalCreditsPassed',
  'averageMark',
  'decisionDate',
  'createdAt',
  'updatedAt',
] as const;

export const SCHOOL_SORT = ['id', 'code', 'title', 'createdAt', 'updatedAt'] as const;

export const STATUTORY_RETURN_SORT = [
  'id',
  'academicYear',
  'returnType',
  'status',
  'dueDate',
  'submissionDate',
  'createdAt',
  'updatedAt',
] as const;

export const STUDENT_SORT = [
  'id',
  'studentNumber',
  'feeStatus',
  'entryRoute',
  'originalEntryDate',
  'createdAt',
  'updatedAt',
] as const;

export const STUDENT_ACCOUNT_SORT = [
  'id',
  'academicYear',
  'balance',
  'status',
  'lastTransactionDate',
  'createdAt',
  'updatedAt',
] as const;

export const STUDENT_PROGRAMME_ROUTE_SORT = [
  'id',
  'routeCode',
  'pathwayCode',
  'entryDate',
  'createdAt',
  'updatedAt',
] as const;

export const SUBMISSION_SORT = [
  'id',
  'submittedDate',
  'isLate',
  'turnitinScore',
  'createdAt',
  'updatedAt',
] as const;

export const SUPPORT_TICKET_SORT = [
  'id',
  'category',
  'subject',
  'priority',
  'status',
  'resolvedDate',
  'createdAt',
  'updatedAt',
] as const;

export const SYSTEM_SETTING_SORT = [
  'id',
  'settingKey',
  'category',
  'createdAt',
  'updatedAt',
] as const;

export const TEACHING_EVENT_SORT = [
  'id',
  'academicYear',
  'dayOfWeek',
  'startTime',
  'endTime',
  'eventType',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const TRANSCRIPT_SORT = [
  'id',
  'transcriptType',
  'generatedDate',
  'createdAt',
  'updatedAt',
] as const;

export const UKVI_CONTACT_POINT_SORT = [
  'id',
  'contactDate',
  'contactType',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export const UKVI_RECORD_SORT = [
  'id',
  'complianceStatus',
  'casAssignedDate',
  'casExpiryDate',
  'visaExpiry',
  'tier4Status',
  'createdAt',
  'updatedAt',
] as const;

export const WEBHOOK_SUBSCRIPTION_SORT = [
  'id',
  'isActive',
  'lastTriggeredAt',
  'failureCount',
  'url',
  'createdAt',
  'updatedAt',
] as const;
