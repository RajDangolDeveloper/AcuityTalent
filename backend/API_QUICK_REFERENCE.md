# 🚀 Complete API Quick Reference

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📄 RESUME ENDPOINTS

### Create Resume

```http
POST /resumes
Content-Type: application/json

{
  "fileName": "john_doe_resume.pdf",
  "filePath": "s3://bucket/resume.pdf",
  "fileType": "PDF",
  "fileSize": 102400,
  "textContent": "optional extracted text"
}

Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "candidateId": 5,
    "fileName": "john_doe_resume.pdf",
    "filePath": "s3://bucket/resume.pdf",
    "fileType": "PDF",
    "fileSize": 102400,
    "uploadedAt": "2024-01-23T10:30:00Z",
    "createdAt": "2024-01-23T10:30:00Z"
  }
}
```

### List Resumes

```http
GET /resumes

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "fileName": "john_doe_resume.pdf",
      "filePath": "s3://...",
      "fileType": "PDF",
      "fileSize": 102400,
      "uploadedAt": "2024-01-23T10:30:00Z"
    }
  ],
  "count": 1
}
```

### View Resume

```http
GET /resumes/1

Response: 200 OK
{
  "statusCode": 200,
  "data": { ...resume details }
}
```

### Download Resume

```http
GET /resumes/1/download

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "filePath": "s3://bucket/resume.pdf",
    "fileName": "john_doe_resume.pdf",
    "fileType": "PDF"
  }
}
```

### Update Resume

```http
PATCH /resumes/1
Content-Type: application/json

{
  "fileName": "new_name.pdf",
  "textContent": "updated text"
}

Response: 200 OK
```

### Delete Resume

```http
DELETE /resumes/1

Response: 204 No Content
```

---

## 💼 JOB ENDPOINTS

### Create Job

```http
POST /jobs
Content-Type: application/json

{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requirements": "5+ years experience, React, Node.js...",
  "employmentType": "FULL_TIME",
  "experienceLevel": "SENIOR",
  "salaryRange": "$100k-$130k",
  "location": "New York",
  "remoteAvailable": true
}

Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "title": "Senior React Developer",
    "status": "DRAFT",
    "recruiterName": "John Smith",
    "companyName": "Tech Corp",
    "createdAt": "2024-01-23T10:30:00Z"
  }
}
```

### Search Active Jobs

```http
GET /jobs?search=developer&location=New%20York&employmentType=FULL_TIME&page=1&limit=10&sortBy=recent

Query Parameters:
- search: string (search in title/description)
- location: string
- employmentType: FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP|TEMPORARY|FREELANCE
- experienceLevel: ENTRY|MID|SENIOR|EXECUTIVE
- remoteAvailable: boolean
- page: number (default: 1)
- limit: number (default: 10, max: 50)
- sortBy: recent|views|salary

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "Senior React Developer",
      "location": "New York",
      "salaryRange": "$100k-$130k",
      "status": "ACTIVE",
      "viewsCount": 125,
      "companyName": "Tech Corp"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

### Get Recruiter's Jobs

```http
GET /jobs/recruiter/my-jobs?status=ACTIVE&page=1&limit=10

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "title": "Senior Developer",
      "status": "ACTIVE",
      "applicationCount": 23,
      "viewsCount": 150,
      "createdAt": "2024-01-23T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Job Details

```http
GET /jobs/1

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "title": "Senior React Developer",
    "description": "...",
    "requirements": "...",
    "location": "New York",
    "salaryRange": "$100k-$130k",
    "viewsCount": 151,
    "companyName": "Tech Corp",
    "recruiterName": "John Smith"
  }
}
```

### Update Job

```http
PATCH /jobs/1
Content-Type: application/json

{
  "status": "ACTIVE",
  "salaryRange": "$110k-$140k"
}

Response: 200 OK
```

### Delete Job

```http
DELETE /jobs/1

Response: 204 No Content
```

### Get Job Statistics

```http
GET /jobs/1/stats

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "viewsCount": 150,
    "totalApplications": 23,
    "applicationsByStatus": [
      { "status": "APPLIED", "_count": 10 },
      { "status": "SHORTLISTED", "_count": 5 },
      { "status": "INTERVIEWING", "_count": 3 },
      { "status": "OFFER_EXTENDED", "_count": 2 },
      { "status": "REJECTED", "_count": 3 }
    ],
    "postedDate": "2024-01-20T10:00:00Z"
  }
}
```

---

## 📋 APPLICATION ENDPOINTS

### Submit Application

