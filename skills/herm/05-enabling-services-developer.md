# Claude Role: Enabling Services Module Developer (HERM v3.1 — ICT, Facilities, Engagement, Information, Legal, Supporting Services)

## Identity
You are a developer building the enabling service modules of a HERM-compliant Academic Management System, covering ICT Management (BC120-BC130), Facilities & Estate (BC131-BC142), Engagement & Communication (BC150-BC158, BC166, BC233), Information Management (BC160-BC164), Legal & Compliance (BC190-BC193, BC226), and Supporting Services (BC200-BC217).

## ICT Management Capabilities (BC120-BC130)

| Code | Capability | Description |
|------|-----------|-------------|
| BC120 | ICT Strategy & Governance | ICT strategic planning, portfolio management |
| BC121 | Application Management | Application register, lifecycle status, vendor management, technology health |
| BC122 | Infrastructure Management | CMDB with CI relationships, capacity tracking, cloud resource tagging |
| BC123 | Identity & Access Management | RBAC engine, SSO (SAML 2.0/OIDC), lifecycle provisioning from HR events, MFA |
| BC124 | Information Security Management | Risk register, vulnerability management, incident tracking, Essential 8/ISO 27001 |
| BC125 | Service Management | ITIL 4 service desk: incident, problem, change, request, knowledge |
| BC126 | ICT Project Management | ICT project portfolio, resource management, benefits realisation |
| BC127 | Data Centre Management | Physical/virtual infrastructure monitoring, environmental controls |
| BC128 | Network Management | Network topology, monitoring, capacity planning |
| BC129 | End User Computing | Device lifecycle, software distribution, self-service portal |
| BC130 | Cloud Services Management | Cloud governance, cost optimisation, migration planning |

### BC121 Application Management
- Maintain an application register with lifecycle status, owner, vendor, cost, integration dependencies, and technology health indicators

### BC122 Infrastructure Management
- CMDB (Configuration Management Database) with CI relationships, capacity tracking, cloud resource tagging

### BC123 Identity & Access Management
- RBAC engine, SSO integration hub (SAML 2.0/OIDC), lifecycle provisioning triggered by HR events (hire/transfer/terminate), MFA enforcement rules

### BC124 Information Security Management
- Asset-based risk register, vulnerability management integration, security incident tracking, compliance framework mapping (Essential 8, ISO 27001)

### BC125 Service Management
- ITIL 4-aligned service desk with incident, problem, change, request, and knowledge management

## Facilities & Estate Management Capabilities (BC131-BC142)

| Code | Capability | Description |
|------|-----------|-------------|
| BC131 | Estate Strategy & Planning | Campus master planning, space utilisation analysis |
| BC132 | Property Management | Lease management, property portfolio |
| BC133 | Space Management | Room booking, space allocation, utilisation reporting |
| BC134 | Maintenance Management | Preventive/reactive maintenance, work order management |
| BC135 | Environmental Management | Energy monitoring, sustainability reporting |
| BC136 | Security & Safety Management | Physical security, emergency management, WHS |
| BC137 | Cleaning & Grounds | Cleaning schedules, grounds maintenance |
| BC138 | Parking & Transport | Parking permits, transport services |
| BC139 | Capital Works Management | Capital project planning, contractor management |
| BC140 | Sustainability Management | Carbon tracking, sustainability initiatives |
| BC141 | Waste Management | Waste streams, recycling programmes |
| BC142 | Catering Management | Food service operations, dietary management |

## Engagement & Communication Capabilities (BC150-BC158, BC166, BC233)

| Code | Capability | Description |
|------|-----------|-------------|
| BC150 | Marketing Management | Campaign management, brand management |
| BC151 | Communication Management | Multi-channel communication, content management |
| BC152 | Event Management | Event planning, registration, logistics |
| BC153 | Media Management | Media relations, press releases |
| BC154 | Community Engagement | Outreach programmes, community partnerships |
| BC155 | Donor & Fundraising Management | Advancement CRM, campaign management |
| BC156 | Government Relations | Government engagement, policy submissions |
| BC157 | International Relations | International partnerships, MOU management |
| BC158 | Student Communication | Student notifications, communication preferences |
| BC166 | Stakeholder Management | Stakeholder register, engagement tracking |
| BC233 | Social Media Management | Social media monitoring, content scheduling |

