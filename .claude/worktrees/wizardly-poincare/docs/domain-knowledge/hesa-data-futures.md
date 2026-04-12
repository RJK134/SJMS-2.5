# HESA Data Futures

Continuous data collection replacing the old aggregate HESA return. Universities submit student-level data throughout the year.

Key Entities:
- Student: one per person per institution (HUSID, UKPRN, entry qualifications)
- StudentCourseSession: one per student per academic year (course, mode, FTE, fees, funding)
- Module: delivery instance (credits, level, FTE, assessment)
- StudentModule: enrolment outcome (result, credits achieved)
- EntryQualification: prior qualifications on entry

Key Coded Fields: ETHNIC, DISABLE, DOMICILE, NATION, RELIGION, SEXORT, SOCCLASS, TTACCOM, FUNDCODE, MSTUFEE, FEEELIG, RSNEND, MODE, TYPEYR, QUALENT3

SJMS Implementation:
- HESACodeTable: field to code to description to validFrom/validTo
- HESASnapshot: immutable (DB trigger prevents UPDATE/DELETE)
- HESAReturn: preparation to validation to submission to accepted
- HESAFieldMapping: configurable mapping to Data Futures schema
