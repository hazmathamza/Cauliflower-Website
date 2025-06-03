// Script to help fix Firebase permissions issues
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Function to test if the current user can update their own document
export const testSelfPermissions = async (userId) => {
  try {
    console.log(`Testing if user ${userId} can update their own document`);
    
    // Get the user document
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return {
        success: false,
        error: "User document does not exist",
        step: "check_user"
      };
    }
    
    // Try to update the user's own document
    try {
      await updateDoc(doc(db, "users", userId), {
        _selfPermissionTest: true
      });
      
      // If successful, remove the test field
      await updateDoc(doc(db, "users", userId), {
        _selfPermissionTest: null
      });
      
      console.log("Self-permission test passed");
      
      return {
        success: true,
        message: "You have permission to update your own document"
      };
    } catch (updateError) {
      console.error("Self-permission test failed:", updateError);
      
      return {
        success: false,
        error: updateError.message,
        code: updateError.code,
        step: "update_self"
      };
    }
  } catch (error) {
    console.error("Error testing self-permissions:", error);
    
    return {
      success: false,
      error: error.message,
      step: "general_error"
    };
  }
};

// Function to fix common permission issues
export const fixPermissionIssues = async (email, password) => {
  try {
    console.log("Attempting to fix permission issues");
    
    // Step 1: Re-authenticate the user
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Re-authentication successful");
    } catch (authError) {
      console.error("Re-authentication failed:", authError);
      return {
        success: false,
        error: "Re-authentication failed: " + authError.message,
        step: "re_auth"
      };
    }
    
    // Step 2: Get the current user
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: "No user is currently signed in",
        step: "check_auth"
      };
    }
    
    // Step 3: Test self-permissions
    const selfPermissionTest = await testSelfPermissions(user.uid);
    if (!selfPermissionTest.success) {
      return {
        success: false,
        error: "Cannot update own document: " + selfPermissionTest.error,
        step: "self_permission"
      };
    }
    
    // Step 4: Check if the user document has the necessary fields
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    
    const updates = {};
    let needsUpdate = false;
    
    if (!userData.friends) {
      updates.friends = [];
      needsUpdate = true;
    }
    
    if (!userData.friendRequests) {
      updates.friendRequests = [];
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await updateDoc(doc(db, "users", user.uid), updates);
      console.log("Updated user document with missing fields");
    }
    
    return {
      success: true,
      message: "Permission issues fixed successfully"
    };
  } catch (error) {
    console.error("Error fixing permissions:", error);
    
    return {
      success: false,
      error: error.message,
      step: "general_error"
    };
  }
};

export default {
  testSelfPermissions,
  fixPermissionIssues
};