import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

const PillHeader = () => {
    // State
    const [isExpanded, setIsExpanded] = useState(false);
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
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    // Fetch user data
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const result = await getCurrentUser();
            if (result.success) {
                setUser(result.user);
                const profile = await getProfile(result.user.$id);
                if (profile && profile.avatarFileId) {
                    setAvatarUrl(getAvatarUrl(profile.avatarFileId));
                } else {
                    setAvatarUrl(profileSVG);
                }
            }
        };
        fetchCurrentUser();
    }, []);

    // Update time and date
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

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.modal-content') && !e.target.closest('.modal-trigger')) {
                setShowNotificationModal(false);
                setShowSettingsModal(false);
                setShowProfileModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Modal handlers
    const handleNotificationToggle = () => {
        setShowNotificationModal(!showNotificationModal);
        setShowSettingsModal(false);
        setShowProfileModal(false);
    };

    const handleSettingsToggle = () => {
        setShowSettingsModal(!showSettingsModal);
        setShowNotificationModal(false);
        setShowProfileModal(false);
    };

    const handleProfileToggle = () => {
        setShowProfileModal(!showProfileModal);
        setShowNotificationModal(false);
        setShowSettingsModal(false);
    };

    const handleSubmitFeedback = () => {
        alert(`Merci pour votre feedback! Évaluation: ${rating}/5`);
        setFeedback('');
        setRating(0);
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/signin');
        }
    };

    return (
        <>
            {/* Pill Header */}
            <motion.div
                className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isExpanded
                    ? 'w-[95vw] h-[90vh] rounded-3xl'
                    : 'w-auto h-16 rounded-full'
                    } bg-[#5E67AC] shadow-2xl backdrop-blur-sm border border-white/20`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {/* Header Content */}
                <div className="flex items-center justify-between h-16 px-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center space-x-3">
                        <motion.div
                            className="bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <img src={logo} alt="ActiNurse" className="h-8 w-8" />
                        </motion.div>
                        <div className="text-white">
                            <h1 className="text-lg font-black">ActiNurse</h1>
                            <p className="text-xs opacity-70">v0.2.5</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            className="modal-trigger p-2 rounded-full hover:bg-white/20 transition-colors relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSettingsToggle();
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <img src={settingsIcon} className="w-5 h-5 filter drop-shadow-md" alt="Settings" />
                        </motion.button>

                        <motion.button
                            className="modal-trigger p-2 rounded-full hover:bg-white/20 transition-colors relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationToggle();
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <img src={notificationIcon} className="w-5 h-5 filter drop-shadow-md" alt="Notifications" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                0
                            </span>
                        </motion.button>

                        <motion.div
                            className="modal-trigger flex items-center bg-white/20 rounded-full pl-3 pr-1 gap-2 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProfileToggle();
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="text-white font-semibold text-sm hidden sm:inline">{currentTime}</span>
                            <img src={avatarUrl || profileSVG} className="w-8 h-8 rounded-full border-2 border-white/30" alt="Profile" />
                        </motion.div>
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            className="px-6 py-4 text-white overflow-y-auto h-[calc(90vh-4rem)]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {/* Left column */}
                                <div className="space-y-6">
                                    <motion.div
                                        className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold mb-3">Bienvenue sur ActiNurse</h2>
                                        <p className="text-sm opacity-90 leading-relaxed">
                                            ActiNurse est votre assistant médical intelligent conçu pour optimiser
                                            votre pratique infirmière et améliorer les soins aux patients.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="text-lg font-semibold mb-3">Fonctionnalités</h3>
                                        <ul className="space-y-2 text-sm opacity-90">
                                            <li>• Journal des actes médicaux</li>
                                            <li>• Système de rappels intelligents</li>
                                            <li>• Gestion des stocks et fournitures</li>
                                            <li>• Suivi de performance et analytics</li>
                                            <li>• Archives sécurisées</li>
                                        </ul>
                                    </motion.div>
                                </div>

                                {/* Right column */}
                                <div className="space-y-6">
                                    <motion.div
                                        className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-xs opacity-80">Aujourd'hui</p>
                                                <p className="text-lg font-bold">{currentDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{weather.temp}</p>
                                                <p className="text-xs opacity-80">{weather.condition}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <h3 className="text-lg font-semibold mb-3">Votre avis compte</h3>
                                        <div className="space-y-3">
                                            <textarea
                                                className="w-full bg-white/20 rounded-xl p-3 text-sm placeholder-white/50 border border-white/20 focus:border-white/50 outline-none resize-none"
                                                placeholder="Partagez votre expérience..."
                                                rows={3}
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            />
                                            <div className="flex justify-between items-center">
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            className={`text-xl ${rating >= star ? 'text-yellow-300' : 'text-white/30'}`}
                                                            onClick={() => setRating(star)}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                                                    onClick={handleSubmitFeedback}
                                                >
                                                    Envoyer
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showNotificationModal && (
                    <motion.div
                        className="modal-content fixed top-20 right-4 mt-2 z-40 w-72"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="bg-[#5E67AC] text-white p-4 flex justify-between items-center">
                                <h3 className="font-bold">Notifications</h3>
                                <button
                                    className="text-white/70 hover:text-white"
                                    onClick={() => setShowNotificationModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-6 text-center text-gray-600">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <img src={notificationIcon} alt="No notifications" className="w-6 h-6 opacity-40" />
                                </div>
                                <p className="text-sm">Aucune nouvelle notification</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showSettingsModal && (
                    <motion.div
                        className="modal-content fixed top-20 right-4 mt-2 z-40 w-80"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="bg-[#5E67AC] text-white p-4 flex justify-between items-center">
                                <h3 className="font-bold">Paramètres</h3>
                                <button
                                    className="text-white/70 hover:text-white"
                                    onClick={() => setShowSettingsModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-6 text-gray-700 space-y-4">
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
                                    <label className="block font-medium mb-2">Taille de la police</label>
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
                                    <label className="block font-medium mb-2">Langue</label>
                                    <select
                                        className="w-full bg-gray-100 rounded-lg p-2 border border-gray-200 focus:outline-none focus:border-[#5E67AC]"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">Anglais</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showProfileModal && (
                    <motion.div
                        className="modal-content fixed top-20 right-4 mt-2 z-40 w-72"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-b from-[#5E67AC] to-[#4F5796] text-white p-6 text-center">
                                <div className="mb-3 mx-auto w-16 h-16 rounded-full border-4 border-white/30 overflow-hidden">
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
                                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition-colors text-sm font-medium">
                                    Mon Profil
                                </button>
                                <button
                                    className="w-full bg-[#ffd3d3] hover:bg-[#ffbcbc] text-[#ac5e5e] rounded-lg py-2 transition-colors text-sm font-medium"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PillHeader; 