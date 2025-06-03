import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  addDoc,
  onSnapshot
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import {
  ref as rtdbRef,
  set as rtdbSet,
  onValue,
  onDisconnect,
  serverTimestamp as rtdbServerTimestamp
} from "firebase/database";
import { auth, db, storage, rtdb } from "./firebase";

// Authentication Services
export const authService = {
  // Register a new user
  register: async (email, password, username) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with username
      await updateProfile(user, {
        displayName: username
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email,
        avatar: null,
        status: "Online",
        customStatus: "",
        role: "member",
        pronouns: "",
        bannerUrl: null,
        profileEffect: null,
        aboutMe: "",
        friends: [],
        friendRequests: [],
        createdAt: serverTimestamp()
      });
      
      // Set user's online status in Realtime Database
      const userStatusRef = rtdbRef(rtdb, `status/${user.uid}`);
      await rtdbSet(userStatusRef, {
        state: "online",
        last_changed: rtdbServerTimestamp()
      });
      
      // Set up disconnect hook
      onDisconnect(userStatusRef).update({
        state: "offline",
        last_changed: rtdbServerTimestamp()
      });
      
      return {
        uid: user.uid,
        username,
        email,
        avatar: null,
        status: "Online"
      };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        // Update user status to Online
        await updateDoc(doc(db, "users", user.uid), {
          status: "Online"
        });
        
        // Set user's online status in Realtime Database
        const userStatusRef = rtdbRef(rtdb, `status/${user.uid}`);
        await rtdbSet(userStatusRef, {
          state: "online",
          last_changed: rtdbServerTimestamp()
        });
        
        // Set up disconnect hook
        onDisconnect(userStatusRef).update({
          state: "offline",
          last_changed: rtdbServerTimestamp()
        });
        
        return {
          uid: user.uid,
          ...userDoc.data()
        };
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Update user status to Offline in Firestore
        await updateDoc(doc(db, "users", user.uid), {
          status: "Offline"
        });
        
        // Update status in Realtime Database
        const userStatusRef = rtdbRef(rtdb, `status/${user.uid}`);
        await rtdbSet(userStatusRef, {
          state: "offline",
          last_changed: rtdbServerTimestamp()
        });
      }
      
      await signOut(auth);
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
              resolve({
                uid: user.uid,
                ...userDoc.data()
              });
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      }, reject);
    });
  }
};