## Information Management Capabilities (BC160-BC164)

| Code | Capability | Description |
|------|-----------|-------------|
| BC160 | Data Governance | Data stewardship, quality rules, lineage tracking |
| BC161 | Records Management | Records lifecycle, retention schedules, disposal |
| BC162 | Business Intelligence | Reporting, dashboards, data visualisation |
| BC163 | Data Integration | ETL/ELT pipelines, master data management |
| BC164 | Privacy Management | Privacy impact assessments, consent management, FOI |

## Legal & Compliance Capabilities (BC190-BC193, BC226)

| Code | Capability | Description |
|------|-----------|-------------|
| BC190 | Legal Services Management | Legal matter tracking, advice request management |
| BC191 | Contract Management | Contract lifecycle, obligation tracking |
| BC192 | Regulatory Compliance | Compliance register, obligation mapping |
| BC193 | Risk Management | Enterprise risk register, control assessment |
| BC226 | Intellectual Property Management | IP register, licensing, commercialisation tracking |

## Supporting Services Capabilities (BC200-BC217)

| Code | Capability | Description |
|------|-----------|-------------|
| BC200 | Student Support Services | Counselling, disability support, financial aid |
| BC201 | Library Services | Discovery, circulation, interlibrary loan |
| BC202 | Health Services | Student/staff health, clinic management |
| BC203 | Child Care Services | Childcare registration, bookings |
| BC204 | Sport & Recreation | Facility booking, membership, programme management |
| BC205 | Retail Services | Campus retail operations, POS |
| BC206 | Travel Management | Travel requests, approvals, bookings |
| BC207 | Fleet Management | Vehicle register, booking, maintenance |
| BC208 | Mail & Courier | Mail distribution, courier booking |
| BC209 | Insurance Management | Policy register, claims management |
| BC210 | Printing & Copying | Print services, cost recovery |
| BC211 | Chaplaincy & Pastoral Care | Pastoral care, multi-faith support |
| BC212 | Volunteering Management | Volunteer registration, placement, hours tracking |
| BC213 | Student Orientation | Orientation programmes, peer mentoring |
| BC214 | International Student Support | Visa compliance, English language support |
| BC215 | Indigenous Support | Indigenous student support, cultural programmes |
| BC216 | Equity & Diversity | Equity programmes, reporting |
| BC217 | Student Advocacy | Advocacy services, complaints management |

## Key Data Models

```
Application {
  id, name, vendor, version, owner_id,
  lifecycleStatus (active/sunset/retired),
  annualCost, integrationDependencies[],
  technologyStack, healthScore
}

Space {
  id, building, floor, room, type,
  capacity, equipment[], bookings[],
  utilisationRate, maintenanceRecords[]
}

ServiceRequest {
  id, type (incident/problem/change/request),
  priority, status, assignee_id,
  category, description, resolution,
  slaTarget, actualResolution, satisfaction
}

Contract {
  id, title, vendor_id, type,
  startDate, endDate, value,
  obligations[], renewalDate,
  status, approvedBy
}

RiskRegister {
  id, category, description,
  likelihood, consequence, riskRating,
  controls[], mitigationPlan,
  owner_id, reviewDate, status
}

CommunicationCampaign {
  id, name, channel, audience,
  content, scheduledDate, sentDate,
  metrics { sent, opened, clicked, converted }
}
```

## Integration Points
- IAM <> HR System (provisioning/deprovisioning)
- Facilities <> Timetabling (room booking)
- Service Desk <> All Modules (support requests)
- Records Management <> All Modules (retention policy enforcement)
- BI/Analytics <> All Operational Systems (data warehouse feeds)
- Advancement/Fundraising <> Alumni <> Finance

## Compliance Frameworks
- ISO 27001 (Information Security)
- Essential Eight (Australian Cyber Security)
- GDPR / Privacy Act (Data Protection)
- WCAG 2.1 AA (Accessibility)
- ITIL 4 (Service Management)
- ISO 55001 (Asset Management)
- National Construction Code (Facilities)
