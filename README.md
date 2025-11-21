# njoy - Event Experience

Welcome to **njoy**, a premium web application for discovering and buying tickets for events near you.

## Features

- **Event Discovery**: Browse events in Barcelona, Bilbao, and more.
- **Premium UI**: Modern, dark-themed design with glassmorphism effects.
- **Location Filtering**: Easily switch between cities to find local events.
- **Mock Data**: Currently running with mock data for demonstration.

## Getting Started
# 🎉 njoy - Event Ticketing Platform

> **Premium event discovery and ticketing platform built with React + Vite**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tu-usuario/web-njoy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Live demo coming soon! 🚀

---

## ✨ Features

### 🎫 Event Management
- Browse events from multiple cities
- Filter by location (Barcelona, Bilbao, and more)
- Filter by category (Music, Art, Tech, Food)
- View detailed event information
- Premium card-based UI with smooth animations

### 🔐 Authentication
- Secure JWT-based authentication
- User registration with validation
- Persistent login sessions
- Automatic token refresh
- User profile display in navbar

### 🎨 Modern UI/UX
- Dark theme with glassmorphism effects
- Fully responsive design
- Smooth animations and transitions
- Loading and error states
- Premium design with Google Fonts and FontAwesome icons

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/tu-usuario/web-njoy.git
cd web-njoy

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run deploy    # Build and deploy to Vercel
```

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS with CSS Variables
- **Icons:** FontAwesome 6
- **Fonts:** Google Fonts (Outfit)
- **Deployment:** Vercel

---

## 📁 Project Structure

```
web-njoy/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.jsx
│   │   ├── EventCard.jsx
│   │   ├── EventDetailModal.jsx
│   │   ├── LoginModal.jsx
│   │   └── RegisterModal.jsx
│   ├── services/            # API and auth services
│   │   ├── api.js
│   │   └── authService.js
│   ├── utils/               # Utility functions
│   │   └── dataMapper.js
│   ├── App.jsx              # Main application
│   └── index.css            # Global styles
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── CORS_SETUP.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
└── README.md
```

---

## 🔌 API Integration

njoy connects to a FastAPI backend. The API must have CORS configured:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

See [CORS_SETUP.md](CORS_SETUP.md) for detailed instructions.

---

## 📚 Documentation

- **[CORS Setup Guide](CORS_SETUP.md)** - Configure backend CORS
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to Vercel
- **[Contributing Guide](CONTRIBUTING.md)** - Contribution guidelines
- **[Project Status](PROJECT_STATUS.md)** - Current status and roadmap
- **[Changelog](CHANGELOG.md)** - Version history

---

## 🌟 Key Features Walkthrough

### Event Discovery
Browse events with beautiful card-based UI, filter by city and category, and view detailed information in a premium modal.

### User Authentication
Secure login and registration system with JWT tokens, automatic session management, and persistent login state.

### Responsive Design
Fully responsive interface that works seamlessly on desktop, tablet, and mobile devices.

---

## 🚧 Roadmap

- [ ] Shopping cart system
- [ ] Payment integration (Stripe/PayPal)
- [ ] User profile management
- [ ] Event organizer dashboard
- [ ] Favorites and bookmarks
- [ ] Social sharing
- [ ] Email notifications
- [ ] Advanced search
- [ ] Reviews and ratings
- [ ] QR code tickets

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Created with ❤️ by [Tu Nombre]

---

## 🙏 Acknowledgments

- React team for the awesome library
- Vite for blazing fast development
- FontAwesome for beautiful icons
- Google Fonts for typography

---

**Built with React + Vite | Designed for Premium Experience**
