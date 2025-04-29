import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6810adc30016c23ec237'); // Replace with your actual project ID

// Export the account instance and the ID class
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

// Database and collection/bucket IDs
export const DATABASE_ID = '6810c78a002b6aff996d';
export const PROFILE_COLLECTION_ID = '6810c9ed001f489e33aa';
export const AVATAR_BUCKET_ID = '6810ccff002a715fc4ed';

// Profile helpers
export const createOrUpdateProfile = async (userId, avatarFileId) => {
    // Try to find existing profile
    const profiles = await databases.listDocuments(
        DATABASE_ID,
        PROFILE_COLLECTION_ID,
        [Query.equal('userId', userId)]
    );
    if (profiles.documents.length > 0) {
        // Update existing
        return databases.updateDocument(
            DATABASE_ID,
            PROFILE_COLLECTION_ID,
            profiles.documents[0].$id,
            { avatarFileId }
        );
    } else {
        // Create new
        return databases.createDocument(
            DATABASE_ID,
            PROFILE_COLLECTION_ID,
            ID.unique(),
            { userId, avatarFileId }
        );
    }
};

export const getProfile = async (userId) => {
    const profiles = await databases.listDocuments(
        DATABASE_ID,
        PROFILE_COLLECTION_ID,
        [Query.equal('userId', userId)]
    );
    return profiles.documents[0] || null;
};

export const uploadAvatar = async (file) => {
    // file: File object from input
    const result = await storage.createFile(
        AVATAR_BUCKET_ID,
        ID.unique(),
        file
    );
    return result;
};

export const getAvatarUrl = (fileId) => {
    return storage.getFilePreview(AVATAR_BUCKET_ID, fileId).href;
};

// Simple auth functions
export const createAccount = async (email, password, name) => {
    try {
        console.log("Creating account with:", { email, name });
        
        // Create account
        const newUser = await account.create(
            ID.unique(),
            email,
            password,
            name
        );
        
        console.log("Account created successfully:", newUser);
        
        // Login immediately after account creation
        if (newUser) {
            try {
                console.log("Attempting to login after account creation");
                
                // Using createEmailPasswordSession instead of createEmailSession
                const session = await account.createEmailPasswordSession(email, password);
                console.log("Login successful:", session);
                
                return { success: true, user: newUser, session };
            } catch (loginError) {
                console.error("Auto-login after registration failed:", loginError);
                
                // Return success for account creation even if login failed
                return { 
                    success: true, 
                    user: newUser, 
                    loginFailed: true,
                    error: "Account created successfully! However, automatic login failed. Please log in manually."
                };
            }
        }
    } catch (error) {
        console.error("Account creation error:", error);
        return { 
            success: false, 
            error: error.message || "Failed to create account" 
        };
    }
};

export const login = async (email, password) => {
    try {
        console.log("Attempting login with email:", email);
        
        // Using createEmailPasswordSession instead of createEmailSession
        const session = await account.createEmailPasswordSession(email, password);
        console.log("Session created successfully:", session);
        
        const user = await account.get();
        console.log("User retrieved successfully:", user);
        
        return { success: true, user, session };
    } catch (error) {
        console.error("Login error:", error);
        return { 
            success: false, 
            error: error.message || "Failed to login. Please check your credentials and try again." 
        };
    }
};

export const getCurrentUser = async () => {
    try {
        console.log("Fetching current user");
        const user = await account.get();
        console.log("Current user retrieved:", user);
        return { success: true, user };
    } catch (error) {
        console.error("Get user error:", error);
        return { success: false, error: error.message };
    }
};

export const logout = async () => {
    try {
        console.log("Attempting to log out user");
        
        // Delete the current session
        await account.deleteSession('current');
        console.log("Logout successful");
        
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, error: error.message };
    }
};
