// SJMS 2.5 — API Response Types

export interface Pagination {
  limit: number;
  total: number;
  hasNext: boolean;
  nextCursor: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface Person {
  id: string;
  title?: string;
  firstName: string;
  middleNames?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  legalSex?: string;
  pronouns?: string;
  contacts?: PersonContact[];
  addresses?: PersonAddress[];
  identifiers?: PersonIdentifier[];
  demographic?: PersonDemographic;
}

export interface PersonContact {
  id: string;
  contactType: string;
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  startDate: string;
  endDate?: string;
}

export interface PersonAddress {
  id: string;
  addressType: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  county?: string;
  postcode?: string;
  countryCode?: string;
  startDate: string;
  endDate?: string;
  isPrimary: boolean;
}

export interface PersonIdentifier {
  id: string;
  identifierType: string;
  value: string;
  issuer?: string;
}

export interface PersonDemographic {
  id: string;
  ethnicity?: string;
  disability?: string;
  religion?: string;
  sexualOrientation?: string;
}

export interface Student {
  id: string;
  personId: string;
  studentNumber: string;
  feeStatus: string;
  entryRoute: string;
  originalEntryDate: string;
  person?: Person;
  enrolments?: Enrolment[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Programme {
  id: string;
  departmentId: string;
  programmeCode: string;
  ucasCode?: string;
  title: string;
  level: string;
  creditTotal: number;
  duration: number;
  modeOfStudy: string;
  awardingBody: string;
  status: string;
  department?: Department;
  programmeModules?: ProgrammeModule[];
  createdAt: string;
}

export interface Module {
  id: string;
  departmentId: string;
  moduleCode: string;
  title: string;
  credits: number;
  level: number;
  semester?: string;
  status: string;
  department?: Department;
  createdAt: string;
}

export interface ProgrammeModule {
  id: string;
  programmeId: string;
  moduleId: string;
  moduleType: string;
  yearOfStudy: number;
  semester?: string;
  module?: Module;
  programme?: Programme;
}

export interface Enrolment {
  id: string;
  studentId: string;
  programmeId: string;
  academicYear: string;
  yearOfStudy: number;
  modeOfStudy: string;
  startDate: string;
  expectedEndDate?: string;
  status: string;
  feeStatus: string;
  student?: Student;
  programme?: Programme;
  moduleRegistrations?: ModuleRegistration[];
  createdAt: string;
}

export interface ModuleRegistration {
  id: string;
  enrolmentId: string;
  moduleId: string;
  academicYear: string;
  attempt: number;
  registrationType: string;
  status: string;
  module?: Module;
}

export interface Faculty {
  id: string;
  code: string;
  title: string;
}

export interface School {
  id: string;
  facultyId: string;
  code: string;
  title: string;
  faculty?: Faculty;
}

export interface Department {
  id: string;
  schoolId: string;
  code: string;
  title: string;
  school?: School;
}
