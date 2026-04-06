# MSRCASC Connect

**AI-Powered Placement & Networking Platform** for M S Ramaiah College of Arts, Science and Commerce.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup

```bash
# Server setup
cd server
npm install
# Edit .env with your MongoDB Atlas URI
npm run dev

# Client setup (new terminal)
cd client
npm install
npm run dev
```

### 2. Configure Environment

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/msrcasc-connect
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
OPENAI_API_KEY=your_key_here  # Optional — mock AI works without it
CLIENT_URL=http://localhost:5173
```

### 3. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

---

## 📦 Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Register/Login with JWT, 4 roles (student, alumni, recruiter, admin) |
| 👤 Profiles | Skills, projects, resume URL, CGPA, department, social links |
| 💼 Job System | Post jobs (recruiter), browse & apply (student), search & filter |
| 💬 Real-time Chat | Socket.io messaging with online indicators & typing status |
| 🤖 AI Resume Analyzer | ATS score, missing skills, improvement suggestions |
| 🎯 Job Recommender | Match jobs based on your skills |
| 🔍 Skill Gap Analysis | Compare your skills vs job requirements with learning resources |

---

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **Realtime**: Socket.io
- **AI**: OpenAI API (mock-ready)

---

## 📁 Project Structure

```
msrcasc-connect/
├── client/           # React frontend
│   └── src/
│       ├── api/      # Axios API layer
│       ├── components/Layout/  # Navbar, AppLayout, ProtectedRoute
│       ├── context/  # AuthContext
│       ├── pages/    # All page components
│       └── utils/    # Socket.io helper
├── server/           # Express backend
│   └── src/
│       ├── config/   # DB connection
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth/role middleware
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       ├── services/     # AI service
│       └── sockets/      # Socket.io handler
└── README.md
```

---

## 🚀 Deployment

### MongoDB Atlas
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist `0.0.0.0/0` in Network Access
5. Copy the connection string to `MONGODB_URI`

### Backend → Render
1. Push `server/` to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Add environment variables from `.env`
6. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. Update `client/src/api/index.js` baseURL to use the env var for production

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Profiles
- `POST /api/profiles` — Create/update profile
- `GET /api/profiles/me` — Get own profile
- `GET /api/profiles/:userId` — Get profile by ID
- `GET /api/profiles` — List all profiles

### Jobs
- `GET /api/jobs` — List jobs (search, type filter)
- `GET /api/jobs/:id` — Get job details
- `POST /api/jobs` — Post job (recruiter/admin)
- `POST /api/jobs/:id/apply` — Apply (student/alumni)
- `GET /api/jobs/:id/applicants` — View applicants (recruiter/admin)

### Messages
- `GET /api/messages/:userId` — Chat history
- `GET /api/messages/conversations/list` — Conversations
- `GET /api/messages/users/list` — Available chat users

### AI
- `POST /api/ai/analyze-resume` — Resume ATS analysis
- `POST /api/ai/recommend-jobs` — Job recommendations
- `POST /api/ai/skill-gap` — Skill gap analysis

---

## 📄 License

MIT
