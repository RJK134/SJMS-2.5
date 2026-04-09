// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  SJMS 2.5 — Database Seed                                              ║
// ║  Realistic UK university data for Future Horizons Education             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────
const rng = (max: number) => Math.floor(Math.random() * max);
const pick = <T>(arr: readonly T[]): T => arr[rng(arr.length)];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const pad = (n: number, w = 4) => String(n).padStart(w, '0');
const money = (min: number, max: number) => +(min + Math.random() * (max - min)).toFixed(2);
const mark = () => +(35 + Math.random() * 65).toFixed(1); // 35-100

// ─── Reference Data ─────────────────────────────────────────────────────────
const MALE_NAMES = [
  'James','Oliver','Harry','George','Charlie','Thomas','Jack','William',
  'Daniel','Samuel','Alexander','Benjamin','Edward','Joseph','Matthew',
  'Henry','Arthur','Oscar','Noah','Ethan','Liam','Aiden','Mohammed',
  'Ravi','Wei','Yusuf','Ibrahim','Kwame','Patrick','Sean',
] as const;

const FEMALE_NAMES = [
  'Emma','Olivia','Sophia','Amelia','Charlotte','Emily','Grace','Freya',
  'Isabella','Mia','Jessica','Lucy','Hannah','Chloe','Lily','Ava',
  'Zoe','Ruby','Eleanor','Alice','Fatima','Priya','Mei','Ayesha',
  'Chidinma','Ngozi','Siobhan','Niamh','Rhiannon','Bethan',
] as const;

const SURNAMES = [
  'Smith','Jones','Williams','Brown','Taylor','Davies','Wilson','Evans',
  'Thomas','Roberts','Johnson','Walker','Wright','Robinson','Thompson',
  'White','Hall','Green','Lewis','Harris','Clark','Jackson','Turner',
  'Scott','Morgan','King','Baker','Price','Bennett','Murray','Campbell',
  'Stewart','Ahmed','Patel','Khan','Singh','Okafor','Mensah','Li','Chen',
] as const;

const UK_CITIES = [
  'London','Manchester','Birmingham','Leeds','Sheffield','Liverpool',
  'Bristol','Newcastle','Nottingham','Leicester','Cardiff','Edinburgh',
  'Glasgow','Brighton','Oxford','Cambridge','York','Bath','Exeter','Durham',
] as const;

const STREETS = [
  'High Street','Station Road','Church Lane','Park Avenue','Mill Road',
  'Victoria Road','Queen Street','Kings Road','Manor Drive','Elm Grove',
] as const;

const POSTCODES = [
  'SE1 7PB','M1 1AE','B1 1BB','LS1 1AZ','S1 1WB','L1 1JD',
  'BS1 1HT','NE1 1EE','NG1 1GN','LE1 1AD','CF10 1EP','EH1 1RE',
  'G1 1AA','BN1 1AE','OX1 1BX','CB2 1TN','YO1 7HH','BA1 1SU',
] as const;

const INTL_COUNTRIES = ['CN','IN','NG','PK','US','MY','HK','SA','AE','KR'] as const;

// ─── Academic Structure Data ────────────────────────────────────────────────
const FACULTIES = [
  { id: 'fac-001', code: 'SCEN', title: 'Science & Engineering' },
  { id: 'fac-002', code: 'BUSL', title: 'Business & Law' },
  { id: 'fac-003', code: 'AHUM', title: 'Arts & Humanities' },
  { id: 'fac-004', code: 'HLSS', title: 'Health & Social Sciences' },
  { id: 'fac-005', code: 'EDUC', title: 'Education' },
  { id: 'fac-006', code: 'COMP', title: 'Computing & Digital' },
] as const;

const SCHOOLS: { id: string; facultyId: string; code: string; title: string }[] = [
  { id: 'sch-001', facultyId: 'fac-001', code: 'PHYS', title: 'Physics & Astronomy' },
  { id: 'sch-002', facultyId: 'fac-001', code: 'CHEM', title: 'Chemistry & Chemical Engineering' },
  { id: 'sch-003', facultyId: 'fac-001', code: 'MATH', title: 'Mathematics & Statistics' },
  { id: 'sch-004', facultyId: 'fac-002', code: 'BUSI', title: 'Business School' },
  { id: 'sch-005', facultyId: 'fac-002', code: 'LAWS', title: 'Law School' },
  { id: 'sch-006', facultyId: 'fac-002', code: 'ECON', title: 'Economics & Finance' },
  { id: 'sch-007', facultyId: 'fac-003', code: 'ENGL', title: 'English & Creative Writing' },
  { id: 'sch-008', facultyId: 'fac-003', code: 'HIST', title: 'History & Archaeology' },
  { id: 'sch-009', facultyId: 'fac-003', code: 'LANG', title: 'Modern Languages' },
  { id: 'sch-010', facultyId: 'fac-004', code: 'NURS', title: 'Nursing & Midwifery' },
  { id: 'sch-011', facultyId: 'fac-004', code: 'PSYC', title: 'Psychology' },
  { id: 'sch-012', facultyId: 'fac-004', code: 'SOCW', title: 'Social Work & Community Studies' },
  { id: 'sch-013', facultyId: 'fac-005', code: 'TEDU', title: 'Teacher Education' },
  { id: 'sch-014', facultyId: 'fac-005', code: 'EDST', title: 'Education Studies' },
  { id: 'sch-015', facultyId: 'fac-005', code: 'CHYS', title: 'Childhood & Youth Studies' },
  { id: 'sch-016', facultyId: 'fac-006', code: 'CSCI', title: 'Computer Science' },
  { id: 'sch-017', facultyId: 'fac-006', code: 'SENG', title: 'Software Engineering' },
  { id: 'sch-018', facultyId: 'fac-006', code: 'DSAI', title: 'Data Science & AI' },
];

const DEPT_NAMES = [
  ['Applied Physics','Astrophysics'],['Organic Chemistry','Chemical Engineering'],
  ['Pure Mathematics','Applied Statistics'],['Management Studies','Marketing & Strategy'],
  ['Commercial Law','Criminal Justice'],['Economics','Finance & Accounting'],
  ['English Literature','Creative Writing'],['Modern History','Archaeology'],
  ['European Languages','Asian Languages'],['Adult Nursing','Midwifery'],
  ['Clinical Psychology','Cognitive Psychology'],['Social Work','Community Studies'],
  ['Primary Education','Secondary Education'],['Education Policy','Learning & Development'],
  ['Early Childhood','Youth & Community'],['Theoretical Computer Science','Systems & Networks'],
  ['Software Design','DevOps & Cloud'],['Machine Learning','Data Engineering'],
];

