# 🏏 CricBuddy - Next-Gen Cricket Networking & Scoring Platform

**CricBuddy** is a comprehensive full-stack web application designed to bridge the gap between amateur cricket enthusiasts and organized play. It empowers players to discover nearby talent, organize matches with professional-grade scoring, and leverage AI for personalized cricket insights.

---

## 🚀 Key Features

### 🤖 CricBuddy AI Assistant
- **Gemini-Powered Chat:** Integrated AI chatbot providing instant answers to cricket rules, technique tips, and historical stats.
- **Dynamic Interaction:** Feature-rich chat interface with typewriter effects and context-aware responses.

### 📊 Professional Match & Scorecard Management
- **In-Depth Scoring:** Track every run, ball, wicket, and maiden with a professional-grade scorecard system.
- **Team Organization:** Create matches with custom team names, sizes, and venues.
- **Join Logic:** Real-time team selection and slot management for organized match participation.

### 📍 Geolocation-Driven Discovery
- **Nearby Players:** Discover and connect with other cricket lovers within a specific radius using MongoDB `2dsphere` indexing.
- **Match Locator:** Find active or upcoming matches in your immediate vicinity.
- **Live Location Tracking:** One-click location updates to keep your discovery feed relevant.

### 👤 Player Profiles & Career Stats
- **Career Dashboard:** Real-time visualization of total matches played, runs scored, and wickets taken.
- **Customizable Identity:** Set your primary role (Batsman, Bowler, All-rounder) and skill level.
- **Media Integration:** Profile picture uploads and management for a personalized experience.

### 🔐 Security & Reliability
- **OTP Verification:** Robust signup flow featuring email-based One-Time Password verification via Nodemailer.
- **Automated Communication:** Personalized welcome emails and transactional notifications.
- **Offline Resilience:** Custom-built offline fallback interface ensuring a seamless experience during connectivity issues.
- **Dark Mode:** Fully responsive, modern UI with native Dark Mode support.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Custom UI Components)
- **State Management:** React Context API
- **Routing:** React Router v6
- **Real-time UI:** Framer Motion (Animations), Lucide Icons

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **AI Integration:** Google Gemini AI API
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt.js
- **Communications:** Nodemailer (SMTP Integration)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- Gemini AI API Key
- SMTP Server (e.g., Gmail App Password)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/CricBuddy.git
cd CricBuddy
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Application
**Backend:** `cd server && npm run dev`  
**Frontend:** `cd client && npm run dev`

---

## 🛡️ Architecture & Design Patterns
- **Surgical Code Updates:** Optimized for performance and readability.
- **RESTful API Design:** Clean separation of concerns between authentication, match logic, and user profiles.
- **Responsive Design:** Mobile-first approach ensuring the app looks great on the field or at home.

---

## 📈 Future Roadmap
- [ ] Real-time match commentary using WebSockets.
- [ ] Tournament brackets and league management.
- [ ] Video highlights integration.
- [ ] Push notifications for match invites.

---

*Developed with ❤️ for the Cricket Community.*
