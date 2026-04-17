# Automated College Magazine Generator

A full-stack (MERN) web application that automatically generates a structured college magazine using predefined templates. It streamlines the collection of articles, achievements, and department information from students and faculty, organizing them into a visually stunning magazine.

## Features
- **Role-Based Access Control**: Secure logins for Students, Faculty, and Lab Assistants.
- **Article Submissions**: Students can upload articles, achievements, and images.
- **Faculty Review**: Faculty members can review, approve, or reject student submissions.
- **Magazine Builder**: Lab Assistants can select templates, organize content, and preview the magazine.
- **3D Flipbook & PDF Export**: A beautiful 3D flipbook reader and PDF generation capability.
- **Security Focussed**: Adheres to a strict hackathon security checklist (JWT, input validation, XSS protection, helmet).

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)

### Installation

1. **Clone the repository** (if not already done)
2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```
3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```
4. **Environment Variables**
   Ensure the `.env` file in the root directory contains the necessary keys:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/college-magazine
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the Application
**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## Security Implementation
The application implements extensive security configurations:
- `helmet` for HTTP headers.
- `express-rate-limit` for DDoS mitigation.
- `xss-clean` and input sanitization to prevent injection attacks.
- Robust file upload verification (Multer) tracking size and exact MIME types.
- Password hashing (bcrypt) and secure JWT session management.
