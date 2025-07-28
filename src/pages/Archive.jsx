import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

const Archive = () => {
    // State management
    const [isTopBarExpanded, setIsTopBarExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [weather, setWeather] = useState({ temp: '22°C', condition: 'Sunny' });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [language, setLanguage] = useState('fr');
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Archive specific state
    const [archivedActes, setArchivedActes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredActes, setFilteredActes] = useState([]);
    const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
    const [selectedActe, setSelectedActe] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');

    // Use the authentication context
    const navigate = useNavigate();

    // State for user
    const [user, setUser] = useState(null);

    // Fetch the current user on component mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const result = await getCurrentUser();
            if (result.success) {
                setUser(result.user);
                // Fetch avatar/profile
                const profile = await getProfile(result.user.$id);
                if (profile && profile.avatarFileId) {
                    setAvatarUrl(getAvatarUrl(profile.avatarFileId));
                } else {
                    setAvatarUrl(profileSVG);
                }
            } else {
                navigate('/signin');
            }
        };
        fetchCurrentUser();
    }, [navigate]);

    // Get first name from full name
    const getFirstName = () => {
        if (!user || !user.name) return '';
        const nameParts = user.name.split(' ');
        return nameParts[0];
    };

    // Modified greeting to use the user's first name
    const getGreeting = useCallback(() => {
        const hour = new Date().getHours();
        const name = user ? getFirstName() : '';
        const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
        return `${greeting}, ${name}!`;
    }, [user]);

    // Update time and date every second
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setCurrentDate(now.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, [language]);

    // Load archived actes on component mount
    useEffect(() => {
        const loadArchivedActes = () => {
            const savedArchivedActes = JSON.parse(localStorage.getItem('archivedActes')) || [];
            setArchivedActes(savedArchivedActes);
            setFilteredActes(savedArchivedActes);
        };

        loadArchivedActes();
    }, []);

    // Filter actes when search query or filter changes
    useEffect(() => {
        let filtered = archivedActes;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(acte =>
                (acte.name && acte.name.toLowerCase().includes(query)) ||
                (acte.patientName && acte.patientName.toLowerCase().includes(query)) ||
                (acte.patientNumber && acte.patientNumber.toLowerCase().includes(query)) ||
                (acte.diagnostic && acte.diagnostic.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(acte => acte.type === selectedFilter);
        }

        setFilteredActes(filtered);
    }, [searchQuery, archivedActes, selectedFilter]);

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.modal-content') &&
                (showNotificationModal || showSettingsModal || showProfileModal)) {
                setShowNotificationModal(false);
                setShowSettingsModal(false);
                setShowProfileModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationModal, showSettingsModal, showProfileModal]);

    // Handle feedback submission
    const handleSubmitFeedback = () => {
        alert(`Merci pour votre feedback! Évaluation: ${rating}/5`);
        setFeedback('');
        setRating(0);
    };

    // Handle logout
    const handleLogout = async () => {
        console.log("Logging out...");
        const result = await logout();
        if (result.success) {
            console.log("Logout successful");
            navigate('/signin');
        } else {
            console.error("Logout failed:", result.error);
        }
    };

    const handleUnarchiveActe = () => {
        if (!selectedActe) return;

        // Get existing tasks
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};

        // Get room and bed from the archived acte
        const roomKey = `room_${selectedActe.room}`;
        const bedKey = `bed_${selectedActe.bed}`;

        // Ensure the room and bed exist in the tasks structure
        if (!tasks[roomKey]) {
            tasks[roomKey] = {};
        }

        if (!tasks[roomKey][bedKey]) {
            tasks[roomKey][bedKey] = [];
        }

        // Remove from archived actes
        const newArchivedActes = archivedActes.filter(acte => acte.id !== selectedActe.id);

        // Add to tasks
        const unarchived = { ...selectedActe };
        delete unarchived.room;
        delete unarchived.bed;
        tasks[roomKey][bedKey].push(unarchived);

        // Save both updated collections
        localStorage.setItem('archivedActes', JSON.stringify(newArchivedActes));
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Update state
        setArchivedActes(newArchivedActes);
        setFilteredActes(newArchivedActes);

        // Close modal
        setShowUnarchiveModal(false);
        setSelectedActe(null);
    };

    const openUnarchiveModal = (acte) => {
        setSelectedActe(acte);
        setShowUnarchiveModal(true);
    };

    const closeUnarchiveModal = () => {
        setShowUnarchiveModal(false);
        setSelectedActe(null);
    };

    const getTaskColor = (type) => {
        switch (type) {
            case '1': return 'bg-gradient-to-br from-[#ffd3d3] to-[#ffbcbc]';
            case '2': return 'bg-gradient-to-br from-[#d3ffda] to-[#b3f5bc]';
            case '3': return 'bg-gradient-to-br from-[#fff3b3] to-[#ffe066]';
            default: return 'bg-gradient-to-br from-[#f1f3ff] to-[#e0e2ff]';
        }
    };

    const getTaskTextColor = (type) => {
        switch (type) {
            case '1': return 'text-[#ac5e5e]';
            case '2': return 'text-[#437d4f]';
            case '3': return 'text-[#8c8325]';
            default: return 'text-[#5e67ac]';
        }
    };

    const getTaskTypeLabel = (type) => {
        switch (type) {
            case '1': return 'Examen Paraclinique';
            case '2': return 'Traitement Reçu';
            case '3': return 'Soin Prodigué';
            default: return 'Acte';
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const filters = [
        { value: 'all', label: 'Tous les actes', color: 'bg-[#5e67ac]' },
        { value: '1', label: 'Examens', color: 'bg-[#ac5e5e]' },
        { value: '2', label: 'Traitements', color: 'bg-[#437d4f]' },
        { value: '3', label: 'Soins', color: 'bg-[#8c8325]' }
    ];

    return (
        <motion.div
            className={`min-h-screen font-red-hat-display transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Modern Top Bar - Same as Home.jsx */}
            <motion.div
                className={`fixed top-0 w-full z-50 bg-[#5E67AC] transition-all duration-500 ease-in-out
                           ${isTopBarExpanded ? 'h-screen' : 'h-20'} rounded-b-3xl shadow-lg`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <div className="flex items-center justify-between h-20 px-6">
                    <div className="flex items-center cursor-pointer" onClick={() => setIsTopBarExpanded(!isTopBarExpanded)}>
                        <img src={logo} alt="ActiNurse Logo" className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-105" />
                        <div className={`ml-3 text-white text-lg font-bold opacity-70 transition-opacity ${isTopBarExpanded ? 'opacity-100' : 'hidden md:block'}`}>
                            <span className="text-xs opacity-70">v0.2</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={() => {
                                setShowSettingsModal(!showSettingsModal);
                                setShowNotificationModal(false);
                                setShowProfileModal(false);
                            }}
                        >
                            <div className="relative">
                                <img
                                    src={settingsIcon}
                                    className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-md transition-transform duration-300 hover:rotate-90"
                                    alt="Settings"
                                />
                            </div>
                        </button>
                        <button
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={() => {
                                setShowNotificationModal(!showNotificationModal);
                                setShowSettingsModal(false);
                                setShowProfileModal(false);
                            }}
                        >
                            <div className="relative">
                                <img
                                    src={notificationIcon}
                                    className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-md"
                                    alt="Notifications"
                                />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                    0
                                </span>
                            </div>
                        </button>
                        <div
                            className="flex items-center bg-white/20 rounded-full pl-2 md:pl-3 pr-1 gap-1 md:gap-2 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => {
                                setShowProfileModal(!showProfileModal);
                                setShowNotificationModal(false);
                                setShowSettingsModal(false);
                            }}
                        >
                            <span className="text-white font-black text-xs md:text-sm hidden sm:inline">{currentTime}</span>
                            <img src={avatarUrl || profileSVG} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/30" alt="Profile" />
                        </div>
                    </div>
                </div>

                {/* Expanded area content */}
                {isTopBarExpanded && (
                    <div className="px-6 py-4 text-white animate-fadeIn overflow-y-auto max-h-[calc(100vh-5rem)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left column */}
                            <div className="space-y-6">
                                {/* Welcome message */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-2">Bienvenue sur ActiNurse v0.2</h2>
                                    <p className="text-sm opacity-90">
                                        ActiNurse est une application de gestion pour les infirmiers et infirmières.
                                        Cette version offre des fonctionnalités de base pour la gestion des actes médicaux,
                                        des rappels, des stocks, et le suivi des patients.
                                    </p>
                                </div>

                                {/* Changelog */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-2">Journal des modifications</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-md font-semibold">v0.2.5 (Actuel)</h3>
                                            <ul className="list-disc list-inside text-sm opacity-90 ml-2">
                                                <li>Première version de l'application</li>
                                                <li>Journal des actes médicaux</li>
                                                <li>Système de rappels</li>
                                                <li>Gestion des stocks</li>
                                                <li>Interface responsive</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-md font-semibold">Prochaines fonctionnalités</h3>
                                            <ul className="list-disc list-inside text-sm opacity-90 ml-2">
                                                <li>Synchronisation cloud</li>
                                                <li>Applications mobiles natives</li>
                                                <li>Mode hors ligne amélioré</li>
                                                <li>Rapports et statistiques</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-6">
                                {/* Date and weather */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs opacity-80">Aujourd'hui</p>
                                            <p className="text-md font-bold">{currentDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{weather.temp}</p>
                                            <p className="text-xs opacity-80">{weather.condition}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback form */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-3">Donnez votre avis</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm mb-1">Commentaire</label>
                                            <textarea
                                                className="w-full bg-white/20 rounded-xl p-2 text-sm placeholder-white/50 border border-white/20 focus:border-white/50 outline-none resize-none"
                                                placeholder="Partagez votre expérience..."
                                                rows={3}
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">Notation</label>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        className={`text-2xl ${rating >= star ? 'text-yellow-300' : 'text-white/30'}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-full py-2 transition-colors font-semibold"
                                            onClick={handleSubmitFeedback}
                                        >
                                            Envoyer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Include all modals from Home.jsx */}
            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed top-20 right-4 md:right-6 mt-2 z-50 animate-slideUp w-72 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-[#5E67AC] text-white p-3 flex justify-between items-center">
                            <h3 className="font-bold">Notifications</h3>
                            <button
                                className="text-white/70 hover:text-white"
                                onClick={() => setShowNotificationModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 text-center text-gray-600">
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <img src={notificationIcon} alt="No notifications" className="w-6 h-6 opacity-40" />
                                </div>
                            </div>
                            <p className="text-sm">Aucune nouvelle notification</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed top-20 right-4 md:right-16 mt-2 z-50 animate-slideUp w-80 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-[#5E67AC] text-white p-3 flex justify-between items-center">
                            <h3 className="font-bold">Paramètres</h3>
                            <button
                                className="text-white/70 hover:text-white"
                                onClick={() => setShowSettingsModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 text-gray-700 space-y-4">
                            <div>
                                <label className="flex items-center justify-between">
                                    <span className="font-medium">Mode sombre</span>
                                    <div
                                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${darkMode ? 'bg-[#5E67AC]' : 'bg-gray-300'}`}
                                        onClick={() => setDarkMode(!darkMode)}
                                    >
                                        <div
                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </div>
                                </label>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Taille de la police</label>
                                <select
                                    className="w-full bg-gray-100 rounded-lg p-2 border border-gray-200 focus:outline-none focus:border-[#5E67AC]"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                >
                                    <option value="small">Petite</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Langue</label>
                                <select
                                    className="w-full bg-gray-100 rounded-lg p-2 border border-gray-200 focus:outline-none focus:border-[#5E67AC]"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">Anglais</option>
                                </select>
                            </div>
                            <button
                                className="w-full bg-[#5E67AC] hover:bg-[#4F5796] text-white rounded-lg py-2 transition-colors"
                                onClick={() => setShowSettingsModal(false)}
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed top-20 right-4 mt-2 z-50 animate-slideUp w-72 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-b from-[#5E67AC] to-[#4F5796] text-white p-6 text-center">
                            <div className="mb-3 mx-auto w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden">
                                <img
                                    src={avatarUrl || profileSVG}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-lg">{user ? user.name : 'Guest User'}</h3>
                            <p className="text-sm opacity-80">Infirmier en chef</p>
                        </div>
                        <div className="p-4 space-y-2">
                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition-colors text-sm font-medium flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mon Profil
                            </button>
                            <button
                                className="w-full bg-[#ffd3d3] hover:bg-[#ffbcbc] text-[#ac5e5e] rounded-lg py-2 transition-colors text-sm font-medium flex items-center justify-center"
                                onClick={handleLogout}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <motion.main
                className={`pt-28 md:pt-32 px-4 md:px-6 pb-8 transition-all duration-300 ${isTopBarExpanded ? 'opacity-20 pointer-events-none' : 'opacity-100'} max-w-7xl mx-auto`}
                variants={itemVariants}
            >
                <motion.h1
                    className="text-3xl md:text-5xl font-black text-[#5e67ac] mb-6 md:mb-8 text-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.02 }}
                >
                    Archives Médicales
                </motion.h1>

                {/* Search and Filter Section */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between gap-4 mb-6"
                    variants={itemVariants}
                >
                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un acte archivé..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-6 pr-12 w-full sm:w-[400px] focus:outline-none focus:ring-2 focus:ring-[#5e67ac] shadow-md"
                            />
                            <svg
                                className="w-5 h-5 absolute right-5 top-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-1">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setSelectedFilter(filter.value)}
                                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${selectedFilter === filter.value
                                        ? 'bg-[#4f5796] text-white'
                                        : 'bg-[#f1f3ff] text-[#4f5796] hover:bg-[#cbd1ff]'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link
                        to="/journal"
                        className="bg-[#5e67ac] text-[#cbd1ff] rounded-full py-2 px-6 hover:bg-[#4f5796] transition-colors text-center sm:text-left"
                    >
                        Retour au Journal
                    </Link>
                </motion.div>

                {/* Archive Content */}
                <motion.div
                    className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
                    variants={itemVariants}
                    whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                >
                    <AnimatePresence>
                        {filteredActes.length === 0 ? (
                            <motion.div
                                className="text-center py-20 text-gray-500"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <svg
                                        className="w-20 h-20 mx-auto mb-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                        ></path>
                                    </svg>
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2">Aucun acte archivé trouvé</h3>
                                <p>{searchQuery || selectedFilter !== 'all' ? 'Aucun résultat pour cette recherche.' : 'Les actes archivés depuis le journal apparaîtront ici.'}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                            >
                                {filteredActes.map((acte, index) => (
                                    <motion.div
                                        key={acte.id}
                                        className={`${getTaskColor(acte.type)} rounded-2xl p-6 shadow-lg border border-white/50`}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            scale: 1.03,
                                            y: -5,
                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                            transition: { type: "spring", stiffness: 400 }
                                        }}
                                        layout
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <motion.h3
                                                    className={`font-bold text-xl ${getTaskTextColor(acte.type)}`}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {acte.name}
                                                </motion.h3>
                                                <span className="text-gray-600 text-sm font-medium">
                                                    {getTaskTypeLabel(acte.type)}
                                                </span>
                                            </div>
                                            <motion.div
                                                className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-bold"
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                Chambre {acte.room}, Lit {acte.bed}
                                            </motion.div>
                                        </div>

                                        {acte.patientName && (
                                            <motion.div
                                                className="mb-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <span className="font-semibold">Patient:</span> {acte.patientName}
                                                {acte.patientNumber && ` (${acte.patientNumber})`}
                                            </motion.div>
                                        )}

                                        {acte.diagnostic && (
                                            <motion.div
                                                className="mb-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <span className="font-semibold">Diagnostic:</span> {acte.diagnostic}
                                            </motion.div>
                                        )}

                                        {acte.doctorName && (
                                            <motion.div
                                                className="mb-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <span className="font-semibold">Médecin:</span> {acte.doctorName}
                                            </motion.div>
                                        )}

                                        <motion.div
                                            className="mt-4 flex justify-between items-center"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <span className="text-gray-500 text-sm">
                                                Archivé le: {new Date(acte.archivedDate).toLocaleDateString('fr-FR')}
                                            </span>
                                            <motion.button
                                                onClick={() => openUnarchiveModal(acte)}
                                                className="bg-white/90 hover:bg-white text-gray-700 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 shadow-md"
                                                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Désarchiver
                                            </motion.button>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.main>

            {/* Unarchive Modal */}
            <AnimatePresence>
                {showUnarchiveModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.h2
                                className="text-2xl font-bold text-[#5e67ac] mb-4 text-center"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                Confirmation
                            </motion.h2>
                            <motion.p
                                className="mb-6 text-gray-700 text-center leading-relaxed"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Êtes-vous sûr de vouloir désarchiver cet acte et le renvoyer à la chambre {selectedActe?.room}, lit {selectedActe?.bed} ?
                            </motion.p>
                            <motion.div
                                className="flex gap-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    onClick={closeUnarchiveModal}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700 font-medium"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    onClick={handleUnarchiveActe}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-[#5e67ac] hover:bg-[#4f5796] transition-colors text-white font-medium"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Désarchiver
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Archive;