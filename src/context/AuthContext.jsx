import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, ID } from '../lib/appwrite';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Check for existing session on app load
    useEffect(() => {
        const checkUserSession = async () => {
            setLoading(true);
            setError(null);
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Session check error:", error);
                setUser(null);
                setError(null); // Not setting error on initial load
            } finally {
                setLoading(false);
            }
        };

        checkUserSession();
    }, []);

    // Sign up
    const signUp = async (email, password, name, userId, avatarFile) => {
        setLoading(true);
        setError(null);
        try {
            const session = await authService.createAccount(email, password, name, userId, avatarFile);

            if (session) {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                return { success: true, user: currentUser };
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError(error.message || "Failed to create account");
            return { success: false, error: error.message || "Failed to create account" };
        } finally {
            setLoading(false);
        }
    };

    // Sign in
    const signIn = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const session = await authService.login(email, password);

            if (session) {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                return { success: true, user: currentUser };
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Failed to sign in");
            return { success: false, error: error.message || "Failed to sign in" };
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
            navigate('/signin');
        } catch (error) {
            console.error("Logout error:", error);
            setError(error.message || "Failed to sign out");
        } finally {
            setLoading(false);
        }
    };

    // Get first name from full name
    const getFirstName = () => {
        if (!user || !user.name) return '';
        const nameParts = user.name.split(' ');
        return nameParts[0];
    };

    const contextValue = {
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        getFirstName,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 