# 🔐 ClientLocker – Secure Client Document Management System

<p align="center">
  <strong>Your Documents. Our Priority.</strong>
</p>

<p align="center">
  A secure, modern client document management portal for accounting firms.
</p>

<p align="center">
  <a href="https://client-locker-liard.vercel.app/"><strong>🌐 Live Website</strong></a>
</p>

---

## 🚀 Live Demo

**Website:** https://client-locker-liard.vercel.app/

## 📌 Project Overview

ClientLocker is a private client document management system developed for **Vaigai Vel & Associates**, an accounting firm in Madurai, Tamil Nadu.

The platform is designed to help accounting firms securely upload, organize, manage, and access confidential client documents through a centralized portal.

It provides role-based access control to ensure users can access only the documents and client information they are authorized to view.

## 🎯 Project Objectives

- Securely manage confidential client documents.
- Organize financial, tax, and business records.
- Provide role-based access control.
- Allow partners to manage staff and client assignments.
- Enable secure document sharing.
- Maintain document activity records.
- Provide controlled auditor access.
- Improve document management efficiency.

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| Partner | Manage clients, staff assignments and document access |
| Staff | Manage documents for assigned clients |
| Client | Access their own authorized documents |
| Auditor | Review documents belonging to assigned clients |

## ✨ Key Features

- Modern public landing page.
- Responsive user interface.
- User authentication.
- Role-based dashboards.
- Client management.
- Secure document upload and management.
- Financial document organization.
- Tax document management.
- Business record management.
- Staff-client assignments.
- Activity logging.
- Secure magic-link client access.
- Temporary document download links.
- AI-powered document checklist suggestions.

*Features are subject to implementation and development progress.*

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS3
- React Router DOM
- Axios
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Deployment and Tools
- GitHub – Version Control
- Vercel – Frontend Hosting
- Visual Studio Code – Development Environment
- Antigravity – AI-Assisted Development

## 📂 Project Structure

```text
clientlocker/
│
├── backend/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── auth/
│   │   │   ├── partner/
│   │   │   ├── staff/
│   │   │   └── auditor/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── docs/
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js
- npm
- Git
- MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/jothi2006ragu/ClientLocker.git
```

### 2. Navigate to Frontend

```bash
cd clientlocker/frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the frontend folder.

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Use the actual backend API URL configured for your environment.

### 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

### 6. Build for Production

```bash
npm run build
```

The production files will be generated in the `dist` directory.

## 🔒 Security Considerations

- Enforce authorization on backend APIs.
- Restrict access to assigned client records.
- Keep confidential documents in private storage.
- Use expiring document access links.
- Protect sensitive environment variables.
- Record important user activities.
- Never commit credentials or `.env` files to GitHub.

## 🎨 UI and Design

ClientLocker uses a modern financial SaaS design approach.

Design highlights:

- Professional blue color identity.
- Modern typography.
- Responsive layouts.
- Animated user interface.
- Interactive document management illustration.
- Clean navigation.
- Professional dashboard-style components.

## 🚀 Deployment

The frontend application is deployed using Vercel.

**Production URL:**

https://client-locker-liard.vercel.app/

## 👨‍💻 Project Information

| Detail | Information |
|---|---|
| Project Name | ClientLocker |
| Client | Vaigai Vel & Associates |
| Industry | Accounting and Document Management |
| Location | Madurai, Tamil Nadu, India |
| Developer | Gowtham |
| Internship | Vizdale Full-Stack Developer Internship |
| Development Period | November 2026 |
| Frontend Hosting | Vercel |

## 📈 Future Enhancements

- Advanced document search.
- Automated document categorization.
- AI-powered document checklist generation.
- Advanced audit reports.
- Enhanced document activity monitoring.
- Additional security improvements.

---

<p align="center">
  <strong>ClientLocker – Your Documents. Our Priority.</strong>
</p>

<p align="center">
  Built with ❤️ for secure and reliable document management.
</p>