// Programme definitions: [code, title, ucas, level, credits, duration, deptIndex, modulePrefix]
const PROG_DEFS: [string,string,string|null,string,number,number,number,string][] = [
  ['UG-PH-001','BSc (Hons) Physics','F300','LEVEL_6',360,3,0,'PH'],
  ['UG-AS-001','BSc (Hons) Astrophysics','F510','LEVEL_6',360,3,1,'AS'],
  ['UG-CH-001','BSc (Hons) Chemistry','F100','LEVEL_6',360,3,2,'CH'],
  ['PGT-CE-001','MEng Chemical Engineering',null,'LEVEL_7',180,1,3,'CE'],
  ['UG-MA-001','BSc (Hons) Mathematics','G100','LEVEL_6',360,3,4,'MT'],
  ['PGT-ST-001','MSc Statistics',null,'LEVEL_7',180,1,5,'ST'],
  ['UG-BM-001','BSc (Hons) Business Management','N100','LEVEL_6',360,3,6,'BM'],
  ['PGT-BM-001','MBA Business Administration',null,'LEVEL_7',180,1,7,'MB'],
  ['UG-LW-001','LLB (Hons) Law','M100','LEVEL_6',360,3,8,'LW'],
  ['PGT-LW-001','LLM International Law',null,'LEVEL_7',180,1,9,'IL'],
  ['UG-EC-001','BSc (Hons) Economics','L100','LEVEL_6',360,3,10,'EC'],
  ['PGT-FN-001','MSc Finance',null,'LEVEL_7',180,1,11,'FN'],
  ['UG-EN-001','BA (Hons) English Literature','Q300','LEVEL_6',360,3,12,'EL'],
  ['UG-HI-001','BA (Hons) History','V100','LEVEL_6',360,3,14,'HI'],
  ['UG-ML-001','BA (Hons) Modern Languages','R100','LEVEL_6',360,3,16,'ML'],
  ['UG-NU-001','BSc (Hons) Nursing','B700','LEVEL_6',360,3,18,'NU'],
  ['PGT-NU-001','MSc Advanced Nursing Practice',null,'LEVEL_7',180,1,19,'AN'],
  ['UG-PS-001','BSc (Hons) Psychology','C800','LEVEL_6',360,3,20,'PY'],
  ['PGT-PS-001','MSc Psychology',null,'LEVEL_7',180,1,21,'MP'],
  ['UG-SW-001','BSc (Hons) Social Work','L500','LEVEL_6',360,3,22,'SW'],
  ['UG-TE-001','BA (Hons) Primary Education','X100','LEVEL_6',360,3,24,'PE'],
  ['PGT-ED-001','MA Education',null,'LEVEL_7',180,1,25,'ME'],
  ['UG-ES-001','BA (Hons) Education Studies','X300','LEVEL_6',360,3,26,'ES'],
  ['UG-CY-001','BA (Hons) Childhood Studies','L590','LEVEL_6',360,3,28,'CY'],
  ['UG-CS-001','BSc (Hons) Computer Science','G400','LEVEL_6',360,3,30,'CS'],
  ['PGT-CS-001','MSc Computer Science',null,'LEVEL_7',180,1,31,'MC'],
  ['UG-SE-001','BSc (Hons) Software Engineering','G600','LEVEL_6',360,3,32,'SE'],
  ['PGT-AI-001','MSc Artificial Intelligence',null,'LEVEL_7',180,1,33,'AI'],
  ['UG-DS-001','BSc (Hons) Data Science','G700','LEVEL_6',360,3,34,'DS'],
  ['PGT-DA-001','MSc Data Analytics',null,'LEVEL_7',180,1,35,'DA'],
];

// Module titles per programme (4 per programme)
const MOD_TITLES: string[][] = [
  ['Classical Mechanics','Electromagnetism','Quantum Mechanics','Physics Research Project'],
  ['Stellar Astrophysics','Cosmology','Observational Techniques','Astrophysics Project'],
  ['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Chemistry Research Project'],
  ['Process Engineering','Reaction Engineering','Plant Design','Chemical Engineering Project'],
  ['Calculus & Linear Algebra','Real Analysis','Abstract Algebra','Mathematics Project'],
  ['Statistical Methods','Bayesian Inference','Multivariate Analysis','Statistics Dissertation'],
  ['Principles of Management','Organisational Behaviour','Strategic Management','Business Project'],
  ['Corporate Strategy','Financial Management','Leadership & Change','MBA Dissertation'],
  ['Contract Law','Criminal Law','Public Law','Law Dissertation'],
  ['International Trade Law','Human Rights Law','Comparative Law','LLM Dissertation'],
  ['Microeconomics','Macroeconomics','Econometrics','Economics Dissertation'],
  ['Financial Markets','Investment Analysis','Risk Management','Finance Dissertation'],
  ['Shakespeare & Renaissance','Victorian Literature','Modern Poetry','English Dissertation'],
  ['Medieval History','Early Modern Britain','Contemporary History','History Dissertation'],
  ['French Language','German Language','Translation Studies','Languages Portfolio'],
  ['Fundamentals of Nursing','Clinical Practice','Evidence-Based Care','Nursing Placement'],
  ['Advanced Clinical Assessment','Research Methods in Nursing','Leadership in Healthcare','Nursing Dissertation'],
  ['Introduction to Psychology','Developmental Psychology','Research Methods','Psychology Project'],
  ['Advanced Statistics','Neuropsychology','Clinical Interventions','Psychology Dissertation'],
  ['Social Policy','Safeguarding Practice','Community Development','Social Work Placement'],
  ['Primary Pedagogy','Curriculum Design','Classroom Management','Teaching Placement'],
  ['Educational Research','Inclusive Education','Policy Analysis','Education Dissertation'],
  ['Philosophy of Education','Sociology of Education','Assessment & Feedback','Education Studies Project'],
  ['Child Development','Play & Learning','Youth Justice','Childhood Studies Project'],
  ['Introduction to Programming','Computer Architecture','Data Structures & Algorithms','Final Year Project'],
  ['Advanced Algorithms','Distributed Systems','Machine Learning Foundations','MSc Dissertation'],
  ['Software Development Fundamentals','Requirements Engineering','Software Design Patterns','Software Engineering Project'],
  ['Deep Learning','Natural Language Processing','Computer Vision','AI Dissertation'],
  ['Foundations of Data Science','Database Systems','Data Visualisation','Data Science Project'],
  ['Big Data Technologies','Predictive Modelling','Data Ethics & Governance','Analytics Dissertation'],
];

