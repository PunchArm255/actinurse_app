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

// Journal-related collection IDs
export const JOURNALS_COLLECTION_ID = '6886720b00064f66f69a';

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

// ========================================
// JOURNAL BACKEND FUNCTIONS
// ========================================

// Create a new journal entry
export const createJournalEntry = async (journalData) => {
    try {
        const user = await account.get();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // DEBUG: Log the incoming data
        console.log('🔍 DEBUG - createJournalEntry received data:');
        console.log(JSON.stringify(journalData, null, 2));
        console.log('bedNumber in journalData:', journalData.bedNumber, 'type:', typeof journalData.bedNumber);

        const entryData = {
            userId: user.$id,
            actName: journalData.actName,
            category: journalData.category,
            patientName: journalData.patientName,
            numeroEntree: journalData.numeroEntree,
            diagnostic: journalData.diagnostic,
            dateEntree: journalData.dateEntree,
            dateSortie: journalData.dateSortie || null,
            medecinGarde: journalData.medecinGarde,
            infGarde: journalData.infGarde,
            jourDateHeureMedecin: journalData.jourDateHeureMedecin,
            jourDateHeureInf: journalData.jourDateHeureInf,
            salleId: journalData.salleId,
            bedNumber: journalData.bedNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // DEBUG: Log the final entryData
        console.log('🔍 DEBUG - Final entryData being sent to Appwrite:');
        console.log(JSON.stringify(entryData, null, 2));
        console.log('bedNumber in entryData:', entryData.bedNumber, 'type:', typeof entryData.bedNumber);

        const result = await databases.createDocument(
            DATABASE_ID,
            JOURNALS_COLLECTION_ID,
            ID.unique(),
            entryData
        );

        console.log("Journal entry created successfully:", result);
        return { success: true, journal: result };
    } catch (error) {
        console.error("Create journal entry error:", error);
        console.error("🔍 DEBUG - Full error details:", {
            message: error.message,
            code: error.code,
            response: error.response
        });
        return { success: false, error: error.message };
    }
};

// Get all journal entries for the current user
export const getUserJournalEntries = async (filters = {}) => {
    try {
        const user = await account.get();
        if (!user) {
            throw new Error('User not authenticated');
        }

        let queries = [Query.equal('userId', user.$id)];
        
        // Add filters if provided
        if (filters.category) {
            queries.push(Query.equal('category', filters.category));
        }
        if (filters.salleId) {
            queries.push(Query.equal('salleId', filters.salleId));
        }
        if (filters.bedNumber) {
            queries.push(Query.equal('bedNumber', filters.bedNumber));
        }
        if (filters.numeroEntree) {
            queries.push(Query.equal('numeroEntree', filters.numeroEntree));
        }

        // Add sorting by creation date (newest first)
        queries.push(Query.orderDesc('createdAt'));

        const result = await databases.listDocuments(
            DATABASE_ID,
            JOURNALS_COLLECTION_ID,
            queries
        );

        console.log("Retrieved journal entries:", result);
        return { success: true, journals: result.documents };
    } catch (error) {
        console.error("Get journal entries error:", error);
        return { success: false, error: error.message };
    }
};

// Update a journal entry
export const updateJournalEntry = async (journalId, updateData) => {
    try {
        const user = await account.get();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const updatedData = {
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        const result = await databases.updateDocument(
            DATABASE_ID,
            JOURNALS_COLLECTION_ID,
            journalId,
            updatedData
        );

        console.log("Journal entry updated successfully:", result);
        return { success: true, journal: result };
    } catch (error) {
        console.error("Update journal entry error:", error);
        return { success: false, error: error.message };
    }
};

// Delete a journal entry
export const deleteJournalEntry = async (journalId) => {
    try {
        const user = await account.get();
        if (!user) {
            throw new Error('User not authenticated');
        }

        await databases.deleteDocument(
            DATABASE_ID,
            JOURNALS_COLLECTION_ID,
            journalId
        );

        console.log("Journal entry deleted successfully");
        return { success: true };
    } catch (error) {
        console.error("Delete journal entry error:", error);
        return { success: false, error: error.message };
    }
};

// Get all salles (rooms)