// User Services
export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data()
        };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
  
  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      await updateDoc(doc(db, "users", userId), userData);
      
      // If updating username, also update auth profile
      if (userData.username && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userData.username
        });
      }
      
      // Get updated user data
      const updatedUserDoc = await getDoc(doc(db, "users", userId));
      
      return {
        uid: updatedUserDoc.id,
        ...updatedUserDoc.data()
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
  
  // Upload user avatar
  uploadAvatar: async (userId, file) => {
    try {
      const storageRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user document with avatar URL
      await updateDoc(doc(db, "users", userId), {
        avatar: downloadURL
      });
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },
  
  // Subscribe to online users
  subscribeToOnlineUsers: (callback) => {
    const statusRef = rtdbRef(rtdb, 'status');
    return onValue(statusRef, (snapshot) => {
      const statuses = snapshot.val();
      const onlineUserIds = [];
      
      if (statuses) {
        Object.keys(statuses).forEach(userId => {
          if (statuses[userId].state === 'online') {
            onlineUserIds.push(userId);
          }
        });
      }
      
      callback(onlineUserIds);
    });
  }
};

// Server Services
export const serverService = {
  // Create a new server
  createServer: async (userId, serverData) => {
    try {
      const serverRef = doc(collection(db, "servers"));
      
      await setDoc(serverRef, {
        id: serverRef.id,
        name: serverData.name,
        icon: serverData.icon || '🌟',
        ownerId: userId,
        bannerUrl: serverData.bannerUrl || null,
        roles: [
          { id: 'role_owner', name: 'Owner', color: 'text-yellow-400', permissions: ['manageServer', 'manageChannels', 'manageRoles', 'kickMembers', 'banMembers', 'manageServerSettings'] },
          { id: 'role_default', name: 'Member', color: 'text-gray-300', permissions: [] }
        ],
        channels: [
          { id: `ch_${Date.now()}`, name: 'general', type: 'text', description: 'General discussion' }
        ],
        members: [userId],
        createdAt: serverTimestamp()
      });
      
      // Create initial message in general channel
      const generalChannelId = `ch_${Date.now()}`;
      await addDoc(collection(db, "messages"), {
        channelId: generalChannelId,
        content: "Welcome to the server! 🎉",
        userId: userId,
        userName: (await getDoc(doc(db, "users", userId))).data().username,
        userAvatar: (await getDoc(doc(db, "users", userId))).data().avatar,
        timestamp: serverTimestamp()
      });
      
      // Get the created server
      const serverDoc = await getDoc(serverRef);
      
      return {
        id: serverDoc.id,
        ...serverDoc.data()
      };
    } catch (error) {
      console.error("Error creating server:", error);
      throw error;
    }
  },
  
  // Get all servers
  getAllServers: async () => {
    try {
      const serversSnapshot = await getDocs(collection(db, "servers"));
      return serversSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting servers:", error);
      throw error;
    }
  },
  
  // Get servers for a user
  getUserServers: async (userId) => {
    try {
      const q = query(collection(db, "servers"), where("members", "array-contains", userId));
      const serversSnapshot = await getDocs(q);
      
      return serversSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting user servers:", error);
      throw error;
    }
  },
  
  // Get server by ID
  getServerById: async (serverId) => {
    try {
      const serverDoc = await getDoc(doc(db, "servers", serverId));
      
      if (serverDoc.exists()) {
        return {
          id: serverDoc.id,
          ...serverDoc.data()
        };
      } else {
        throw new Error("Server not found");
      }
    } catch (error) {
      console.error("Error getting server:", error);
      throw error;
    }
  },
  
  // Update server
  updateServer: async (serverId, serverData) => {
    try {
      await updateDoc(doc(db, "servers", serverId), serverData);
      
      // Get updated server data
      const updatedServerDoc = await getDoc(doc(db, "servers", serverId));
      
      return {
        id: updatedServerDoc.id,
        ...updatedServerDoc.data()
      };
    } catch (error) {
      console.error("Error updating server:", error);
      throw error;
    }
  },
  
  // Create a channel in a server
  createChannel: async (serverId, channelData) => {
    try {
      const serverDoc = await getDoc(doc(db, "servers", serverId));
      
      if (!serverDoc.exists()) {
        throw new Error("Server not found");
      }
      
      const server = serverDoc.data();
      const newChannel = {
        id: `ch_${Date.now()}`,
        name: channelData.name.toLowerCase().replace(/\s+/g, '-'),
        type: channelData.type || 'text',
        description: channelData.description || `${channelData.name} channel`
      };
      
      // Add the new channel to the server's channels array
      await updateDoc(doc(db, "servers", serverId), {
        channels: [...server.channels, newChannel]
      });
      
      return newChannel;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  },
  
  // Subscribe to server changes
  subscribeToServer: (serverId, callback) => {
    return onSnapshot(doc(db, "servers", serverId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  }
};

// Message Services
export const messageService = {
  // Send a message
  sendMessage: async (channelId, messageData, userId) => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const user = userDoc.data();
      
      // Create message document
      const messageRef = await addDoc(collection(db, "messages"), {
        channelId,
        content: messageData.content,
        userId,
        userName: user.username,
        userAvatar: user.avatar,
        timestamp: serverTimestamp(),
        file: messageData.file || null
      });
      
      // Get the created message
      const messageDoc = await getDoc(messageRef);
      
      return {
        id: messageDoc.id,
        ...messageDoc.data(),
        timestamp: new Date().getTime() // Use client timestamp for immediate display
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  
  // Get messages for a channel
  getChannelMessages: async (channelId) => {
    try {
      const q = query(
        collection(db, "messages"),
        where("channelId", "==", channelId),
        orderBy("timestamp", "asc")
      );
      
      const messagesSnapshot = await getDocs(q);
      
      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  },
  
  // Subscribe to channel messages
  subscribeToChannelMessages: (channelId, callback) => {
    const q = query(
      collection(db, "messages"),
      where("channelId", "==", channelId),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      callback(messages);
    });
  },
  
  // Upload file for a message
  uploadFile: async (file, userId) => {
    try {
      const fileId = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `message_files/${userId}/${fileId}`);
      
      await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
};

// Friend Services
export const friendService = {
  // Send a friend request
  sendFriendRequest: async (fromUserId, toUserId) => {
    try {
      // Check if users exist
      const fromUserDoc = await getDoc(doc(db, "users", fromUserId));
      const toUserDoc = await getDoc(doc(db, "users", toUserId));
      
      if (!fromUserDoc.exists() || !toUserDoc.exists()) {
        throw new Error("User not found");
      }
      
      // Check if already friends
      const toUser = toUserDoc.data();
      
      if (toUser.friends && toUser.friends.includes(fromUserId)) {
        throw new Error("Already friends");
      }
      
      // Check if request already sent
      if (toUser.friendRequests && toUser.friendRequests.some(req => req.fromUserId === fromUserId)) {
        throw new Error("Friend request already sent");
      }
      
      // Add friend request to recipient's requests
      await updateDoc(doc(db, "users", toUserId), {
        friendRequests: arrayUnion({
          fromUserId,
          status: "pending",
          timestamp: new Date().getTime()
        })
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  },
  
  // Respond to a friend request
  respondToFriendRequest: async (userId, requesterId, action) => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const user = userDoc.data();
      
      // Find the request
      const requestIndex = user.friendRequests.findIndex(req => req.fromUserId === requesterId);
      
      if (requestIndex === -1) {
        throw new Error("Friend request not found");
      }
      
      // Remove the request
      const updatedRequests = [...user.friendRequests];
      updatedRequests.splice(requestIndex, 1);
      
      await updateDoc(doc(db, "users", userId), {
        friendRequests: updatedRequests
      });
      
      if (action === "accept") {
        // Add each other as friends
        await updateDoc(doc(db, "users", userId), {
          friends: arrayUnion(requesterId)
        });
        
        await updateDoc(doc(db, "users", requesterId), {
          friends: arrayUnion(userId)
        });
        
        // Create a DM channel ID (not an actual document, just a convention)
        const sortedUserIds = [userId, requesterId].sort();
        const dmChannelId = `dm_${sortedUserIds[0]}_${sortedUserIds[1]}`;
        
        return { success: true, action, dmChannelId };
      }
      
      return { success: true, action };
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  },
  
  // Get friends for a user
  getUserFriends: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const user = userDoc.data();
      const friendIds = user.friends || [];
      
      if (friendIds.length === 0) {
        return [];
      }
      
      // Get all friend user documents
      const friendsData = await Promise.all(
        friendIds.map(friendId => getDoc(doc(db, "users", friendId)))
      );
      
      return friendsData
        .filter(doc => doc.exists())
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
    } catch (error) {
      console.error("Error getting user friends:", error);
      throw error;
    }
  }
};

// Export all services
export default {
  auth: authService,
  user: userService,
  server: serverService,
  message: messageService,
  friend: friendService
};