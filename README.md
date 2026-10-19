# HEdClass

A web application that helps higher education institutions classify undergraduate students at the end of the academic year. It replaces the manual, spreadsheet-based process with automated, consistent application of classification rules, and gives classification officers a place to review, override and approve outcomes before they go to the board of examiners.

Built as an individual project for the MSc Software Development at Queen's University Belfast (CSC7084 Web Development).

## The problem

Each June, an administrator has to classify 200+ final-year students by hand: aggregating marks across years, applying weightings, checking credit totals, and handling resits and mitigating circumstances. Doing this in spreadsheets risks calculation errors, inconsistent rule application and a poor audit trail. HEdClass automates the calculation and keeps a human in the loop for review and overrides.

## Users

| Role | Responsibilities |
| **Institutional Administrator** (Registry / Academic Services) | Manages the pool of classification officers and assigns them to degree programmes |
| **Classification Officer** | Manages cohort data, runs the classification rules, reviews and overrides outcomes, and approves the final cohort |

## Features

- Secure login and logout with persistent sessions and role-based access control
- Institutional Administrator: create and manage classification officers and assign them to degree programmes
- Institutional Administrator: create new degree programmes and enter the classification rules specific to each one
- Classification Officer: dashboard with programme details and cohort summary
- Cohort (student) data management with full create, read, update and delete
- Automated classification that applies the rules for each student's programme and pathway, producing a proposed classification
- Manual review and override of individual student outcomes
- Standalone REST API returning JSON, separate from the web application
- Modular Node/Express structure with separated routes, controllers and data layer

## Classification rules

Classification rules are programme and pathway specific. When a new degree programme is added, its rules are entered at the same time, and each student is then classified using the rules for the programme and pathway they are on. This means different degrees can use different weightings and requirements, rather than one fixed set of rules for the whole institution.

### Example: base rules from the brief

The assignment brief describes a standard set of rules, which is a useful example of what a programme's rules look like:

- 120 credits per year over 3 years (360 credits total), with all credits passed in every year
- Year 1 does not count towards the final classification (a pass is required)
- Classification is based on Year 2 (30%) and Year 3 (70%)
- Resit module marks are capped at 40 for classification
- Candidates with any outstanding fails are not eligible for an Honours classification

```
Level Average = Σ(module mark × module credits) / Σ(credits at that level)
Final Average = (Year 2 Average × 0.30) + (Year 3 Average × 0.70)
```

| Final weighted average | Classification |
| 70% and above | First Class Honours (1st) |
| 60 – 69.99% | Upper Second Class (2:1) |
| 50 – 59.99% | Lower Second Class (2:2) |
| 40 – 49.99% | Third Class Honours |
| Below 40% | Fail |

## Tech stack

- **Server:** Node.js 20.x, Express
- **Views:** EJS, HTML, CSS (client-side JavaScript)
- **Database:** MySQL 8.0+ (MariaDB via MAMP/XAMPP is also compatible)
- **Architecture:** web application (port 3000) and standalone REST API (port 4000)

## Installation

### Prerequisites

- Node.js 20.x and npm
- MAMP or XAMPP (to run MySQL and phpMyAdmin)

### Steps

1. Clone the repository.
2. Install dependencies from the root folder:
   npm install
3. Open `db.js` and make sure the database host, username and password match your local setup.
4. Start MAMP or XAMPP.
5. In phpMyAdmin, create an empty database called `40270840`.
6. Seed the database:
   node 40270840/src/seeder/seeder.js
7. Start the web app: npx nodemon 40270840/src/web/app.js, then open http://localhost:3000
8. In a second terminal, start the API (available at http://localhost:4000)
   npx nodemon 40270840/src/api/api.js

## Test accounts

These demo accounts are created by the seeder, so you can try each role.

| Role | Username | Password |
| Institutional Administrator | `registry_admin` | `QUB2026` |
| Classification Officer | `class_officer1` | `Queens2026` |


## Author

Emma Sloan, MSc Software Development, Queen's University Belfast.