// Room definitions
const ROOMS = [
  ['LT-001','Main Building','Lecture Theatre',200],['LT-002','Main Building','Lecture Theatre',150],
  ['LT-003','Science Block','Lecture Theatre',120],['SR-001','Main Building','Seminar Room',30],
  ['SR-002','Main Building','Seminar Room',25],['SR-003','Business School','Seminar Room',35],
  ['SR-004','Arts Building','Seminar Room',30],['SR-005','Health Sciences','Seminar Room',25],
  ['LAB-001','Science Block','Lab',40],['LAB-002','Science Block','Lab',30],
  ['LAB-003','Computing Block','Computer Lab',60],['LAB-004','Computing Block','Computer Lab',50],
  ['LAB-005','Nursing Simulation','Lab',20],['SR-006','Education Block','Seminar Room',30],
  ['SR-007','Computing Block','Seminar Room',35],['SR-008','Law Building','Seminar Room',40],
  ['STU-001','Arts Building','Studio',25],['LAB-006','Psychology Wing','Lab',20],
  ['SR-009','Main Building','Seminar Room',30],['SR-010','Main Building','Seminar Room',30],
] as const;

const ROOM_TYPE_MAP: Record<string, string> = {
  'Lecture Theatre': 'LECTURE_THEATRE', 'Seminar Room': 'SEMINAR_ROOM',
  'Lab': 'LAB', 'Computer Lab': 'COMPUTER_LAB', 'Studio': 'STUDIO',
};

// ─── Cleanup ────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log('  Cleaning existing seed data...');
  // Delete in reverse FK dependency order
  // B-02: marks pipeline (child → parent)
  await prisma.markEntry.deleteMany();
  await prisma.assessmentComponent.deleteMany();
  // B-04: HESA entities (child → parent)
  await prisma.hESAStudentModule.deleteMany();
  await prisma.hESAEntryQualification.deleteMany();
  await prisma.hESAStudent.deleteMany();
  await prisma.hESAModule.deleteMany();

  await prisma.attendanceRecord.deleteMany();
  await prisma.engagementIntervention.deleteMany();
  await prisma.engagementScore.deleteMany();
  await prisma.attendanceAlert.deleteMany();
  await prisma.supportInteraction.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.uKVIContactPoint.deleteMany();
  await prisma.uKVIReport.deleteMany();
  await prisma.uKVIRecord.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.moduleResult.deleteMany();
  await prisma.assessmentCriteria.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.teachingEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.chargeLine.deleteMany();
  await prisma.creditNote.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.studentAccount.deleteMany();
  await prisma.moduleRegistration.deleteMany();
  await prisma.enrolmentStatusHistory.deleteMany();
  await prisma.enrolmentTask.deleteMany();
  await prisma.enrolment.deleteMany();
  await prisma.offerCondition.deleteMany();
  await prisma.applicationQualification.deleteMany();
  await prisma.applicationReference.deleteMany();
  await prisma.application.deleteMany();
  await prisma.programmeModule.deleteMany();
  await prisma.studentGroupMember.deleteMany();
  await prisma.teachingGroupMember.deleteMany();
  await prisma.teachingGroup.deleteMany();
  await prisma.student.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.externalExaminer.deleteMany();
  await prisma.examBoardMember.deleteMany();
  await prisma.examBoardDecision.deleteMany();
  await prisma.examBoard.deleteMany();
  await prisma.staffContract.deleteMany();
  await prisma.moduleDelivery.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.personContact.deleteMany();
  await prisma.personAddress.deleteMany();
  await prisma.personIdentifier.deleteMany();
  await prisma.personDemographic.deleteMany();
  await prisma.personNationality.deleteMany();
  await prisma.person.deleteMany();
  await prisma.learningOutcome.deleteMany();
  await prisma.assessmentPattern.deleteMany();
  await prisma.moduleSpecification.deleteMany();
  await prisma.module.deleteMany();
  await prisma.programmeApproval.deleteMany();
  await prisma.programmeSpecification.deleteMany();
  await prisma.programmePathway.deleteMany();
  await prisma.qualificationAim.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.department.deleteMany();
  await prisma.school.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.room.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.teachingWeek.deleteMany();
  await prisma.termDate.deleteMany();
  await prisma.academicYear.deleteMany();
  console.log('  Done.');
}

// ─── Seed Functions ─────────────────────────────────────────────────────────

async function seedAcademicYears() {
  console.log('  Academic years...');
  const years = [
    { id: 'ay-2022', yearCode: '2022/23', startDate: d(2022,9,1), endDate: d(2023,8,31), isCurrent: false },
    { id: 'ay-2023', yearCode: '2023/24', startDate: d(2023,9,1), endDate: d(2024,8,31), isCurrent: false },
    { id: 'ay-2024', yearCode: '2024/25', startDate: d(2024,9,1), endDate: d(2025,8,31), isCurrent: false },
    { id: 'ay-2025', yearCode: '2025/26', startDate: d(2025,9,1), endDate: d(2026,8,31), isCurrent: true,
      enrolmentOpen: d(2025,7,1), enrolmentClose: d(2025,10,31) },
  ];
  await prisma.academicYear.createMany({ data: years });
}

async function seedStructure() {
  console.log('  Faculties, schools, departments...');
  await prisma.faculty.createMany({ data: FACULTIES.map(f => ({ ...f })) });
  await prisma.school.createMany({ data: SCHOOLS });

  // Departments (2 per school)
  const departments: any[] = [];
  for (let si = 0; si < 18; si++) {
    for (let di = 0; di < 2; di++) {
      const idx = si * 2 + di;
      departments.push({
        id: `dep-${pad(idx, 3)}`,
        schoolId: SCHOOLS[si].id,
        code: `DEP${pad(idx, 3)}`,
        title: DEPT_NAMES[si][di],
      });
    }
  }
  await prisma.department.createMany({ data: departments });
  return departments;
}

