# Organizo

A modern personal finance and task management application built with React.js, Express, Clerk Authentication, and Supabase.

## Features

- 🔐 Secure authentication with Clerk
- 💰 Budget tracking and visualization
- ✅ Task management with priorities
- 📊 Interactive charts and statistics
- 🌓 Dark/Light mode support
- 📱 Responsive design

## Tech Stack

### Frontend
- React.js with Vite
- Chakra UI for styling
- React Router for navigation
- Chart.js for visualizations
- Clerk for authentication
- Supabase Client SDK

### Backend
- Express.js
- Supabase for database
- Node.js

## Prerequisites

- Node.js (v18 or higher)
- npm
- Clerk account for authentication
- Supabase account for database

## Environment Setup

### Client (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
NODE_ENV=development
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/organizo.git
cd organizo
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd ../server
npm install
```

## Development

1. Start the backend server
```bash
cd server
npm run dev
```

2. Start the frontend development server
```bash
cd client
npm run dev
```

## Features Overview

### Budget Buddy
- Track monthly income and expenses
- Categorize transactions
- Visualize spending patterns
- Set and track savings goals

### Task Manager
- Create and manage tasks
- Set priorities and due dates
- Track completion status
- Organize with categories

### Home Dashboard
- View daily tasks
- Track balance trends
- Quick access to key features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.