# Firebase Setup Guide for Discord Clone

This guide will walk you through setting up Firebase for your Discord clone application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project
3. Give your project a name (e.g., "Discord Clone")
4. Enable Google Analytics if you want (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. From the Firebase project dashboard, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "Discord Clone Web")
3. Check the box for "Also set up Firebase Hosting" if you plan to deploy your app (optional)
4. Click "Register app"
5. You'll see your Firebase configuration - keep this page open as you'll need these details

## Step 3: Enable Authentication

1. In the Firebase console, go to "Authentication" from the left sidebar
2. Click "Get started"
3. Enable the "Email/Password" sign-in method by clicking on it and toggling the switch
4. Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database" from the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change this later)
4. Select a location for your database that's closest to your users
5. Click "Enable"

## Step 5: Set Up Realtime Database

1. In the Firebase console, go to "Realtime Database" from the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change this later)
4. Select a location for your database that's closest to your users
5. Click "Enable"

## Step 6: Set Up Storage

1. In the Firebase console, go to "Storage" from the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" for development (you can change this later)
4. Click "Next" and then "Done"

## Step 7: Update Your Firebase Configuration

1. Open the file `src/lib/firebase.js` in your project
2. Replace the placeholder values in the `firebaseConfig` object with your own Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};
```

You can find these values in the Firebase console:
- Go to Project settings (gear icon in the top left)
- Scroll down to "Your apps" section
- Under the "Firebase SDK snippet" section, select "Config"
- Copy the configuration values

## Step 8: Set Up Firestore Security Rules

1. In the Firebase console, go to "Firestore Database" from the left sidebar
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all documents
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Allow users to read and write their own documents
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Servers collection rules
    match /servers/{serverId} {
      // Allow server creation by authenticated users
      allow create: if request.auth != null;
      
      // Allow server updates by the server owner
      allow update: if request.auth != null && 
                     resource.data.ownerId == request.auth.uid;
    }
    
    // Messages collection rules
    match /messages/{messageId} {
      // Allow authenticated users to create messages
      allow create: if request.auth != null;
      
      // Allow message authors to update or delete their own messages
      allow update, delete: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Click "Publish"

## Step 9: Set Up Storage Security Rules

1. In the Firebase console, go to "Storage" from the left sidebar
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read all files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow users to upload their own avatars
    match /avatars/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload message files
    match /message_files/{userId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish"

## Step 10: Run Your Application

1. Run the `apply-firebase.bat` script to apply the Firebase modifications to your project
2. Start your application with `npm run dev`
3. Your Discord clone should now be connected to Firebase!

## Additional Firebase Features to Consider

- **Firebase Cloud Functions**: For server-side operations like sending notifications
- **Firebase Cloud Messaging**: For push notifications
- **Firebase Analytics**: To track user behavior and app performance
- **Firebase Performance Monitoring**: To monitor app performance
- **Firebase Crashlytics**: To track and fix crashes

## Upgrading to Production

Before launching your app to production:

1. Update the security rules for Firestore, Realtime Database, and Storage to be more restrictive
2. Set up proper authentication with email verification
3. Consider implementing Firebase Authentication custom claims for user roles
4. Set up Firebase App Check to prevent abuse
5. Enable Firebase billing and adjust the pricing plan according to your needs

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase JavaScript SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)