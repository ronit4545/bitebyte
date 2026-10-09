# BiteByte

> **A modern, full-stack culinary web platform built with React, Node.js/Express, Tailwind CSS, and REST APIs, featuring dedicated Admin and User Dashboards, Recipe Discovery, Serving Calculators, Interactive Reviews & Ratings, System Settings, Recipe Analytics, and Real-Time Activity Monitoring.**

---

## 🌟 Key Features & Requirements Matrix

This project implements all requirements defined in the **BiteByte** specification:

### 1. User Types & Authentication
- **Admin**: Oversees users, approves or rejects recipes, configures system settings, inspects live metrics & activities.
- **User**: Shares personal recipes, discovers dishes with multi-criteria filters, rates and comments on recipes, manages profile and view submission histories.
- **Instant Role Switcher**: A 1-click evaluator switcher in the navigation bar to immediately toggle between **Admin Mode** and **User Mode** without having to re-authenticate manually.

---

### 2. Functionalities for Admin
| Requirement | Input | Output | Implemented Feature |
| :--- | :--- | :--- | :--- |
| **User Management** | User details (name, email, role, password, status) | Confirmation message for successful user creation / update / deletion | Full CRUD table with user creation, role editing, account suspension, and deletion modals. |
| **Recipe Management** | Recipe approval decision (Approve / Reject) + feedback reason | Recipe approval status output (`APPROVED` / `REJECTED`) | Moderation queue with filter tabs (*Pending Approval*, *Approved*, *Rejected*), preview action, and rejection feedback modal. |
| **System Settings** | Configuration settings (Platform Name, Auto-approve toggle, Registration toggle, Max upload size, Maintenance mode, Banners) | Confirmation message for successful settings update | Interactive system configuration panel with immediate persistence and live broadcast. |

#### **Admin Dashboard**:
1. **User Management**: Table listing accounts with search, role filters, modal dialogs for editing and deleting.
2. **Recipe Management**: Table listing recipes with approval and rejection workflows.
3. **System Settings**: Form panel for platform-wide configurations.
4. **Recipe Statistics**: Key KPI cards, visual charts showing monthly submission trends, category distribution breakdown, top-rated recipes leaderboard, and top active contributors.
5. **User Activity Monitoring**: Real-time live update stream (Server-Sent Events) capturing registrations, submissions, reviews, ratings, and settings changes.

---

### 3. Functionalities for User
| Requirement | Input | Output | Implemented Feature |
| :--- | :--- | :--- | :--- |
| **Recipe Sharing** | Recipe details (title, description, cuisine, prep time, cook time, servings, difficulty, ingredients, instructions, photos, tags) | Confirmation message for successful recipe sharing | Modal form with photo gallery presets, dynamic ingredient list, step builder, and dietary tags. |
| **Discover Recipes** | Search & filter criteria (keyword, category, cook time, difficulty, min rating, sort options) | Filtered list of recipe cards | Interactive discovery view with category slider, difficulty filters, and search bar. |
| **Rate and Comment** | Rating (1-5 stars) and comment text | Confirmation message for successful submission | 5-star interactive rating widget, comments list, review management, and deletion options. |
| **Profile Management** | Profile details (name, email, password, bio, specialty, avatar) | Confirmation message for successful profile update | Profile editing form and secure password change form with validation. |

#### **User Dashboard**:
1. **My Recipes**: Table and card listing recipes shared by the user with options to edit or delete, along with status badges (*Pending*, *Approved*, *Rejected*).
2. **Discover Recipes**: Direct navigation and embedded search.
3. **Ratings and Comments**: Section for viewing and managing reviews and ratings made on recipes by the user.
4. **Profile Management**: Profile and security update forms.
5. **Recipe Sharing History**: Detailed chronological submission log with timestamps, view counts, and administrator feedback if rejected.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher) and npm

### 1. Installation
The dependencies are already installed in root and client:
```bash
# In workspace root
npm install
npm install --prefix client
```

### 2. Build the Frontend
```bash
npm run build
```

### 3. Start the Server
```bash
npm start
# or npm run dev
```
The application will be live at:
👉 **`http://localhost:5000`**

*(Optional) To run the Vite development server with Hot Module Replacement (HMR):*
```bash
npm run client
# Available on http://localhost:3000 (proxied to backend on port 5000)
```

### 4. Run Automated Verification Tests
```bash
npm test
```
Runs a 17-test end-to-end verification suite verifying all endpoints, confirmation messages, approval statuses, ratings, user management, and statistics.

---

## 🔑 Demo Accounts & Credentials

| Role | Email | Password | Quick One-Click Switch |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@bitebyte.com` | `admin123` | Click **"Switch to Admin"** button in Navbar |
| **Standard User** | `user@bitebyte.com` | `user123` | Click **"Switch to User"** button in Navbar |
| **Chef Elena** | `elena@bitebyte.com` | `user123` | Sign in via Auth Modal |
| **Chef Marcus** | `marcus@bitebyte.com` | `user123` | Sign in via Auth Modal |

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express 5, JSON database engine with disk synchronization, JWT authentication, Bcrypt password hashing, Server-Sent Events (SSE).
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Architecture**: REST API with role-based middleware (`authenticateToken`, `requireAdmin`).

---

## 📂 Project Directory Structure

```text
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Modals, RecipeCard, etc.
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── views/              # DiscoverView, UserDashboard, AdminDashboard
│   │   ├── App.jsx             # Main Application shell
│   │   └── index.css           # Tailwind base styles
│   └── vite.config.js          # Proxy configuration to port 5000
├── server/                     # Express Backend
│   ├── data/                   # File-based DB (db.json) with seed recipes
│   ├── middleware/             # auth.js (JWT & role guards)
│   ├── routes/
│   │   ├── auth.js             # Login, register, profile update
│   │   ├── users.js            # Admin user CRUD
│   │   ├── recipes.js          # Discovery, sharing, CRUD
│   │   ├── ratings.js          # Rating and commenting
│   │   └── admin.js            # Approval workflow, settings, stats, SSE
│   ├── db.js                   # JSON database engine
│   ├── server.js               # Express application entry point
│   └── test-platform.js        # Automated end-to-end test suite
├── package.json                # Root package configuration
└── README.md                   # Project documentation
```

---

## ▶ Running with the Java (Spring Boot) server in VS Code

1. Install **JDK 17+**, **Maven**, **Node.js 18+**, and the VS Code *Extension Pack for Java*.
2. Open the **project root folder** (the one containing `client` and `server-java`) in VS Code.
3. Press **F5** and choose **BiteByte (Java server)** — this installs and builds the React frontend, then starts the server.
   - Or double-click `start-java.bat` (Windows) / run `./start-java.sh` (Mac/Linux).
   - Or: `npm run java`
4. Open http://localhost:5000

The Java server only serves the website after the React frontend has been built (`client/dist`), which is what the steps above do.
