# Google Fit Integration Setup Guide

This guide will help you set up Google Fit and Firebase integration for real-time health data tracking.

## 🔧 Prerequisites

1. **Google Cloud Console Account**
2. **Firebase Project** (if not already set up)
3. **Node.js and npm** installed

## 📋 Step 1: Google Cloud Console Setup

### 1.1 Create or Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

### 1.2 Enable Google Fitness API
1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Fitness API"
3. Click on it and press **"Enable"**

### 1.3 Create Credentials

#### OAuth 2.0 Client ID
1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Add your authorized origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Save the **Client ID**

#### API Key
1. Click **"Create Credentials" > "API Key"**
2. Restrict the API key to Google Fitness API
3. Save the **API Key**

## 🔥 Step 2: Firebase Setup

### 2.1 Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project or select existing one
3. **Important**: Use the same Google Cloud project from Step 1

### 2.2 Enable Authentication
1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable **Google** sign-in provider
3. Use the same OAuth 2.0 Client ID from Step 1.3

### 2.3 Enable Firestore
1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Test mode"** for development (configure security rules later)

### 2.4 Get Firebase Configuration
1. Go to **Project Settings > General**
2. In "Your apps" section, click **"Web app"** icon
3. Register your app and copy the configuration object

## ⚙️ Step 3: Environment Configuration

### 3.1 Create Environment File
Copy `.env.example` to `.env` and fill in your credentials:

```env
# Google API Configuration
VITE_GOOGLE_CLIENT_ID=your-google-oauth2-client-id-here
VITE_GOOGLE_API_KEY=your-google-api-key-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefghijk
```

### 3.2 Configure OAuth2 Consent Screen
1. In Google Cloud Console, go to **APIs & Services > OAuth consent screen**
2. Configure the consent screen with your app details
3. Add scopes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/fitness.heart_rate.read`
   - `https://www.googleapis.com/auth/fitness.sleep.read`

## 🚀 Step 4: Testing the Integration

### 4.1 Start the Development Server
```bash
npm run dev
```

### 4.2 Test Device Connection
1. Navigate to the home page or profile page
2. Click **"Connect Devices"**
3. Try connecting Google Fit
4. Check browser console for any errors

### 4.3 Verify Data Flow
1. After successful connection, check Firebase Firestore
2. Look for collections: `users/{userId}/health/`
3. Verify health data is being stored

## 🔍 Troubleshooting

### Common Issues:

**1. "Failed to resolve import" Error**
- Make sure `src/firebase.js` exists
- Check that all imports are correctly configured

**2. OAuth2 Error**
- Verify Client ID is correct in `.env`
- Check authorized origins in Google Cloud Console
- Make sure OAuth consent screen is configured

**3. Firebase Permission Errors**
- Ensure Firestore rules allow authenticated users to read/write
- Check that Authentication is properly enabled

**4. Google Fit API Errors**
- Verify Google Fitness API is enabled in Google Cloud Console
- Check that API key has proper restrictions
- Ensure OAuth2 scopes are correctly configured

### Firestore Security Rules Example:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/health/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📱 Step 5: Production Deployment

### 5.1 Update Environment Variables
- Set production URLs in authorized origins
- Update environment variables for production

### 5.2 Configure Firestore Security Rules
- Replace test mode rules with proper security rules
- Ensure only authenticated users can access their data

### 5.3 Test in Production
- Verify OAuth2 flow works with production URLs
- Test device connections in production environment

## 🎯 Features Available

Once setup is complete, users can:

✅ **Connect Google Fit** - OAuth2 authentication with fitness scopes
✅ **Real-time Health Data** - Steps, calories, heart rate, distance, sleep
✅ **Smartwatch Integration** - Bluetooth device pairing
✅ **Data Persistence** - Firebase Firestore storage
✅ **Live Sync** - Real-time data updates
✅ **Progress Tracking** - Goal-based progress visualization

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Cloud and Firebase projects are linked
4. Check that all required APIs are enabled

For additional help, refer to:
- [Google Fitness API Documentation](https://developers.google.com/fit)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
