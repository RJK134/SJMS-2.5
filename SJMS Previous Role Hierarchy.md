
## Role Hierarchy (27+ roles — Keycloak realm: fhe)

```
super\\\_admin
├── system\\\_admin
├── registrar
│   ├── senior\\\_registry\\\_officer
│   ├── registry\\\_officer
│   ├── admissions\\\_manager
│   │   ├── admissions\\\_officer
│   │   └── admissions\\\_tutor
│   ├── assessment\\\_officer
│   ├── progression\\\_officer
│   └── graduation\\\_officer
├── finance\\\_director
│   ├── finance\\\_manager
│   └── finance\\\_officer
├── quality\\\_director
│   ├── quality\\\_officer
│   └── compliance\\\_officer
├── dean
│   ├── associate\\\_dean
│   ├── head\\\_of\\\_department
│   │   ├── programme\\\_leader
│   │   └── module\\\_leader
│   └── academic\\\_staff
│       ├── lecturer
│       ├── senior\\\_lecturer
│       └── professor
├── student\\\_support\\\_manager
│   ├── student\\\_support\\\_officer
│   ├── personal\\\_tutor
│   ├── disability\\\_advisor
│   └── wellbeing\\\_officer
├── international\\\_officer
├── accommodation\\\_officer
├── student (authenticated — own data only)
├── applicant (authenticated — own application only)
└── public (unauthenticated — prospectus, course search)