async function seedProgrammes(departments: any[]) {
  console.log('  Programmes...');
  const programmes = PROG_DEFS.map(([code,title,ucas,level,credits,duration,deptIdx,prefix], i) => ({
    id: `prg-${pad(i + 1, 3)}`,
    departmentId: `dep-${pad(deptIdx, 3)}`,
    programmeCode: code,
    ucasCode: ucas,
    title,
    level: level as any,
    creditTotal: credits,
    duration,
    modeOfStudy: 'FULL_TIME' as const,
    awardingBody: 'Future Horizons Education',
    status: 'APPROVED' as const,
    validFrom: d(2020, 9, 1),
  }));
  await prisma.programme.createMany({ data: programmes });
  return programmes;
}

async function seedModules(departments: any[], programmes: any[]) {
  console.log('  Modules...');
  const modules: any[] = [];
  const progModules: any[] = [];
  let modIdx = 0;

  for (let pi = 0; pi < programmes.length; pi++) {
    const prog = PROG_DEFS[pi];
    const prefix = prog[7];
    const isPGT = prog[3] === 'LEVEL_7';
    const titles = MOD_TITLES[pi];

    for (let mi = 0; mi < 4; mi++) {
      modIdx++;
      const level = isPGT ? 7 : [4, 4, 5, 6][mi];
      const yearOfStudy = isPGT ? 1 : [1, 1, 2, 3][mi];
      const moduleCode = `${prefix}${level}${pad(mi + 1, 3)}`;
      const moduleId = `mod-${pad(modIdx, 3)}`;

      modules.push({
        id: moduleId,
        departmentId: programmes[pi].departmentId,
        moduleCode,
        title: titles[mi],
        credits: isPGT ? 45 : [30, 30, 30, 30][mi],
        level,
        semester: mi % 2 === 0 ? 'Autumn' : 'Spring',
        status: 'APPROVED' as const,
      });

      progModules.push({
        id: `pm-${pad(modIdx, 3)}`,
        programmeId: programmes[pi].id,
        moduleId,
        moduleType: mi < 2 ? ('CORE' as const) : ('OPTIONAL' as const),
        yearOfStudy,
        semester: mi % 2 === 0 ? 'Autumn' : 'Spring',
      });
    }
  }

  await prisma.module.createMany({ data: modules });
  await prisma.programmeModule.createMany({ data: progModules });
  return { modules, progModules };
}

async function seedStaff(departments: any[]) {
  console.log('  Staff (50)...');
  const persons: any[] = [];
  const staffRecords: any[] = [];
  const contracts: any[] = [];

  const roles = [
    'Professor','Senior Lecturer','Lecturer','Associate Lecturer',
    'Research Fellow','Teaching Fellow','Programme Leader','Module Leader',
  ];

  for (let i = 1; i <= 50; i++) {
    const personId = `per-stf-${pad(i)}`;
    const isFemale = i % 3 === 0;
    const firstName = pick(isFemale ? FEMALE_NAMES : MALE_NAMES);
    const lastName = pick(SURNAMES);
    const deptIdx = (i - 1) % departments.length;

    persons.push({
      id: personId,
      title: isFemale ? (i % 6 === 0 ? 'Prof' : 'Dr') : (i % 5 === 0 ? 'Prof' : 'Dr'),
      firstName,
      lastName,
      dateOfBirth: d(1965 + rng(25), 1 + rng(12), 1 + rng(28)),
      gender: isFemale ? 'FEMALE' : 'MALE',
      legalSex: isFemale ? 'FEMALE' : 'MALE',
    });

    staffRecords.push({
      id: `stf-${pad(i)}`,
      personId,
      staffNumber: `FHE-${pad(1000 + i)}`,
      jobTitle: roles[(i - 1) % roles.length],
      departmentId: departments[deptIdx].id,
      contractType: i <= 40 ? 'PERMANENT' : 'FIXED_TERM',
      fte: i <= 45 ? 1.0 : 0.5,
    });

    contracts.push({
      id: `sc-${pad(i)}`,
      staffId: `stf-${pad(i)}`,
      contractType: i <= 40 ? 'PERMANENT' : 'FIXED_TERM',
      startDate: d(2015 + rng(8), 1 + rng(12), 1),
      fte: i <= 45 ? 1.0 : 0.5,
      salary: 35000 + rng(45000),
      jobTitle: roles[(i - 1) % roles.length],
    });
  }

  await prisma.person.createMany({ data: persons });
  await prisma.staff.createMany({ data: staffRecords });
  await prisma.staffContract.createMany({ data: contracts });
  return staffRecords;
}

