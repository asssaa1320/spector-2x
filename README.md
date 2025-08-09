# Zeus Coupon Website

A Firebase-integrated coupon website with comprehensive user tracking and admin panel.

## Features

### 🎯 Main Website
- **Multi-language Support**: Auto-detects browser language and supports English, Arabic, Spanish, French, and German
- **User Tracking**: Automatically collects and logs user information including:
  - Geographic location (with permission)
  - Browser language
  - Device platform and type
  - Screen resolution
  - Timezone
  - Visit timestamp
- **Coupon Download**: Automatic file download after clicking "Get Coupon Now"
- **Modern UI/UX**: Beautiful, responsive design with animations and smooth interactions

### 🔐 Admin Panel (`/admin-zues-dev`)
- **Secure Authentication**: Username/password protection
- **Real-time Dashboard**: Live statistics and user visit tracking
- **Data Visualization**: 
  - Total visits counter
  - Download statistics
  - Unique countries tracker
  - Today's visits
- **User Visit Logs**: Detailed table showing all user interactions
- **Auto-refresh**: Dashboard updates every 30 seconds

## Firebase Configuration

The website connects to Firebase with the following services:
- **Firestore Database**: Stores user visits in `user-visits` collection
- **Real-time Updates**: Live data synchronization
- **Geographic Data**: Location tracking with external geocoding service

## Admin Credentials

- **Username**: `admin-zues-oun`
- **Password**: `admin-zues-password`
- **Access URL**: `http://localhost:3000/admin-zues-dev`

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Access the Website**:
   - Main site: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin-zues-dev`

## Database Structure

### user-visits Collection
```javascript
{
  language: "en-US",           // Browser language
  location: "New York, USA",   // Geographic location
  platform: "Win32",          // Operating system
  screenResolution: "1920x1080", // Screen dimensions
  timestamp: Timestamp,        // Visit time
  timezone: "America/New_York", // User timezone
  userAgent: "...",           // Browser details
  coordinates: "40.7128,-74.0060" // GPS coordinates
}
```

### user-downloads Collection
```javascript
{
  action: "coupon_download",   // Action type
  timestamp: Timestamp,        // Download time
  success: true,              // Download status
  // ... includes all user-visits fields
}
```

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins)

## Security Features

- Session-based admin authentication
- Input validation and sanitization
- Secure Firebase configuration
- Protected admin routes
- Error handling and logging

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Lazy loading of Firebase services
- Optimized CSS animations
- Compressed assets
- Efficient database queries
- Real-time data caching

## Deployment

The website is ready for deployment to any hosting service that supports Node.js:
- Heroku
- Vercel
- Netlify
- DigitalOcean
- AWS

## Support

For technical support or questions, please refer to the Firebase documentation and ensure all API keys and configurations are properly set up.
