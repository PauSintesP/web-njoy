# Changelog

All notable changes to njoy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-11-21

### 🎉 Initial Release

#### Added
- **Authentication System**
  - JWT-based authentication with token refresh
  - Login modal with username/password
  - Registration modal with full user form
  - Persistent session across page refreshes
  - Automatic token refresh on expiration
  - Logout functionality

- **Event Management**
  - Event listing from FastAPI backend
  - Event detail modal with full information
  - Click-to-view event details
  - Event cards with premium design
  - Image display from API

- **Filtering System**
  - Filter by location (Barcelona, Bilbao)
  - Filter by category (All, Music, Art, Tech, Food)
  - Combined filters (location + category)
  - Active filter visual feedback

- **UI/UX**
  - Dark theme with glassmorphism effects
  - Responsive design for mobile/tablet/desktop
  - Smooth animations and transitions
  - Loading states with spinner
  - Error states with user-friendly messages
  - Premium navbar with user state display
  - FontAwesome icons integration
  - Google Fonts (Outfit) integration

- **API Integration**
  - Axios HTTP client with interceptors
  - Automatic token injection in requests
  - Response data mapping (Spanish ↔ English)
  - Error handling with Spanish messages
  - CORS-ready configuration

- **Developer Experience**
  - Vite for fast development
  - ESLint configuration
  - Git repository initialized
  - Vercel deployment configuration
  - Comprehensive documentation

#### Documentation
- README.md with project overview
- CORS_SETUP.md with backend configuration guide
- DEPLOYMENT.md with Vercel deployment instructions
- PROJECT_STATUS.md with current status and next steps
- CONTRIBUTING.md with contribution guidelines
- CHANGELOG.md (this file)

#### Configuration
- vercel.json for deployment settings
- .vercelignore for deployment optimization
- package.json with useful scripts

### 📋 Known Issues
- CORS must be configured on backend before API calls work
- Date formatting assumes Spanish locale

### 🔜 Planned Features
- Shopping cart for multiple tickets
- Payment integration (Stripe/PayPal)
- User profile page
- Event creation (for organizers)
- Favorites/bookmarks
- Social sharing
- Email notifications
- Search functionality
- Advanced filters (price range, date range)
- Reviews and ratings
- QR code tickets

---

## [Unreleased]

### Planned for Next Release

#### Features
- Shopping cart system
- Checkout flow
- Payment integration

#### Improvements
- Performance optimizations
- Accessibility improvements
- SEO enhancements

---

[1.0.0]: https://github.com/tu-usuario/web-njoy/releases/tag/v1.0.0
