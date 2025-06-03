// This script will help you update your Firebase security rules
// You'll need to run this with Node.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory for rules if it doesn't exist
const rulesDir = path.join(__dirname, 'firebase-rules');
if (!fs.existsSync(rulesDir)) {
  fs.mkdirSync(rulesDir);
}

// Firestore Rules
const firestoreRules = `rules_version = '2';
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
      
      // Allow all authenticated users to read servers
      allow read: if request.auth != null;
    }
    
    // Messages collection rules
    match /messages/{messageId} {
      // Allow authenticated users to create messages
      allow create: if request.auth != null;
      
      // Allow message authors to update or delete their own messages
      allow update, delete: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
      
      // Allow all authenticated users to read messages
      allow read: if request.auth != null;
    }
  }
}`;

// Realtime Database Rules
const realtimeDbRules = `{
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
}`;

// Storage Rules
const storageRules = `rules_version = '2';
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
    
    // Allow authenticated users to upload any files (for development)
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}`;

// Write rules to files
fs.writeFileSync(path.join(rulesDir, 'firestore.rules'), firestoreRules);
fs.writeFileSync(path.join(rulesDir, 'database.rules.json'), realtimeDbRules);
fs.writeFileSync(path.join(rulesDir, 'storage.rules'), storageRules);

console.log('Firebase rules files have been created in the firebase-rules directory.');
console.log('Please upload these rules to your Firebase project using the Firebase Console:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project "cauliflower-v2"');
console.log('3. For each service (Firestore, Realtime Database, Storage):');
console.log('   - Navigate to the service in the left sidebar');
console.log('   - Click on the "Rules" tab');
console.log('   - Copy and paste the contents of the corresponding rules file');
console.log('   - Click "Publish"');