<div align="center">
  <h1>✨ Portfolio Management System ✨</h1>
  <p>A full-stack platform for developers and creatives to effortlessly manage and showcase their project portfolios.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Frontend-HTML5%20|%20CSS3%20|%20JS-F16529?style=for-the-badge&logo=html5" alt="Frontend" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20|%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Backend" />
    <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="Database" />
  </p>
</div>

<hr/>

## 🚀 Overview

Welcome to the **Portfolio Management System**! This repository powers a complete end-to-end web application that allows users to create accounts, build their project portfolios, upload files, and maintain their resumes in one centralized, sleek dashboard.

Whether you're presenting to a recruiter or keeping track of your creative works, this system has you covered.

---

## 🔥 Key Features

- **🔐 Secure Authentication:** Robust login and registration to keep your portfolio data safe.
- **👀 Guest Mode:** Need to show around? Guests have limited viewing access.
- **💼 Project Management:** Seamlessly add, update, read, and delete your projects. Track tech stacks and descriptions effortlessly.
- **📁 File Uploads:** Upload relevant project assets and resumes directly into the system.
- **🌙 Dark Mode:** An integrated theme toggle for those who prefer developing and browsing in the dark.
- **🌐 Public Showcases:** Auto-generates shareable portfolio links based on the username.

---

## 🛠️ Technological Stack

| Area | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Responsive + Dark Mode), Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (`mysql2` library) |
| **File Handling** | Multer |
| **Utils** | CORS, Dotenv |

---

## ⚙️ Installation & Setup

Want to run this locally? Follow these steps!

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- A running [MySQL](https://www.mysql.com/) server

### 1. Database Configuration
1. Ensure your local MySQL server is up and running.
2. Navigate to `portfolio-backend` and rename `.env.example` to `.env` (or create a new `.env` file).
3. Fill it with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_super_secret_password
   DB_NAME=portfolio_db
   PORT=3000
   ```
   > 💡 *Note: The server will automatically initialize the database schema and tables upon starting up!*

### 2. Booting the Backend Server
```bash
cd portfolio-backend
npm install
node server.js
```
*You should see a message confirming:* `Database connected. Starting server routes...`

### 3. Firing up the Frontend
Since the frontend relies purely on Vanilla HTML/CSS/JS, you can serve it with any live server.
```bash
cd portfolio-frontend
npx serve .
```
You can now access your app via the `localhost` link provided by your static server.

---

## 📡 API Reference

Looking to integrate or extend? Here is the RESTful API structure:

### Authentication
* `POST /api/register` – Register a new user
* `POST /api/login` – Authenticate session

### Projects
* `GET /api/projects/:userId` – Fetch all projects for a given user
* `POST /api/projects` – Create or update a project (with attached files)
* `DELETE /api/projects/:id` – Remove a project

### Portfolio Showcase
* `GET /api/portfolio/:username` – Retrieve full portfolio data (Projects + Resume)
* `POST /api/resume` – Upload/Update user resume

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
