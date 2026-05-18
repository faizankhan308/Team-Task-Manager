# TaskManager

A full-stack task and project management web application built with the MERN stack. Teams can manage projects, assign tasks, track progress, and collaborate with role-based access control.


---

## Features

- **Authentication** — Register and login with JWT-based auth. Supports Admin and Member roles.
- **Projects** — Admins can create, delete, and manage projects. Members can view projects they belong to.
- **Tasks** — Create tasks with title, description, priority, due date, and assignee. Track status across To Do, In Progress, Review, and Done.
- **Team Management** — Admins can view all team members, change roles, and remove users.
- **Dashboard** — Overview of total projects, tasks, tasks due today, and overdue tasks.
- **Profile** — View your profile and delete your account.
- **Dark / Light Mode** — Toggle between themes, preference saved in localStorage.
- **Responsive** — Works on desktop, tablet, and mobile with a slide-in sidebar on small screens.
- **Filters** — Filter tasks by project, status, priority, and assignee.

---

## Tech Stack

**Frontend**
- React 19
- React Router v7
- Axios
- Lucide React (icons)
- Vite

**Backend**
- Node.js
- Express 4
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- express-validator

**Database**
- MongoDB Atlas (cloud)

---

## Project Structure

```
team-task-manager/
├── client/                 # React frontend
│   └── src/
│       ├── api/            # Axios instance
│       ├── components/     # Layout, Button, Input
│       ├── context/        # Theme context
│       └── pages/          # Dashboard, Projects, Tasks, Team, Profile, Auth
└── server/                 # Express backend
    ├── config/             # MongoDB connection
    ├── controllers/        # Business logic
    ├── middleware/         # Auth + role middleware
    ├── models/             # Mongoose schemas
    └── routes/             # API routes
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/faizankhan308/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Set up the client

```bash
cd client
npm install
```

### 4. Run the app

Open two terminals:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
```

Open your browser at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Required |
| GET | `/api/projects` | Get all projects | Required |
| POST | `/api/projects` | Create a project | Admin |
| PATCH | `/api/projects/:id` | Update a project | Owner/Admin |
| DELETE | `/api/projects/:id` | Delete a project | Owner/Admin |
| POST | `/api/projects/:id/members` | Add member | Owner/Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Owner/Admin |
| GET | `/api/tasks` | Get all tasks | Required |
| POST | `/api/tasks` | Create a task | Required |
| PATCH | `/api/tasks/:id` | Update a task | Assignee/Admin |
| DELETE | `/api/tasks/:id` | Delete a task | Admin |
| GET | `/api/users` | Get all users | Required |
| PATCH | `/api/users/:id/role` | Change user role | Admin |
| DELETE | `/api/users/:id` | Delete user | Self/Admin |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |

---




