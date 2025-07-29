import { useState, useEffect, useRef, useCallback, createRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import abirImage from '../assets/abir.png';
import mohammedImage from '../assets/mohammed.png';
import oumaimaImage from '../assets/oumaima.png';
import ProgressIcon from '../assets/progress.svg';
import StocksIcon from '../assets/stocks.svg';
import JournalIcon from '../assets/journal.svg';
import RemindersIcon from '../assets/reminders.svg';
import ArchiveIcon from '../assets/archive.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';

const Home = () => {
    // Top bar and modal states
    const [isTopBarExpanded, setIsTopBarExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [weather, setWeather] = useState({ temp: '22°C', condition: 'Sunny' });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [language, setLanguage] = useState('fr');
    const [avatarUrl, setAvatarUrl] = useState(null);

    // User and navigation
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Card carousel states
    const [activeCardIndex, setActiveCardIndex] = useState(2); // Journal card is highlighted by default
    const [isDragging, setIsDragging] = useState(false);
    const [dragCardIndex, setDragCardIndex] = useState(null);
    const [contextMenuCard, setContextMenuCard] = useState(null);
    const [inspirationalQuote, setInspirationalQuote] = useState('');

    // Refs
    const carouselRef = useRef(null);
    const cardRefs = useRef([]);

    // Default cards data with corrected order: Progress, Stocks, Journal, Reminders, Archive
    const defaultCardsData = [
        { id: '1', title: 'Progress', icon: ProgressIcon, link: '/progress' },
        { id: '2', title: 'Stocks', icon: StocksIcon, link: '/stocks' },
        { id: '3', title: 'Journal', icon: JournalIcon, link: '/journal' },
        { id: '4', title: 'Reminders', icon: RemindersIcon, link: '/reminders' },
        { id: '5', title: 'Archive', icon: ArchiveIcon, link: '/archive' }
    ];

    // Log user interaction patterns for enhancement validation
    useEffect(() => {
        console.log('🏠 HOME PAGE - User Interaction Analysis:');
        console.log('📊 Current user:', user?.name || 'Not logged in');
        console.log('🕐 Current time:', currentTime);
        console.log('📅 Current date:', currentDate);
        console.log('🎯 Active card index:', activeCardIndex);
        console.log('📱 Screen size:', window.innerWidth, 'x', window.innerHeight);
        console.log('🌙 Dark mode:', darkMode);

        // Track card interactions for potential quick actions
        const trackCardClick = (cardTitle) => {
            console.log(`🎯 CARD CLICKED: ${cardTitle} at ${new Date().toLocaleTimeString()}`);
        };

        // Expose tracking function globally for enhancement analysis
        window.trackHomeInteraction = trackCardClick;

        return () => {
            delete window.trackHomeInteraction;
        };
    }, [user, currentTime, currentDate, activeCardIndex, darkMode]);

    const [cardsData, setCardsData] = useState(defaultCardsData);

    // Initialize card refs
    useEffect(() => {
        cardRefs.current = cardsData.map((_, i) => cardRefs.current[i] ?? createRef());
    }, [cardsData]);

    // Fetch the current user on component mount
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
        const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
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

    // Inspirational quotes
    useEffect(() => {
        const quotes = [
            "Chaque acte de soins est un acte d'humanité.",
            "Votre compassion fait la différence dans la vie des patients.",
            "L'excellence en soins commence par l'attention aux détails.",
            "Vous êtes le héros silencieux de tant d'histoires de guérison.",
            "Votre dévouement transforme la peur en espoir.",
            "Dans vos mains expertes, la science devient art de guérir."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setInspirationalQuote(randomQuote);
    }, []);

    // Close modals when clicking outside or when another modal opens
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

    // Handle modal toggles with proper behavior
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

    // Handle feedback submission
    const handleSubmitFeedback = () => {
        alert(`Merci pour votre feedback! Évaluation: ${rating}/5`);
        setFeedback('');
        setRating(0);
    };

    const handleTeamMemberClick = (memberName) => {
        console.log(`Team member clicked: ${memberName}`);
        // You can add more interactive features here like opening detailed profiles
    };

    const handleTeamModalToggle = () => {
        setShowTeamModal(!showTeamModal);
        setShowNotificationModal(false);
        setShowSettingsModal(false);
        setShowProfileModal(false);
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

    // Card interaction handlers
    const handleMouseDown = (e, index) => {
        setIsDragging(true);
        setDragCardIndex(index);
    };

    const handleContextMenu = (e, index) => {
        e.preventDefault();
        setContextMenuCard(index);
    };

    const handleLongTouch = (index) => {
        setContextMenuCard(index);
    };

    const getCardTransform = (index) => {
        const scale = getCardScale(index);
        return `scale(${scale})`;
    };

    // Convert index to scale for carousel effect
    const getCardScale = (index) => {
        const distance = Math.abs(index - activeCardIndex);
        if (distance === 0) return 1; // Active card is full size
        if (distance === 1) return 0.85; // Adjacent cards are 85% size
        return 0.7; // Further cards are 70% size
    };

    const getCardOpacity = (index) => {
        const offset = Math.abs(index - activeCardIndex);
        if (offset === 0) return 1;
        if (offset === 1) return 0.8;
        if (offset === 2) return 0.6;
        return 0.4;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 100, opacity: 0, scale: 0.8 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.8
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-3, 3, -3],
            rotate: [-0.5, 0.5, -0.5],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            className={`min-h-screen font-red-hat-display transition-colors duration-300 overflow-x-hidden relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#5E67AC]/5"></div>
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-[#5E67AC]/8 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5E67AC]/6 rounded-full"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#5E67AC]/10 rounded-full"
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-[#5E67AC]/12 rounded-full"
                    animate={{
                        y: [0, 25, 0],
                        x: [0, -15, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/3 w-16 h-16 bg-[#5E67AC]/15 rounded-full"
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-3/4 right-1/3 w-20 h-20 bg-[#5E67AC]/9 rounded-full"
                    animate={{
                        y: [0, 15, 0],
                        x: [0, -8, 0],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-1/3 left-1/2 w-12 h-12 bg-[#5E67AC]/11 rounded-full"
                    animate={{
                        y: [0, -12, 0],
                        x: [0, 6, 0],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/2 w-28 h-28 bg-[#5E67AC]/7 rounded-full"
                    animate={{
                        y: [0, -18, 0],
                        x: [0, 12, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
            {/* Top Bar */}
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
                            className="modal-trigger p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSettingsToggle();
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
                            className="modal-trigger p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationToggle();
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
                            className="modal-trigger flex items-center bg-white/20 rounded-full pl-2 md:pl-3 pr-1 gap-1 md:gap-2 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProfileToggle();
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

                                {/* About Project */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-2">À propos du projet</h2>
                                    <p className="text-sm opacity-90 mb-3">
                                        ActiNurse est né de la vision de trois passionnés de la santé et de la technologie,
                                        déterminés à révolutionner la gestion hospitalière pour les infirmiers.
                                    </p>
                                    <div className="bg-gradient-to-r from-[#5E67AC]/20 to-[#4F5796]/20 rounded-xl p-3 border border-white/10">
                                        <h3 className="text-md font-semibold mb-2">Notre Mission</h3>
                                        <p className="text-xs opacity-90">
                                            Simplifier et optimiser le travail quotidien des infirmiers grâce à une interface
                                            intuitive et des outils de gestion performants.
                                        </p>
                                    </div>
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

                                {/* Team Section */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <motion.h2
                                        className="text-xl font-bold mb-4 text-center"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        Équipe Fondatrice
                                    </motion.h2>
                                    <div className="space-y-3">
                                        {/* Abir Sebbar */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTeamMemberClick('Abir Sebbar')}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={abirImage}
                                                    alt="Abir Sebbar"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate">Abir Sebbar</h3>
                                                <p className="text-xs opacity-80 truncate">Conceptualisation & Organisation</p>
                                            </div>
                                            <div className="text-xs opacity-60 bg-white/10 px-2 py-1 rounded-full">Fondatrice</div>
                                        </motion.div>

                                        {/* Mohammed Nassiri */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.4 }}
                                            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTeamMemberClick('Mohammed Nassiri')}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={mohammedImage}
                                                    alt="Mohammed Nassiri"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate">Mohammed Nassiri</h3>
                                                <p className="text-xs opacity-80 truncate">Lead Developer & UI/UX Designer</p>
                                            </div>
                                            <div className="text-xs opacity-60 bg-white/10 px-2 py-1 rounded-full">Fondateur</div>
                                        </motion.div>

                                        {/* Oumaima Khadri */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                            className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTeamMemberClick('Oumaima Khadri')}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={oumaimaImage}
                                                    alt="Oumaima Khadri"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate">Oumaima Khadri</h3>
                                                <p className="text-xs opacity-80 truncate">Coordination</p>
                                            </div>
                                            <div className="text-xs opacity-60 bg-white/10 px-2 py-1 rounded-full">Fondatrice</div>
                                        </motion.div>
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

                {/* Floating Team Modal */}
                <AnimatePresence>
                    {showTeamModal && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Backdrop */}
                            <motion.div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleTeamModalToggle}
                            />

                            {/* Modal Content */}
                            <motion.div
                                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh]"
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    duration: 0.5
                                }}
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#5E67AC] via-[#4F5796] to-[#5E67AC] text-white p-6 text-center relative overflow-hidden">
                                    {/* Floating bubbles in header */}
                                    <motion.div
                                        className="absolute top-4 left-8 w-4 h-4 bg-white/20 rounded-full"
                                        animate={{
                                            y: [0, -20, 0],
                                            x: [0, 10, 0],
                                            scale: [1, 1.2, 1],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.div
                                        className="absolute top-8 right-12 w-6 h-6 bg-white/15 rounded-full"
                                        animate={{
                                            y: [0, -15, 0],
                                            x: [0, -8, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    />
                                    <motion.div
                                        className="absolute bottom-6 left-1/4 w-3 h-3 bg-white/25 rounded-full"
                                        animate={{
                                            y: [0, -12, 0],
                                            x: [0, 6, 0],
                                            scale: [1, 1.3, 1],
                                        }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    />

                                    <h2 className="text-3xl font-black mb-2">Équipe Fondatrice</h2>
                                    <p className="text-lg opacity-90">Les esprits créatifs derrière ActiNurse</p>

                                    <button
                                        onClick={handleTeamModalToggle}
                                        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Team Members Grid */}
                                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Abir Sebbar */}
                                        <motion.div
                                            className="relative group"
                                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                                        >
                                            <motion.div
                                                className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50"
                                                whileHover={{
                                                    scale: 1.05,
                                                    rotateY: 5,
                                                    boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.25)"
                                                }}
                                                animate={{
                                                    y: [0, -5, 0],
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                {/* Floating elements around Abir */}
                                                <motion.div
                                                    className="absolute -top-2 -left-2 w-4 h-4 bg-purple-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-pink-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.3, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                                />

                                                <div className="relative mb-4">
                                                    <motion.img
                                                        src={abirImage}
                                                        alt="Abir Sebbar"
                                                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    />
                                                    <motion.div
                                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <span className="text-white text-xs font-bold">💡</span>
                                                    </motion.div>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">Abir Sebbar</h3>
                                                <p className="text-purple-600 font-medium mb-2">Conceptualisation & Organisation</p>
                                                <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                    Fondatrice
                                                </div>
                                            </motion.div>
                                        </motion.div>

                                        {/* Mohammed Nassiri */}
                                        <motion.div
                                            className="relative group"
                                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                                        >
                                            <motion.div
                                                className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50"
                                                whileHover={{
                                                    scale: 1.05,
                                                    rotateY: -5,
                                                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                                                }}
                                                animate={{
                                                    y: [0, -5, 0],
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                            >
                                                {/* Floating elements around Mohammed */}
                                                <motion.div
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-blue-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.4, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="absolute -bottom-1 -left-1 w-4 h-4 bg-cyan-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                                />

                                                <div className="relative mb-4">
                                                    <motion.img
                                                        src={mohammedImage}
                                                        alt="Mohammed Nassiri"
                                                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    />
                                                    <motion.div
                                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                                                        animate={{ rotate: -360 }}
                                                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <span className="text-white text-xs font-bold">⚡</span>
                                                    </motion.div>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">Mohammed Nassiri</h3>
                                                <p className="text-blue-600 font-medium mb-2">Lead Developer & UI/UX Designer</p>
                                                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                    Fondateur
                                                </div>
                                            </motion.div>
                                        </motion.div>

                                        {/* Oumaima Khadri */}
                                        <motion.div
                                            className="relative group"
                                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
                                        >
                                            <motion.div
                                                className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50"
                                                whileHover={{
                                                    scale: 1.05,
                                                    rotateY: 5,
                                                    boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25)"
                                                }}
                                                animate={{
                                                    y: [0, -5, 0],
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                            >
                                                {/* Floating elements around Oumaima */}
                                                <motion.div
                                                    className="absolute -top-1 -left-1 w-4 h-4 bg-green-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.6, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                                <motion.div
                                                    className="absolute -bottom-2 -right-2 w-3 h-3 bg-emerald-300/60 rounded-full"
                                                    animate={{
                                                        scale: [1, 1.4, 1],
                                                        opacity: [0.6, 1, 0.6],
                                                    }}
                                                    transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                                                />

                                                <div className="relative mb-4">
                                                    <motion.img
                                                        src={oumaimaImage}
                                                        alt="Oumaima Khadri"
                                                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    />
                                                    <motion.div
                                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <span className="text-white text-xs font-bold">🌟</span>
                                                    </motion.div>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">Oumaima Khadri</h3>
                                                <p className="text-green-600 font-medium mb-2">Coordination</p>
                                                <p className="text-green-600 font-medium mb-2">⠀</p>
                                                <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                    Fondatrice
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>

                                    {/* Mission Statement */}
                                    <motion.div
                                        className="mt-8 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 0.6 }}
                                    >
                                        <div className="bg-gradient-to-r from-[#5E67AC]/10 to-[#4F5796]/10 rounded-2xl p-6 border border-[#5E67AC]/20">
                                            <h3 className="text-2xl font-bold text-[#5E67AC] mb-3">Notre Mission</h3>
                                            <p className="text-gray-700 text-lg leading-relaxed">
                                                Révolutionner la gestion hospitalière en créant des outils innovants
                                                qui simplifient le travail quotidien des infirmiers et améliorent
                                                la qualité des soins aux patients.
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AnimatePresence>

            {/* Main Content */}
            <motion.main
                className={`pt-28 md:pt-32 px-4 md:px-6 pb-8 transition-all duration-300 relative z-10 ${isTopBarExpanded ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
                variants={containerVariants}
            >
                <motion.h1
                    className={`text-3xl md:text-5xl font-black text-[#5E67AC] mb-8 md:mb-12 text-center`}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                >
                    {getGreeting()}
                </motion.h1>

                {/* Carousel Container */}
                <motion.div
                    ref={carouselRef}
                    className="flex items-center justify-center h-[340px] md:h-[400px] mx-auto relative overflow-visible z-10"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <div className="flex space-x-6 items-center px-6 overflow-visible scrollbar-none snap-x snap-mandatory scroll-smooth">
                        <AnimatePresence>
                            {cardsData.map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    className="cursor-grab active:cursor-grabbing"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    whileHover={{
                                        y: -10,
                                        scale: 1.05,
                                        transition: { type: "spring", stiffness: 400 }
                                    }}
                                    whileTap={{ scale: 0.98 }}


                                >
                                    <Link
                                        to={card.link}
                                        ref={cardRefs.current[index]}
                                        data-index={index}
                                        onClick={() => window.trackHomeInteraction?.(card.title)}
                                        className={`flex-none w-64 h-80 md:w-72 md:h-96 rounded-[2rem] p-6
                                                  transition-all duration-300 snap-center block
                                                  ${activeCardIndex === index ? 'shadow-xl shadow-[#5E67AC]/30' : ''}

                                                  hover:shadow-lg hover:shadow-[#5E67AC]/20`}
                                        style={{
                                            backgroundColor: '#5E67AC',
                                            transform: getCardTransform(index),
                                            opacity: getCardOpacity(index),
                                            zIndex: 10 - Math.abs(activeCardIndex - index)
                                        }}

                                    >
                                        <div className="flex flex-col items-center justify-between h-full">
                                            <motion.h2
                                                className="text-2xl font-black text-white mb-4"
                                                animate={activeCardIndex === index ? { scale: [1, 1.05, 1] } : {}}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {card.title}
                                            </motion.h2>
                                            <motion.div
                                                className="flex-1 flex items-center justify-center"
                                                variants={floatingVariants}
                                                animate={activeCardIndex === index ? "animate" : {}}
                                            >
                                                <motion.img
                                                    src={card.icon}
                                                    className={`w-28 h-28 md:w-32 md:h-32 filter drop-shadow-lg ${card.title === 'Archive' ? 'preserve-color' : ''}`}
                                                    alt={card.title}
                                                    style={{
                                                        transform: activeCardIndex === index ? 'scale(1.1)' : 'scale(1)'
                                                    }}
                                                    draggable="false"
                                                    whileHover={{
                                                        rotate: [0, -10, 10, 0],
                                                        transition: { duration: 0.5 }
                                                    }}
                                                />
                                            </motion.div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Navigation dots */}
                <motion.div
                    className="flex justify-center mt-6 space-x-2 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    {cardsData.map((_, index) => (
                        <motion.button
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                                      ${activeCardIndex === index
                                    ? 'bg-[#5E67AC] w-6'
                                    : darkMode ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setActiveCardIndex(index)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            animate={activeCardIndex === index ? {
                                scale: [1, 1.2, 1],
                                transition: { duration: 0.5 }
                            } : {}}
                        />
                    ))}
                </motion.div>

                {/* Inspirational Quote - Removed hover animation */}
                <motion.div
                    className="mt-8 md:mt-10 text-center px-4 max-w-2xl mx-auto relative z-10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <div className={`${darkMode ? 'bg-gray-800/60' : 'bg-[#f1f3ff]'} rounded-2xl p-4 md:p-6 shadow-md`}>
                        <motion.p
                            className={`text-lg md:text-xl italic font-medium ${darkMode ? 'text-white/80' : 'text-[#5E67AC]'}`}
                            animate={{
                                opacity: [0.8, 1, 0.8],
                                transition: { duration: 3, repeat: Infinity }
                            }}
                        >
                            "{inspirationalQuote}"
                        </motion.p>
                    </div>
                </motion.div>

                {/* About/Credits Button */}
                <motion.div
                    className="mt-6 text-center relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                >
                    <motion.button
                        onClick={handleTeamModalToggle}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#5E67AC] to-[#4F5796] text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 20px 25px -5px rgba(94, 103, 172, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="mr-2">💻</span>
                        À propos de l'équipe
                        <motion.span
                            className="ml-2 opacity-70 group-hover:opacity-100"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </motion.button>
                </motion.div>
            </motion.main>
        </motion.div>
    );
};

export default Home;