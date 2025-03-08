Here's a comprehensive list of all the API endpoints we've created so far, along with example response formats:

## 1. University Authentication
**Endpoint:** `POST /api/auth/university`

**Request Body:**
```json
{
  "account": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65eaf01a23b456789c0d12e3",
    "exams": [/* Array of exam objects */],
    "totalExams": 8,
    "totalStudents": 24,
    "students": [/* Array of last 20 students */]
  }
}
```

## 2. Student Authentication
**Endpoint:** `POST /api/auth/student`

**Request Body (New Student):**
```json
{
  "account": "0x123f5A8901c2D3456e789f0A1b2C3d4E5F67890A",
  "uniId": "65eaf01a23b456789c0d12e3"
}
```

**Request Body (Returning Student):**
```json
{
  "account": "0x123f5A8901c2D3456e789f0A1b2C3d4E5F67890A"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uniExams": [/* Last 20 exams by the university */],
    "otherExams": [/* Exams by other universities with private=false */],
    "exams": 8,
    "attendedExams": 3
  }
}
```

## 3. Create Exam
**Endpoint:** `POST /api/exams`

**Request Body:**
```json
{
  "account": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "title": "Introduction to Blockchain Technology",
  "description": "This exam tests fundamental knowledge of blockchain concepts...",
  "duration": 60,
  "skills": ["blockchain-basics", "cryptography", "decentralization"],
  "expectedPoints": 25,
  "questions": [
    {
      "questionText": "What is the primary function of a blockchain?",
      "options": [
        { "id": 1, "text": "Storing large files" },
        { "id": 2, "text": "Secure, decentralized record-keeping" },
        { "id": 3, "text": "Sending emails" },
        { "id": 4, "text": "Creating websites" }
      ],
      "correctAnswer": 2,
      "points": 10
    }
    // More questions...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65eb01a4b678901c2d3e4f56",
    "title": "Introduction to Blockchain Technology",
    "description": "This exam tests fundamental knowledge...",
    "duration": 60,
    "totalQuestions": 3,
    "totalPoints": 35,
    "skills": ["blockchain-basics", "cryptography", "decentralization"],
    "expectedPoints": 25,
    "createdAt": "2025-03-08T12:45:24.123Z"
  }
}
```

## 4. List Exams
**Endpoint:** `GET /api/exams?university=0x123...&public=true&active=true&limit=10&skip=0`

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [/* Array of exam summary objects */],
    "pagination": {
      "total": 42,
      "limit": 10,
      "skip": 0,
      "hasMore": true
    }
  }
}
```

## 5. Fetch Exam
**Endpoint:** `POST /api/exams/{examId}`

**Request Body:**
```json
{
  "account": "0x123f5A8901c2D3456e789f0A1b2C3d4E5F67890A"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "65eb01a4b678901c2d3e4f56",
    "title": "Introduction to Blockchain Technology",
    "description": "This exam tests fundamental knowledge...",
    "duration": 60,
    "questions": [
      {
        "questionText": "What is the primary function of a blockchain?",
        "options": [
          { "id": 1, "text": "Storing large files" },
          { "id": 2, "text": "Secure, decentralized record-keeping" },
          { "id": 3, "text": "Sending emails" },
          { "id": 4, "text": "Creating websites" }
        ],
        "points": 10
      }
      // More questions (without answers)...
    ]
  }
}
```

## 6. Submit Exam
**Endpoint:** `POST /api/exams/{examId}/submit`

**Request Body:**
```json
{
  "account": "0x123f5A8901c2D3456e789f0A1b2C3d4E5F67890A",
  "answers": {
    "65eaf56789b012345c6d78f0": 2,
    "65eaf56789b012345c6d78f1": 2,
    "65eaf56789b012345c6d78f2": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "65eb45f789a012345b6c78d9"
}
```

## 7. Get Exam Results
**Endpoint:** `POST /api/exams/{examId}/results`

**Request Body:**
```json
{
  "account": "0x123f5A8901c2D3456e789f0A1b2C3d4E5F67890A"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qna": [
      {
        "question": "What is the primary function of a blockchain?",
        "options": [
          { "id": 1, "text": "Storing large files" },
          { "id": 2, "text": "Secure, decentralized record-keeping" },
          { "id": 3, "text": "Sending emails" },
          { "id": 4, "text": "Creating websites" }
        ],
        "correct": true,
        "option": 2,
        "actualOption": 2
      }
      // More QnA items...
    ],
    "points": 20,
    "xp": 629,
    "avgPoints": 597
  }
}
```

These endpoints provide a complete backend API for your web3 education platform, covering:
1. Authentication for both universities and students
2. Exam creation and management
3. Taking exams and submitting answers
4. Viewing detailed results with comparative analytics

All endpoints follow consistent response formats, proper error handling, and implement the security measures and business rules you specified.