async function seedStudents(programmes: any[]) {
  console.log('  Students (150)...');
  const persons: any[] = [];
  const students: any[] = [];
  const contacts: any[] = [];
  const addresses: any[] = [];
  const identifiers: any[] = [];
  const demographics: any[] = [];

  const ethnicities = [
    'WHITE_BRITISH','WHITE_BRITISH','WHITE_BRITISH','WHITE_BRITISH',
    'ASIAN_INDIAN','ASIAN_PAKISTANI','ASIAN_CHINESE','BLACK_AFRICAN',
    'BLACK_CARIBBEAN','MIXED_WHITE_ASIAN','ARAB','WHITE_OTHER',
  ] as const;

  for (let i = 1; i <= 150; i++) {
    const personId = `per-stu-${pad(i)}`;
    const isFemale = i % 2 === 0;
    const firstName = pick(isFemale ? FEMALE_NAMES : MALE_NAMES);
    const lastName = pick(SURNAMES);
    const isIntl = i <= 30; // first 30 international
    const entryYear = i <= 70 ? 2022 : i <= 120 ? 2023 : i <= 140 ? 2024 : 2025;

    persons.push({
      id: personId,
      title: isFemale ? 'Ms' : 'Mr',
      firstName,
      lastName,
      dateOfBirth: d(1998 + rng(6), 1 + rng(12), 1 + rng(28)),
      gender: isFemale ? 'FEMALE' : 'MALE',
      legalSex: isFemale ? 'FEMALE' : 'MALE',
    });

    students.push({
      id: `stu-${pad(i)}`,
      personId,
      studentNumber: `STU-2025-${pad(i)}`,
      feeStatus: isIntl ? 'OVERSEAS' : 'HOME',
      entryRoute: isIntl ? 'INTERNATIONAL' : pick(['UCAS', 'UCAS', 'UCAS', 'DIRECT', 'CLEARING'] as const),
      originalEntryDate: d(entryYear, 9, 15),
    });

    contacts.push({
      id: `con-stu-${pad(i)}`,
      personId,
      contactType: 'EMAIL' as const,
      value: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.futurehorizons.ac.uk`,
      isPrimary: true,
      isVerified: true,
      startDate: d(entryYear, 9, 1),
    });

    addresses.push({
      id: `addr-stu-${pad(i)}`,
      personId,
      addressType: 'HOME' as const,
      addressLine1: `${10 + rng(200)} ${pick(STREETS)}`,
      city: pick(UK_CITIES),
      postcode: pick(POSTCODES),
      countryCode: isIntl ? pick(INTL_COUNTRIES) : 'GB',
      startDate: d(entryYear, 9, 1),
      isPrimary: true,
    });

    identifiers.push({
      id: `pid-stu-${pad(i)}`,
      personId,
      identifierType: 'HUSID' as const,
      value: `${1300000000 + i}`,
      issuer: 'HESA',
      issueDate: d(entryYear, 9, 1),
    });

    if (i <= 100) {
      demographics.push({
        id: `dem-stu-${pad(i)}`,
        personId,
        ethnicity: pick(ethnicities),
        religion: pick(['NO_RELIGION','CHRISTIAN','MUSLIM','HINDU','SIKH','NOT_KNOWN'] as const),
        sexualOrientation: pick(['HETEROSEXUAL','HETEROSEXUAL','HETEROSEXUAL','NOT_KNOWN','BISEXUAL'] as const),
        careLeaver: i % 20 === 0,
        parentalEducation: i % 4 !== 0,
        polarQuintile: 1 + rng(5),
        imdQuintile: 1 + rng(5),
      });
    }
  }

  await prisma.person.createMany({ data: persons });
  await prisma.student.createMany({ data: students });
  await prisma.personContact.createMany({ data: contacts });
  await prisma.personAddress.createMany({ data: addresses });
  await prisma.personIdentifier.createMany({ data: identifiers });
  await prisma.personDemographic.createMany({ data: demographics });
  return students;
}

async function seedEnrolments(students: any[], programmes: any[]) {
  console.log('  Enrolments (500+)...');
  const enrolments: any[] = [];
  const statusHistory: any[] = [];
  const academicYears = ['2022/23', '2023/24', '2024/25', '2025/26'];
  let idx = 0;

  for (let si = 0; si < 150; si++) {
    const studentId = students[si].id;
    const progIdx = si % programmes.length;
    const programmeId = programmes[progIdx].id;
    const isPGT = PROG_DEFS[progIdx][3] === 'LEVEL_7';
    const isIntl = si < 30;

    // Determine entry year index (0=2022/23, 1=2023/24, 2=2024/25, 3=2025/26)
    const entryYearIdx = si < 70 ? 0 : si < 120 ? 1 : si < 140 ? 2 : 3;
    const maxYears = isPGT ? Math.min(2, 4 - entryYearIdx) : Math.min(3, 4 - entryYearIdx);

    for (let y = 0; y < maxYears; y++) {
      const ayIdx = entryYearIdx + y;
      if (ayIdx >= 4) break;
      idx++;
      const isCurrent = ayIdx === 3;
      const yearOfStudy = y + 1;

      enrolments.push({
        id: `enr-${pad(idx)}`,
        studentId,
        programmeId,
        academicYear: academicYears[ayIdx],
        yearOfStudy,
        modeOfStudy: 'FULL_TIME' as const,
        startDate: d(2022 + ayIdx, 9, 15),
        expectedEndDate: d(2023 + ayIdx, 6, 30),
        actualEndDate: isCurrent ? null : d(2023 + ayIdx, 6, 30),
        status: isCurrent ? 'ENROLLED' : 'COMPLETED',
        feeStatus: isIntl ? 'OVERSEAS' : 'HOME',
      });

      statusHistory.push({
        id: `esh-${pad(idx)}`,
        enrolmentId: `enr-${pad(idx)}`,
        previousStatus: 'ENROLLED' as const,
        newStatus: isCurrent ? ('ENROLLED' as const) : ('COMPLETED' as const),
        changeDate: isCurrent ? d(2025, 9, 15) : d(2023 + ayIdx, 6, 30),
        reason: isCurrent ? 'Annual re-enrolment' : 'Year completed successfully',
        changedBy: 'system',
      });
    }

    // Additional students have a second programme (transfers, dual awards)
    if (si >= 96 && si < 150) {
      const altProgIdx = (progIdx + 7) % programmes.length;
      const extraYears = si < 130 ? 3 : 2;
      const startAy = 4 - extraYears;
      for (let y = 0; y < extraYears; y++) {
        const ayIdx = startAy + y;
        if (ayIdx >= 4) break;
        idx++;
        const isCurr = ayIdx === 3;
        enrolments.push({
          id: `enr-${pad(idx)}`,
          studentId,
          programmeId: programmes[altProgIdx].id,
          academicYear: academicYears[ayIdx],
          yearOfStudy: y + 1,
          modeOfStudy: 'FULL_TIME' as const,
          startDate: d(2022 + ayIdx, 9, 15),
          expectedEndDate: d(2023 + ayIdx, 6, 30),
          status: isCurr ? 'ENROLLED' : 'COMPLETED',
          feeStatus: isIntl ? 'OVERSEAS' : 'HOME',
        });
      }
    }
  }

  console.log(`    Created ${enrolments.length} enrolments`);
  await prisma.enrolment.createMany({ data: enrolments });
  await prisma.enrolmentStatusHistory.createMany({ data: statusHistory });
  return enrolments;
}

async function seedModuleRegistrations(
  enrolments: any[], programmes: any[],
  progModules: { programmeId: string; moduleId: string; yearOfStudy: number }[]
) {
  console.log('  Module registrations (2000+)...');
  const regs: any[] = [];
  let idx = 0;

  for (const enr of enrolments) {
    // Assign all programme modules to every enrolment (4 per enrolment)
    const assigned = progModules.filter(pm => pm.programmeId === enr.programmeId);

    for (const pm of assigned) {
      idx++;
      const isComplete = enr.status === 'COMPLETED';
      regs.push({
        id: `mreg-${pad(idx)}`,
        enrolmentId: enr.id,
        moduleId: pm.moduleId,
        academicYear: enr.academicYear,
        attempt: 1,
        registrationType: 'CORE' as const,
        status: isComplete ? 'COMPLETED' : 'REGISTERED',
      });
    }
  }

  console.log(`    Created ${regs.length} module registrations`);
  // Insert in batches to avoid memory issues
  const BATCH = 500;
  for (let i = 0; i < regs.length; i += BATCH) {
    await prisma.moduleRegistration.createMany({ data: regs.slice(i, i + BATCH) });
  }
  return regs;
}

async function seedAssessments(modules: any[]) {
  console.log('  Assessments...');
  const assessments: any[] = [];

  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    // Coursework assessment
    assessments.push({
      id: `asmt-${pad(mi * 2 + 1)}`,
      moduleId: mod.id,
      academicYear: '2025/26',
      title: `${mod.title} — Coursework`,
      assessmentType: 'COURSEWORK' as const,
      weighting: 60,
      maxMark: 100,
      passMark: 40,
      dueDate: d(2026, 1, 15),
      submissionMethod: 'ONLINE' as const,
      isAnonymous: true,
      allowLateSubmission: true,
    });
    // Exam assessment
    assessments.push({
      id: `asmt-${pad(mi * 2 + 2)}`,
      moduleId: mod.id,
      academicYear: '2025/26',
      title: `${mod.title} — Examination`,
      assessmentType: 'EXAM' as const,
      weighting: 40,
      maxMark: 100,
      passMark: 40,
      dueDate: d(2026, 5, 20),
      submissionMethod: 'IN_PERSON' as const,
      isAnonymous: true,
      allowLateSubmission: false,
    });
  }

  await prisma.assessment.createMany({ data: assessments });
  return assessments;
}

async function seedAssessmentAttempts(assessments: any[], modRegs: any[]) {
  console.log('  Assessment attempts...');
  const attempts: any[] = [];
  let idx = 0;

  // Only create attempts for completed registrations (to keep volume manageable)
  const completedRegs = modRegs.filter(r => r.status === 'COMPLETED');

  for (const reg of completedRegs) {
    // Find assessments for this module
    const modAssessments = assessments.filter(a => a.moduleId === reg.moduleId);
    for (const asmt of modAssessments) {
      idx++;
      const rawMk = mark();
      attempts.push({
        id: `att-${pad(idx)}`,
        assessmentId: asmt.id,
        moduleRegistrationId: reg.id,
        attemptNumber: 1,
        rawMark: rawMk,
        finalMark: rawMk,
        grade: rawMk >= 70 ? 'A' : rawMk >= 60 ? 'B' : rawMk >= 50 ? 'C' : rawMk >= 40 ? 'D' : 'F',
        status: 'CONFIRMED' as const,
        submittedDate: d(2025, 1, 14),
        markedDate: d(2025, 2, 14),
        markedBy: 'stf-0001',
      });
    }
  }

  console.log(`    Created ${attempts.length} assessment attempts`);
  const BATCH = 500;
  for (let i = 0; i < attempts.length; i += BATCH) {
    await prisma.assessmentAttempt.createMany({ data: attempts.slice(i, i + BATCH) });
  }
}

async function seedFinance(students: any[], enrolments: any[]) {
  console.log('  Financial records...');
  const accounts: any[] = [];
  const charges: any[] = [];
  const invoices: any[] = [];
  const payments: any[] = [];

  // One account per student for current year
  for (let i = 0; i < students.length; i++) {
    const stu = students[i];
    const isIntl = i < 30;
    const tuitionFee = isIntl ? 18500 : 9250;
    const accountId = `acc-${pad(i + 1)}`;
    const invoiceId = `inv-${pad(i + 1)}`;
    const paid = i % 4 === 0 ? 0 : i % 3 === 0 ? tuitionFee / 3 : tuitionFee;

    accounts.push({
      id: accountId,
      studentId: stu.id,
      academicYear: '2025/26',
      balance: tuitionFee - paid,
      creditLimit: 0,
      status: 'active',
    });

    invoices.push({
      id: invoiceId,
      studentAccountId: accountId,
      invoiceNumber: `INV-2025-${pad(i + 1)}`,
      issueDate: d(2025, 9, 1),
      dueDate: d(2025, 11, 30),
      totalAmount: tuitionFee,
      paidAmount: paid,
      status: paid >= tuitionFee ? 'PAID' : paid > 0 ? 'PARTIALLY_PAID' : 'ISSUED',
    });

    charges.push({
      id: `chg-${pad(i + 1)}`,
      studentAccountId: accountId,
      chargeType: 'TUITION' as const,
      description: `Tuition fee ${isIntl ? '(Overseas)' : '(Home)'} 2025/26`,
      amount: tuitionFee,
      currency: 'GBP',
      invoiceId,
      status: paid >= tuitionFee ? 'PAID' : 'INVOICED',
      dueDate: d(2025, 11, 30),
    });

    if (paid > 0) {
      payments.push({
        id: `pay-${pad(i + 1)}`,
        studentAccountId: accountId,
        invoiceId,
        amount: paid,
        paymentMethod: isIntl ? 'BANK_TRANSFER' : (i % 5 === 0 ? 'CARD' : 'SLC'),
        reference: `TXN-${pad(10000 + i + 1)}`,
        transactionDate: d(2025, 10, 1 + rng(28)),
        status: 'COMPLETED' as const,
      });
    }
  }

  await prisma.studentAccount.createMany({ data: accounts });
  await prisma.invoice.createMany({ data: invoices });
  await prisma.chargeLine.createMany({ data: charges });
  await prisma.payment.createMany({ data: payments });
  console.log(`    ${accounts.length} accounts, ${charges.length} charges, ${payments.length} payments`);
}

async function seedRooms() {
  console.log('  Rooms (20)...');
  const rooms = ROOMS.map(([code, building, type, capacity], i) => ({
    id: `room-${pad(i + 1, 3)}`,
    roomCode: code as string,
    building: building as string,
    floor: '0',
    capacity: capacity as number,
    roomType: ROOM_TYPE_MAP[type as string] as any,
    isAccessible: i % 3 === 0,
    status: 'active',
  }));
  await prisma.room.createMany({ data: rooms });
}

async function seedApplicants(programmes: any[]) {
  console.log('  Applicants (25)...');
  const persons: any[] = [];
  const applicants: any[] = [];
  const applications: any[] = [];

  const appStatuses = [
    'SUBMITTED','UNDER_REVIEW','CONDITIONAL_OFFER','UNCONDITIONAL_OFFER',
    'FIRM','DECLINED','WITHDRAWN','REJECTED',
  ] as const;

  for (let i = 1; i <= 25; i++) {
    const personId = `per-app-${pad(i)}`;
    const isFemale = i % 2 !== 0;
    const firstName = pick(isFemale ? FEMALE_NAMES : MALE_NAMES);
    const lastName = pick(SURNAMES);

    persons.push({
      id: personId,
      title: isFemale ? 'Ms' : 'Mr',
      firstName,
      lastName,
      dateOfBirth: d(2005 + rng(3), 1 + rng(12), 1 + rng(28)),
      gender: isFemale ? 'FEMALE' : 'MALE',
      legalSex: isFemale ? 'FEMALE' : 'MALE',
    });

    applicants.push({
      id: `appl-${pad(i)}`,
      personId,
      applicantNumber: `APP-2026-${pad(i)}`,
      applicationRoute: pick(['UCAS', 'UCAS', 'DIRECT', 'INTERNATIONAL'] as const),
    });

    applications.push({
      id: `appn-${pad(i)}`,
      applicantId: `appl-${pad(i)}`,
      programmeId: programmes[i % programmes.length].id,
      academicYear: '2026/27',
      applicationRoute: pick(['UCAS', 'UCAS', 'DIRECT', 'INTERNATIONAL'] as const),
      personalStatement: `I am passionate about pursuing studies at Future Horizons Education. My academic background and extracurricular activities have prepared me well for this programme.`,
      status: appStatuses[i % appStatuses.length] as any,
      decisionDate: i % 3 === 0 ? d(2026, 2, 15) : null,
    });
  }

  await prisma.person.createMany({ data: persons });
  await prisma.applicant.createMany({ data: applicants });
  await prisma.application.createMany({ data: applications });
}

async function seedUKVIRecords(students: any[]) {
  console.log('  UKVI records (international students)...');
  const records: any[] = [];

  // First 30 students are international
  for (let i = 0; i < 30; i++) {
    records.push({
      id: `ukvi-${pad(i + 1)}`,
      studentId: students[i].id,
      tier4Status: 'SPONSORED' as const,
      casNumber: `CAS-${pad(100000 + i + 1, 6)}`,
      casAssignedDate: d(2025, 7, 1),
      casExpiryDate: d(2026, 9, 30),
      visaType: 'Student',
      visaStart: d(2025, 8, 1),
      visaExpiry: d(2027, 1, 31),
      passportNumber: `P${pad(10000000 + i + 1, 8)}`,
      passportExpiry: d(2030, 6, 15),
      brpNumber: i < 20 ? `BRP${pad(1000000 + i + 1, 7)}` : null,
      brpCollected: i < 20,
      sponsorshipStart: d(2025, 9, 15),
      sponsorshipEnd: d(2026, 6, 30),
      workHoursLimit: 20,
      complianceStatus: i < 25 ? 'COMPLIANT' : 'AT_RISK',
    });
  }

  await prisma.uKVIRecord.createMany({ data: records });
}

async function seedSupportTickets(students: any[]) {
  console.log('  Support tickets (20)...');
  const tickets: any[] = [];

  const categories = ['ACADEMIC','FINANCIAL','WELLBEING','ACCOMMODATION','IT','DISABILITY'] as const;
  const priorities = ['LOW','NORMAL','HIGH','URGENT'] as const;
  const subjects = [
    'Module registration query','Fee payment issue','Accommodation concern',
    'Exam timetable clash','Library access problem','Disability support request',
    'Assignment extension request','Bursary application query','IT account locked',
    'Programme transfer enquiry','Attendance query','Mitigating circumstances',
    'Graduation ceremony query','Placement enquiry','Transcript request',
    'Reference letter request','Council tax exemption','Car parking permit',
    'Study space booking','Wi-Fi connectivity issue',
  ];

  for (let i = 0; i < 20; i++) {
    const stuIdx = rng(150);
    tickets.push({
      id: `tkt-${pad(i + 1)}`,
      studentId: students[stuIdx].id,
      category: categories[i % categories.length] as any,
      subject: subjects[i],
      description: `Details regarding: ${subjects[i]}. Student requires assistance with this matter.`,
      priority: priorities[i % priorities.length] as any,
      status: i < 10 ? 'OPEN' : i < 15 ? 'IN_PROGRESS' : 'RESOLVED',
      resolvedDate: i >= 15 ? d(2025, 11, 1 + rng(28)) : null,
    });
  }

  await prisma.supportTicket.createMany({ data: tickets });
}

async function seedAttendance(modRegs: any[], students: any[]) {
  console.log('  Attendance records...');
  const records: any[] = [];
  let idx = 0;

  // Create attendance for current-year registered students (sample)
  const currentRegs = modRegs.filter(r => r.academicYear === '2025/26').slice(0, 200);

  for (const reg of currentRegs) {
    // Find the student for this registration via enrolment
    // We'll use a simple approach: create 3 attendance records per registration
    for (let w = 0; w < 3; w++) {
      idx++;
      records.push({
        id: `att-rec-${pad(idx)}`,
        moduleRegistrationId: reg.id,
        studentId: students[rng(150)].id,
        date: d(2025, 10, 6 + w * 7),
        status: pick(['PRESENT','PRESENT','PRESENT','PRESENT','ABSENT','LATE'] as const),
        method: 'CARD_SWIPE' as const,
        markedDate: d(2025, 10, 6 + w * 7),
      });
    }
  }

  console.log(`    Created ${records.length} attendance records`);
  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    await prisma.attendanceRecord.createMany({ data: records.slice(i, i + BATCH) });
  }
}

// ─── B-02: Assessment Components + Mark Entries ─────────────────────────────
async function seedAssessmentComponents(assessments: any[], modRegs: any[]) {
  console.log('  Assessment components + mark entries...');

  const components: any[] = [];
  for (let i = 0; i < assessments.length; i++) {
    components.push({
      id: `acomp-${pad(i + 1)}`,
      assessmentId: assessments[i].id,
      title: assessments[i].title,
      componentType: assessments[i].assessmentType,
      weighting: 100,
      maxMark: 100,
      passMark: 40,
      sortOrder: 0,
    });
  }
  await prisma.assessmentComponent.createMany({ data: components });

  // Create mark entries for completed registrations (append-only pipeline demo)
  const completedRegs = modRegs.filter((r: any) => r.status === 'COMPLETED');
  const markEntries: any[] = [];
  let idx = 0;
  const stages: Array<'DRAFT' | 'FIRST_MARK' | 'SECOND_MARK' | 'MODERATED' | 'BOARD_APPROVED' | 'RELEASED'> = ['DRAFT', 'FIRST_MARK', 'MODERATED', 'BOARD_APPROVED', 'RELEASED'];

  for (const reg of completedRegs.slice(0, 50)) {
    const regComponents = components.filter((c: any) => {
      const asmt = assessments.find((a: any) => a.id === c.assessmentId);
      return asmt?.moduleId === reg.moduleId;
    });
    for (const comp of regComponents) {
      const rawMk = mark();
      for (const stage of stages) {
        idx++;
        markEntries.push({
          id: `me-${pad(idx)}`,
          assessmentComponentId: comp.id,
          moduleRegistrationId: reg.id,
          attemptNumber: 1,
          stage,
          mark: rawMk,
          grade: rawMk >= 70 ? 'A' : rawMk >= 60 ? 'B' : rawMk >= 50 ? 'C' : rawMk >= 40 ? 'D' : 'F',
          markerId: 'stf-0001',
          markerName: 'Prof. Smith',
          markedAt: d(2025, 2, 1 + stages.indexOf(stage) * 7),
        });
      }
    }
  }

  const BATCH = 500;
  for (let i = 0; i < markEntries.length; i += BATCH) {
    await prisma.markEntry.createMany({ data: markEntries.slice(i, i + BATCH) });
  }
  console.log(`    Created ${components.length} components, ${markEntries.length} mark entries`);
}

// ─── B-04: HESA Data Futures Entities ───────────────────────────────────────
async function seedHESAEntities(students: any[], modules: any[]) {
  console.log('  HESA Data Futures entities...');

  // HESAStudent — one per student
  const hesaStudents: any[] = students.slice(0, 50).map((s: any, i: number) => ({
    id: `hstu-${pad(i + 1)}`,
    studentId: s.id,
    husid: `130${String(i + 1).padStart(10, '0')}`,
    nation: 'GB',
    domicile: 'XF',
    ethnic: i % 5 === 0 ? '21' : i % 3 === 0 ? '50' : '10',
    disable: '00',
  }));
  await prisma.hESAStudent.createMany({ data: hesaStudents });

  // HESAModule — one per module for current year
  const hesaModules: any[] = modules.slice(0, 20).map((m: any, i: number) => ({
    id: `hmod-${pad(i + 1)}`,
    moduleId: m.id,
    academicYear: '2025/26',
    crdtPts: m.credits ?? 15,
    crdtScm: 'CATS',
    fte: 1.0,
  }));
  await prisma.hESAModule.createMany({ data: hesaModules });

  // HESAStudentModule — link first 20 students to first 5 modules
  const hesaStudentModules: any[] = [];
  let smIdx = 0;
  for (let si = 0; si < Math.min(20, hesaStudents.length); si++) {
    for (let mi = 0; mi < Math.min(5, hesaModules.length); mi++) {
      smIdx++;
      hesaStudentModules.push({
        id: `hsm-${pad(smIdx)}`,
        hesaStudentId: hesaStudents[si].id,
        hesaModuleId: hesaModules[mi].id,
        modOut: '1',
        modMark: mark(),
      });
    }
  }
  await prisma.hESAStudentModule.createMany({ data: hesaStudentModules });

  // HESAEntryQualification — A-levels for first 30 students
  const entryQuals: any[] = students.slice(0, 30).map((s: any, i: number) => ({
    id: `heq-${pad(i + 1)}`,
    studentId: s.id,
    qualType: 'GCE A-level',
    qualEnt3: 'P94',
    qualGrade: i % 4 === 0 ? 'A*A*A' : i % 3 === 0 ? 'AAA' : 'AAB',
    qualYear: 2024,
    country: 'XF',
    tariffPoints: i % 4 === 0 ? 168 : i % 3 === 0 ? 144 : 136,
  }));
  await prisma.hESAEntryQualification.createMany({ data: entryQuals });

  console.log(`    Created ${hesaStudents.length} HESA students, ${hesaModules.length} HESA modules, ${hesaStudentModules.length} student-modules, ${entryQuals.length} entry qualifications`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding SJMS 2.5 database...\n');

  await cleanup();

  // Structure
  await seedAcademicYears();
  const departments = await seedStructure();
  const programmes = await seedProgrammes(departments);
  const { modules, progModules } = await seedModules(departments, programmes);
  await seedRooms();

  // People
  const staff = await seedStaff(departments);
  const students = await seedStudents(programmes);
  await seedApplicants(programmes);

  // Academic records
  const enrolments = await seedEnrolments(students, programmes);
  const modRegs = await seedModuleRegistrations(enrolments, programmes, progModules);
  const assessments = await seedAssessments(modules);
  await seedAssessmentAttempts(assessments, modRegs);

  // Finance & compliance
  await seedFinance(students, enrolments);
  await seedUKVIRecords(students);

  // Engagement
  await seedSupportTickets(students);
  await seedAttendance(modRegs, students);

  // B-02: Assessment components + mark entries (7-stage pipeline)
  await seedAssessmentComponents(assessments, modRegs);

  // B-04: HESA Data Futures entities
  await seedHESAEntities(students, modules);

  // Summary
  const counts = await Promise.all([
    prisma.faculty.count(),
    prisma.school.count(),
    prisma.department.count(),
    prisma.programme.count(),
    prisma.module.count(),
    prisma.student.count(),
    prisma.staff.count(),
    prisma.enrolment.count(),
    prisma.moduleRegistration.count(),
    prisma.assessment.count(),
    prisma.assessmentAttempt.count(),
    prisma.studentAccount.count(),
    prisma.uKVIRecord.count(),
    prisma.assessmentComponent.count(),
    prisma.markEntry.count(),
    prisma.hESAStudent.count(),
    prisma.hESAEntryQualification.count(),
  ]);

  console.log('\n✅ Seed complete! Summary:');
  console.log(`  Faculties:             ${counts[0]}`);
  console.log(`  Schools:               ${counts[1]}`);
  console.log(`  Departments:           ${counts[2]}`);
  console.log(`  Programmes:            ${counts[3]}`);
  console.log(`  Modules:               ${counts[4]}`);
  console.log(`  Students:              ${counts[5]}`);
  console.log(`  Staff:                 ${counts[6]}`);
  console.log(`  Enrolments:            ${counts[7]}`);
  console.log(`  Module registrations:  ${counts[8]}`);
  console.log(`  Assessments:           ${counts[9]}`);
  console.log(`  Assessment attempts:   ${counts[10]}`);
  console.log(`  Student accounts:      ${counts[11]}`);
  console.log(`  UKVI records:          ${counts[12]}`);
  console.log(`  Assessment components: ${counts[13]}`);
  console.log(`  Mark entries:          ${counts[14]}`);
  console.log(`  HESA students:         ${counts[15]}`);
  console.log(`  HESA entry quals:      ${counts[16]}`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