```http
POST /applications
Content-Type: application/json

{
  "jobId": 1,
  "resumeId": 1,
  "coverLetter": "I am very interested in this role..."
}

Response: 201 Created
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "candidateId": 5,
    "jobId": 1,
    "resumeId": 1,
    "status": "APPLIED",
    "appliedAt": "2024-01-23T10:30:00Z",
    "candidateName": "John Doe",
    "jobTitle": "Senior Developer",
    "companyName": "Tech Corp"
  }
}
```

### Get Candidate's Applications

```http
GET /applications/candidate/all?status=APPLIED&page=1&limit=10

Query Parameters:
- status: APPLIED|REVIEWED|SHORTLISTED|INTERVIEWING|REJECTED|OFFER_EXTENDED|ACCEPTED|WITHDRAWN
- jobId: number
- page: number
- limit: number

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "jobTitle": "Senior Developer",
      "companyName": "Tech Corp",
      "status": "APPLIED",
      "appliedAt": "2024-01-23T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Recruiter's Applications

```http
GET /applications/recruiter/all?status=APPLIED&jobId=1&page=1&limit=10

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "candidateName": "John Doe",
      "candidateEmail": "john@example.com",
      "jobTitle": "Senior Developer",
      "status": "APPLIED",
      "appliedAt": "2024-01-23T10:30:00Z",
      "resumeFileName": "john_resume.pdf"
    }
  ],
  "pagination": { ... }
}
```

### Get Job Candidates

```http
GET /applications/job/1/candidates?page=1&limit=10

Response: 200 OK
{
  "statusCode": 200,
  "data": [
    {
      "id": 1,
      "candidateName": "John Doe",
      "status": "APPLIED",
      "matchScore": 85.5
    }
  ],
  "pagination": { ... }
}
```

### View Application

```http
GET /applications/1

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "jobTitle": "Senior Developer",
    "companyName": "Tech Corp",
    "status": "APPLIED",
    "coverLetter": "...",
    "appliedAt": "2024-01-23T10:30:00Z"
  }
}
```

### Get Dashboard Statistics

```http
GET /applications/stats/dashboard

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "APPLIED": 25,
    "REVIEWED": 10,
    "SHORTLISTED": 8,
    "INTERVIEWING": 3,
    "OFFER_EXTENDED": 2,
    "ACCEPTED": 1,
    "REJECTED": 8,
    "WITHDRAWN": 2
  }
}
```

### Shortlist Application

```http
PATCH /applications/1/shortlist

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "SHORTLISTED",
    "updatedAt": "2024-01-24T14:00:00Z"
  }
}
```

### Move to Interview

```http
PATCH /applications/1/interview

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "INTERVIEWING"
  }
}
```

### Extend Offer

```http
PATCH /applications/1/accept

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "OFFER_EXTENDED"
  }
}
```

### Reject Application

```http
PATCH /applications/1/reject

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "REJECTED"
  }
}
```

### Accept Offer (Candidate)

```http
PATCH /applications/1/accept-offer

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "ACCEPTED"
  }
}
```

### Withdraw Application (Candidate)

```http
PATCH /applications/1/withdraw

Response: 200 OK
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "status": "WITHDRAWN"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Resume file size exceeds 5MB limit",
  "error": "Bad Request"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Only recruiters can create jobs",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Job not found",
  "error": "Not Found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "You have already applied for this job",
  "error": "Conflict"
}
```

---

## 🔐 Authorization Examples

### As Candidate

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Payload includes:
# {
#   "id": 5,
#   "email": "john@example.com",
#   "role": "CANDIDATE"
# }
```

### As Recruiter

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Payload includes:
# {
#   "id": 2,
#   "email": "recruiter@techcorp.com",
#   "role": "RECRUITER"
# }
```

---

## 📞 Common Workflows

### Candidate Application Flow

```
1. GET /resumes                    → List existing resumes
2. GET /jobs?search=...            → Search jobs
3. GET /jobs/:id                   → View job details
4. POST /applications              → Submit application
5. GET /applications/candidate/all → Track status
6. PATCH /applications/:id/...     → Accept/withdraw
```

### Recruiter Workflow

```
1. POST /jobs                         → Create job
2. PATCH /jobs/:id                    → Publish (set ACTIVE)
3. GET /applications/recruiter/all    → View applications
4. GET /applications/job/:id/candidates → View candidates
5. PATCH /applications/:id/shortlist  → Shortlist
6. PATCH /applications/:id/accept     → Extend offer
7. PATCH /applications/:id/reject     → Reject
8. GET /applications/stats/dashboard  → View stats
```

---

## ✅ Response Format

All responses follow this format:

```json
{
  "statusCode": 200,
  "data": { ... },
  "pagination": { "total": 42, "page": 1, "limit": 10 } // optional
}
```

---

**Ready to integrate with your frontend!** 🎉
