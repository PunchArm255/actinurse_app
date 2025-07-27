// Database utilities for the optimized backend
// Note: Salles and lits are now static, only journal entries are stored in the database

// Setup database (no longer needed since salles are static)
export const setupDatabase = async () => {
    console.log("✅ Database setup not needed - salles are now static!");
    return { success: true, message: 'Salles are static, no setup required' };
};

// Reset database (clears only journal entries)
export const resetDatabase = async () => {
    console.log("✅ Database reset not needed - salles are now static!");
    return { success: true, message: 'Salles are static, no reset required' };
};

// Make functions globally available for browser console access
if (typeof window !== 'undefined') {
    window.setupDatabase = setupDatabase;
    window.resetDatabase = resetDatabase;
} 