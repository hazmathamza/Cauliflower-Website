# Firebase Rules Fix Guide

This guide will help you fix the "Missing or insufficient permissions" error when logging in.

## Step 1: Access Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "cauliflower-v2"

## Step 2: Update Firestore Rules

1. In the Firebase console, go to "Firestore Database" from the left sidebar
2. Click on the "Rules" tab
3. Replace the current rules with the following:

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
      // Allow creation of user documents during registration
      allow create: if request.auth != null;
    }
    
    // Servers collection rules
    match /servers/{serverId} {
      // Allow server creation by authenticated users
      allow create: if request.auth != null;
      
      // Allow server updates by the server owner or members
      allow update: if request.auth != null && 
                     (resource.data.ownerId == request.auth.uid || 
                      resource.data.members.hasAny([request.auth.uid]));
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

## Step 3: Update Realtime Database Rules

1. In the Firebase console, go to "Realtime Database" from the left sidebar
2. Click on the "Rules" tab
3. Replace the current rules with the following:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "status": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

4. Click "Publish"

## Step 4: Test Your Application

After updating the rules, try logging in again. The "Missing or insufficient permissions" error should be resolved.

## What Changed?

The key changes in these rules compared to the default ones:

1. **Firestore Rules**:
   - Added a global read permission for authenticated users
   - Added explicit `allow create: if request.auth != null;` for user documents
   - Modified server update permissions to allow both owners and members to update

2. **Realtime Database Rules**:
   - Added global read/write permissions for authenticated users
   - Added specific permissions for the status collection

These changes ensure that authenticated users have the necessary permissions to read and write data required by the application.