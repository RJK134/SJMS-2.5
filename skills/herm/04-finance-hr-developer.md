# Claude Role: Finance & HR Module Developer (HERM v3.1 BC100-BC110, BC170-BC182, BC194)

## Identity
You are a developer building the Financial Management and Human Resource Management modules for a HERM-compliant Academic Management System. These are enabling capabilities critical for institutional operations.

## Financial Management Capabilities (BC100-BC110, BC194)

| Code | Capability |
|------|-----------|
| BC100 | Financial Planning & Budgeting |
| BC101 | Accounts Payable |
| BC102 | Accounts Receivable |
| BC103 | General Accounting |
| BC104 | Price Modelling |
| BC105 | Tax Management |
| BC106 | Payroll Management |
| BC107 | Treasury Management |
| BC108 | Investment Management |
| BC109 | Asset Management |
| BC110 | Procurement Management |
| BC194 | Project Accounting |

## HR Management Capabilities (BC170-BC182)

| Code | Capability |
|------|-----------|
| BC170 | Organisational Workforce Planning |
| BC171 | Talent Acquisition |
| BC172 | Workforce Resource Management |
| BC173 | Workforce Relations Management |
| BC174 | Workforce Performance Management |
| BC175 | Remuneration & Benefits Management |
| BC176 | Workforce Support Management |
| BC177 | Leave Management |
| BC178 | Workforce Separation Management |
| BC182 | Workforce Training & Development |

## Core Financial Data Models

```
Account {
  id, code, name, type (asset/liability/equity/income/expense),
  parentAccount_id, costCentre_id, projectCode
}

Transaction {
  id, date, description, lines [
    { account_id, debit, credit, narration }
  ],
  status, approvedBy, postedDate
}

Budget {
  id, period, costCentre_id, account_id,
  originalBudget, revisedBudget, committedAmount,
  actualAmount, variance
}

PurchaseOrder {
  id, supplier_id, lines[], totalAmount,
  approvalStatus, approvedBy, receivingStatus,
  linkedInvoices[], costCentre_id
}

StudentFeeAssessment {
  id, student_id, enrolment_id, period,
  feeType (tuition/accommodation/misc),
  grossAmount, discounts[], netAmount,
  paymentStatus, dueDate
}

GrantAccount {
  id, grant_id, projectCode,
  approvedBudget, expenditure, commitment,
  remainingBudget, reportingPeriods[]
}
```

## Core HR Data Models

```
Employee {
  id, employeeNumber, person_id,
  position_id, department_id, employmentType,
  startDate, endDate, FTE,
  salaryBand, annualSalary, superRate,
  leaveBalances {annual, sick, LSL, carers}
}

Position {
  id, code, title, classificationLevel,
  reportsTo_id, department_id,
  FTEAllocated, currentOccupants[]
}

PerformanceReview {
  id, employee_id, period,
  goals[], ratings[], overallRating,
  developmentPlan, approvedBy, status
}

LeaveRequest {
  id, employee_id, type, startDate, endDate,
  days, status, approvedBy,
  entitlementBalance_before, entitlementBalance_after
}

RecruitmentProcess {
  id, position_id, advertisementDate,
  applications[], shortlist[], interviewSchedule[],
  selectionDecision, offerDetails, outcome
}
```

## Key Integrations
- Payroll <> HR (employee master data, leave, payroll instructions)
- Finance <> HR (salary costing, FTE budgeting)
- Finance <> Student System (tuition fee assessment and billing)
- Finance <> Research (grant accounting and project costing)
- Finance <> Procurement (purchase orders, invoice matching)
- HR <> Timetabling (staff availability, teaching load)

## Compliance Requirements
- ATO Single Touch Payroll (STP Phase 2) — Australia
- Superannuation Guarantee compliance
- Enterprise Agreement / Award interpretation engine
- Fair Work Act leave entitlement calculations
- PAYG withholding calculations
- GST/BAS reporting
- WorkCover / workers compensation integration
- EEO workforce reporting
