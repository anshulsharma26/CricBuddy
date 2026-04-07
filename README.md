# CricBuddy (V1) Proof of Concept

CricBuddy is a web application where cricket lovers can connect with nearby players and organize matches.

## Features
- **User Authentication:** Sign up and log in using email and password.
- **User Profile:** Set your role, skill level, and location.
- **Nearby Players Discovery:** Find other players within a 5km radius.
- **Match Management:** Create matches and join matches organized by others.
- **Geolocation:** Uses browser geolocation to find nearby matches and players.

## Tech Stack
- **Frontend:** React, Axios, React Router
- **Backend:** Node.js, Express, Mongoose, JWT
- **Database:** MongoDB (with 2dsphere indexing for geolocation)

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (already provided in this POC) with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cricbuddy
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (already provided in this POC) with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
1. Open your browser to `http://localhost:5173`.
2. Sign up for an account.
3. Go to the **Profile** page and click **Get Current Location** (ensure you allow location access in your browser). Save your profile.
4. Go to the **Dashboard** to see nearby players and matches.
5. Use **Create Match** to organize a new match at your location.
