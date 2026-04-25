 GrabDocs Automated Test Suite

![Playwright](https://img.shields.io/badge/Playwright-v1.56-blue?logo=playwright)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript)
![Status](https://img.shields.io/badge/Tests-21%20cases-green)

 Project Overview

Automated UI test suite for [GrabDocs.com](https://grabdocs.com) built with **Playwright**.  
Tests cover **3 core features** with **21 total test cases**.

Features Tested

| Feature | Test IDs | # Tests |
|---|---|---|
| File Upload** | FU-001 → FU-007 | 7 |
| Feedback** | FB-001 → FB-007 | 7 |
| Messages** | MSG-001 → MSG-007 | 7 |

Tech Stack

- **Test Framework:** Playwright
- **Language:** JavaScript (Node.js)
- **Browsers:** Chromium, Firefox
- **Reporting:** HTML Report + JSON output
- **CI/CD:** Azure DevOps / GitHub Actions compatible

Setup & Run

Prerequisites
```bash
node -v   # v18+
npm -v    # v9+
```

### Install
```bash
git clone <your-repo-url>
cd grabdocs-test-suite
npm install
npx playwright install
```

### Configure credentials
```bash
export GRABDOCS_EMAIL="your-email@example.com"
export GRABDOCS_PASSWORD="your-password"
```

### Run all tests
```bash
npm test
```

### Run specific feature
```bash
npm run test:file-upload
npm run test:feedback
npm run test:messages
```

### Headed mode (watch tests run)
```bash
npm run test:headed
```

### View HTML report
```bash
npm run test:report
```

Project Structure

```
grabdocs-test-suite/
├── tests/
│   └── grabdocs.test.js     # All 21 test cases
├── reports/                 # Auto-generated reports
├── playwright.config.js     # Browser & reporter config
├── package.json
└── README.md
```

Test Case Summary

### Feature 1 — File Upload
| ID | Test Case | Expected Result |
|---|---|---|
| FU-001 | Navigate to File Upload | Section loads correctly |
| FU-002 | Upload valid PDF | Success confirmation displayed |
| FU-003 | Upload valid DOCX | Success confirmation displayed |
| FU-004 | Upload unsupported file type (.exe) | Error message shown |
| FU-005 | Uploaded file appears in list | File name visible in file list |
| FU-006 | Progress indicator shown during upload | Progress bar or success visible |
| FU-007 | Delete an uploaded file | File removed from list |

Feature 2 — Feedback
| ID | Test Case | Expected Result |
|---|---|---|
| FB-001 | Navigate to Feedback | Feedback page loads |
| FB-002 | Submit valid feedback form | Thank-you/success message |
| FB-003 | Submit empty form | Validation errors appear |
| FB-004 | Subject character limit enforced | Input truncated at limit |
| FB-005 | Form resets after submission | Fields cleared |
| FB-006 | Page load performance | Loads in under 5 seconds |
| FB-007 | Form accessibility (labels) | All inputs have identifiers |

Feature 3 — Messages
| ID | Test Case | Expected Result |
|---|---|---|
| MSG-001 | Navigate to Messages | Messages page loads |
| MSG-002 | Inbox displays message list | List container is visible |
| MSG-003 | Compose & send new message | Sent confirmation shown |
| MSG-004 | Send empty message blocked | Validation error shown |
| MSG-005 | Open and read a message | Message body visible |
| MSG-006 | Mark message as read | Unread indicator removed |
| MSG-007 | Delete a message | Message removed from inbox |

Requirements Document

See `docs/Requirements.docx` for the full test requirements linked to Azure DevOps / JIRA.

Author

- Name: Cyril Ekokwe
- Course: Software Quality Assurance
- Date: April 24 2026
