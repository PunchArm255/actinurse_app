import { Client, Account, ID } from 'appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('6810adc30016c23ec237'); // Replace with your actual project ID

// Export the account instance and the ID class
export const account = new Account(client);
export { ID };

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
