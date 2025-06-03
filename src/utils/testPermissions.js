// Test script to check Firebase permissions
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

// Function to test if the current user can update another user's document
export const testFriendRequestPermissions = async (currentUserId, targetUserId) => {
  try {
    console.log(`Testing permissions: Can user ${currentUserId} update user ${targetUserId}?`);
    
    // Step 1: Check if both users exist
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const targetUserDoc = await getDoc(doc(db, "users", targetUserId));
    
    if (!currentUserDoc.exists()) {
      return {
        success: false,
        error: "Current user document does not exist",
        step: "check_current_user"
      };
    }
    
    if (!targetUserDoc.exists()) {
      return {
        success: false,
        error: "Target user document does not exist",
        step: "check_target_user"
      };
    }
    
    console.log("Both users exist, proceeding to permission test");
    
    // Step 2: Try to update the target user's document with a test field
    try {
      // First, try to add a test field that will be removed immediately
      await updateDoc(doc(db, "users", targetUserId), {
        _permissionTest: true
      });
      
      // If successful, remove the test field
      await updateDoc(doc(db, "users", targetUserId), {
        _permissionTest: null
      });
      
      console.log("Permission test passed: User can update target user's document");
      
      return {
        success: true,
        message: "You have permission to send friend requests"
      };
    } catch (updateError) {
      console.error("Permission test failed:", updateError);
      
      return {
        success: false,
        error: updateError.message,
        code: updateError.code,
        step: "update_test"
      };
    }
  } catch (error) {
    console.error("Error testing permissions:", error);
    
    return {
      success: false,
      error: error.message,
      step: "general_error"
    };
  }
};

// Function to test if the current user can add a friend request to another user
export const testAddFriendRequest = async (fromUserId, toUserId) => {
  try {
    console.log(`Testing friend request: Can user ${fromUserId} send request to ${toUserId}?`);
    
    // Check if users exist
    const fromUserDoc = await getDoc(doc(db, "users", fromUserId));
    const toUserDoc = await getDoc(doc(db, "users", toUserId));
    
    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
      return {
        success: false,
        error: "One or both users do not exist",
        step: "check_users"
      };
    }
    
    // Try to add a test friend request
    try {
      await updateDoc(doc(db, "users", toUserId), {
        friendRequests: arrayUnion({
          fromUserId,
          status: "test",
          timestamp: new Date().getTime()
        })
      });
      
      console.log("Friend request test passed");
      
      // Remove the test request
      const toUser = (await getDoc(doc(db, "users", toUserId))).data();
      const updatedRequests = toUser.friendRequests.filter(req => req.status !== "test");
      
      await updateDoc(doc(db, "users", toUserId), {
        friendRequests: updatedRequests
      });
      
      return {
        success: true,
        message: "You can send friend requests"
      };
    } catch (updateError) {
      console.error("Friend request test failed:", updateError);
      
      return {
        success: false,
        error: updateError.message,
        code: updateError.code,
        step: "add_request"
      };
    }
  } catch (error) {
    console.error("Error testing friend request:", error);
    
    return {
      success: false,
      error: error.message,
      step: "general_error"
    };
  }
};

export default {
  testFriendRequestPermissions,
  testAddFriendRequest
};