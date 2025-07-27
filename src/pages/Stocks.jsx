import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

const Stocks = () => {
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

    // Stocks specific state
    const [searchQuery, setSearchQuery] = useState('');
    const [stockData, setStockData] = useState(null);
    const [activeTab, setActiveTab] = useState('items');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consumeAmount, setConsumeAmount] = useState(1);
    const [stockMode, setStockMode] = useState('FIFO');
    const [sortBy, setSortBy] = useState('name');
    const [filterCriteria, setFilterCriteria] = useState('all');

    // Use the authentication context
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

    // Initialize stock data
    useEffect(() => {
        const savedStockData = JSON.parse(localStorage.getItem('stockData'));

        if (savedStockData) {
            setStockData(savedStockData);
        } else {
            // Initial stock data
            const initialStockData = {
                dotationInitiale: 5000,
                dotationConsommee: 0,
                dotationRestante: 5000,
                items: [
                    { id: 1, name: 'Gants médicaux', stock: 100, price: 10, consumed: 0, category: 'protection', criticalLevel: 20 },
                    { id: 2, name: 'Seringues', stock: 80, price: 15, consumed: 0, category: 'injection', criticalLevel: 15 },
                    { id: 3, name: 'Intranules', stock: 50, price: 25, consumed: 0, category: 'injection', criticalLevel: 10 },
                    { id: 4, name: 'Coton médical', stock: 120, price: 5, consumed: 0, category: 'soins', criticalLevel: 30 },
                    { id: 5, name: 'Sparadraps', stock: 40, price: 20, consumed: 0, category: 'soins', criticalLevel: 15 },
                    { id: 6, name: 'Lames bistouri', stock: 60, price: 12, consumed: 0, category: 'chirurgie', criticalLevel: 20 },
                    { id: 7, name: 'Tubulures', stock: 35, price: 30, consumed: 0, category: 'perfusion', criticalLevel: 10 },
                    { id: 8, name: 'Transfuseurs', stock: 25, price: 45, consumed: 0, category: 'perfusion', criticalLevel: 8 },
                    { id: 9, name: 'Lunettes protection', stock: 15, price: 50, consumed: 0, category: 'protection', criticalLevel: 5 },
                    { id: 10, name: 'Sérum salé', stock: 70, price: 18, consumed: 0, category: 'perfusion', criticalLevel: 25 },
                ],
                meds: [
                    { id: 101, name: 'Amoxicilline', stock: 40, price: 75, consumed: 0, category: 'antibiotique', criticalLevel: 10 },
                    { id: 102, name: 'Paracétamol', stock: 120, price: 25, consumed: 0, category: 'antalgique', criticalLevel: 30 },
                    { id: 103, name: 'Ibuprofène', stock: 80, price: 30, consumed: 0, category: 'anti-inflammatoire', criticalLevel: 20 },
                    { id: 104, name: 'Morphine', stock: 15, price: 200, consumed: 0, category: 'antalgique', criticalLevel: 5 },
                    { id: 105, name: 'Insuline', stock: 25, price: 150, consumed: 0, category: 'hormone', criticalLevel: 8 },
                    { id: 106, name: 'Aspirine', stock: 90, price: 20, consumed: 0, category: 'antiagrégant', criticalLevel: 25 },
                    { id: 107, name: 'Oméprazole', stock: 60, price: 45, consumed: 0, category: 'gastro', criticalLevel: 15 },
                    { id: 108, name: 'Furosémide', stock: 45, price: 35, consumed: 0, category: 'diurétique', criticalLevel: 12 },
                ]
            };

            setStockData(initialStockData);
            localStorage.setItem('stockData', JSON.stringify(initialStockData));
        }
    }, []);

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

    const openModal = (item) => {
        setSelectedItem(item);
        setConsumeAmount(1);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setConsumeAmount(1);
    };

    const handleConsume = () => {
        if (!selectedItem || consumeAmount <= 0 || consumeAmount > selectedItem.stock) return;

        const newStockData = { ...stockData };
        const currentItems = activeTab === 'items' ? newStockData.items : newStockData.meds;
        const itemIndex = currentItems.findIndex(item => item.id === selectedItem.id);

        if (itemIndex !== -1) {
            currentItems[itemIndex].stock -= consumeAmount;
            currentItems[itemIndex].consumed += consumeAmount;

            const totalConsumed = consumeAmount * selectedItem.price;
            newStockData.dotationConsommee += totalConsumed;
            newStockData.dotationRestante -= totalConsumed;

            setStockData(newStockData);
            localStorage.setItem('stockData', JSON.stringify(newStockData));
        }

        closeModal();
    };

    const getCurrentItems = () => {
        if (!stockData) return [];
        const items = activeTab === 'items' ? stockData.items : stockData.meds;

        let filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply filters
        if (filterCriteria === 'low') {
            filteredItems = filteredItems.filter(item => item.stock <= item.criticalLevel);
        } else if (filterCriteria === 'medium') {
            filteredItems = filteredItems.filter(item => item.stock > item.criticalLevel && item.stock <= item.criticalLevel * 2);
        } else if (filterCriteria === 'high') {
            filteredItems = filteredItems.filter(item => item.stock > item.criticalLevel * 2);
        }

        // Sort items
        filteredItems.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'stock':
                    return b.stock - a.stock;
                case 'price':
                    return b.price - a.price;
                case 'consumed':
                    return b.consumed - a.consumed;
                default:
                    return 0;
            }
        });

        return filteredItems;
    };

    const getStockStatus = (item) => {
        if (item.stock === 0) return { status: 'empty', color: 'bg-red-500', text: 'Rupture' };
        if (item.stock <= item.criticalLevel) return { status: 'critical', color: 'bg-orange-500', text: 'Critique' };
        if (item.stock <= item.criticalLevel * 2) return { status: 'low', color: 'bg-yellow-500', text: 'Bas' };
        return { status: 'good', color: 'bg-green-500', text: 'Bon' };
    };

    const getItemIcon = (category) => {
        const icons = {
            protection: '🛡️',
            injection: '💉',
            soins: '🩹',
            chirurgie: '🔪',
            perfusion: '🧪',
            antibiotique: '💊',
            antalgique: '💊',
            'anti-inflammatoire': '💊',
            hormone: '💊',
            antiagrégant: '💊',
            gastro: '💊',
            diurétique: '💊'
        };
        return icons[category] || '📦';
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

    const tabVariants = {
        inactive: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" },
        active: {
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            transition: { type: "spring", stiffness: 400 }
        }
    };

    if (!stockData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5E67AC]"></div>
            </div>
        );
    }

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
                            <span className="text-xs opacity-70">v0.1</span>
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
                                    <h2 className="text-xl font-bold mb-2">Bienvenue sur ActiNurse v0.1</h2>
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
                                            <h3 className="text-md font-semibold">v0.1.0 (Actuel)</h3>
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
                    Gestion des Stocks
                </motion.h1>

                {/* Budget Overview */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                    variants={itemVariants}
                >
                    <motion.div
                        className="bg-[#f1f3ff] rounded-2xl p-4 shadow-md text-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <h3 className="text-lg font-bold text-[#4f5796] mb-2">Budget Initial</h3>
                        <p className="text-2xl font-semibold text-[#4f5796]">
                            {stockData.dotationInitiale}€
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-[#ffd3d3] rounded-2xl p-4 shadow-md text-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <h3 className="text-lg font-bold text-[#ac5e5e] mb-2">Budget Consommé</h3>
                        <p className="text-2xl font-semibold text-[#ac5e5e]">
                            {stockData.dotationConsommee}€
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-[#d3ffda] rounded-2xl p-4 shadow-md text-center"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <h3 className="text-lg font-bold text-[#437d4f] mb-2">Budget Restant</h3>
                        <p className="text-2xl font-semibold text-[#437d4f]">
                            {stockData.dotationRestante}€
                        </p>
                    </motion.div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between gap-4 mb-6"
                    variants={itemVariants}
                >
                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Tabs */}
                        <div className="flex rounded-full bg-[#f1f3ff] p-1">
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${activeTab === 'items'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setActiveTab('items')}
                            >
                                Matériels
                            </button>
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${activeTab === 'meds'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setActiveTab('meds')}
                            >
                                Médicaments
                            </button>
                        </div>

                        {/* FIFO/LIFO toggle */}
                        <div className="flex rounded-full bg-[#f1f3ff] p-1">
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${stockMode === 'FIFO'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setStockMode('FIFO')}
                            >
                                FIFO
                            </button>
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${stockMode === 'LIFO'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setStockMode('LIFO')}
                            >
                                LIFO
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Search */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-6 
                                   border border-[#cbd1ff] focus:border-[#4f5796] outline-none"
                        />

                        {/* Filters */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-4 
                                     border border-[#cbd1ff] focus:border-[#4f5796] outline-none"
                        >
                            <option value="name">Trier par nom</option>
                            <option value="stock">Trier par stock</option>
                            <option value="price">Trier par prix</option>
                            <option value="consumed">Trier par consommé</option>
                        </select>

                        <select
                            value={filterCriteria}
                            onChange={(e) => setFilterCriteria(e.target.value)}
                            className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-4 
                                     border border-[#cbd1ff] focus:border-[#4f5796] outline-none"
                        >
                            <option value="all">Tous les stocks</option>
                            <option value="low">Stock critique</option>
                            <option value="medium">Stock bas</option>
                            <option value="high">Stock bon</option>
                        </select>

                        <Link
                            to="/home"
                            className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 hover:bg-[#3a4170] transition-colors text-center"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </motion.div>

                {/* Items Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    <AnimatePresence>
                        {getCurrentItems().map((item, index) => {
                            const stockStatus = getStockStatus(item);
                            return (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{
                                        scale: 1.03,
                                        y: -5,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                                        transition: { type: "spring", stiffness: 400 }
                                    }}
                                    layout
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div
                                            className="text-3xl"
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                        >
                                            {getItemIcon(item.category)}
                                        </motion.div>
                                        <motion.div
                                            className={`${stockStatus.color} text-white text-xs px-2 py-1 rounded-full font-bold`}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {stockStatus.text}
                                        </motion.div>
                                    </div>

                                    <motion.h3
                                        className="font-bold text-lg text-gray-800 mb-2"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {item.name}
                                    </motion.h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Stock actuel:</span>
                                            <motion.span
                                                className="font-semibold"
                                                animate={{
                                                    color: item.stock <= item.criticalLevel ? '#ef4444' : '#374151'
                                                }}
                                            >
                                                {item.stock} unités
                                            </motion.span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Prix unitaire:</span>
                                            <span className="font-semibold">{item.price}€</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Consommé:</span>
                                            <span className="font-semibold">{item.consumed} unités</span>
                                        </div>
                                    </div>

                                    {/* Stock Progress Bar */}
                                    <div className="mb-4">
                                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${stockStatus.color}`}
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${Math.min((item.stock / (item.criticalLevel * 3)) * 100, 100)}%`
                                                }}
                                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        onClick={() => openModal(item)}
                                        disabled={item.stock === 0}
                                        className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${item.stock === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#5e67ac] text-white hover:bg-[#4f5796] shadow-lg'
                                            }`}
                                        whileHover={item.stock > 0 ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={item.stock > 0 ? { scale: 0.98 } : {}}
                                    >
                                        {item.stock === 0 ? 'Rupture de stock' : 'Consommer'}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>


            </motion.main>

            {/* Consumption Modal */}
            <AnimatePresence>
                {showModal && selectedItem && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.div
                                className="text-center mb-6"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="text-4xl mb-3">
                                    {getItemIcon(selectedItem.category)}
                                </div>
                                <h2 className="text-2xl font-bold text-[#5e67ac] mb-2">
                                    {selectedItem.name}
                                </h2>
                                <p className="text-gray-600">
                                    Stock disponible: <span className="font-semibold">{selectedItem.stock} unités</span>
                                </p>
                            </motion.div>

                            <motion.div
                                className="mb-6"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Quantité à consommer:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.stock}
                                    value={consumeAmount}
                                    onChange={(e) => setConsumeAmount(parseInt(e.target.value) || 1)}
                                    className="w-full border border-gray-300 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#5e67ac] text-center text-lg font-semibold"
                                />
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Coût total: <span className="font-semibold">{(consumeAmount * selectedItem.price).toFixed(2)}€</span>
                                </p>
                            </motion.div>

                            <motion.div
                                className="flex gap-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.button
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700 font-semibold"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    onClick={handleConsume}
                                    disabled={consumeAmount <= 0 || consumeAmount > selectedItem.stock}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-[#5e67ac] hover:bg-[#4f5796] transition-colors text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={consumeAmount > 0 && consumeAmount <= selectedItem.stock ? { scale: 1.02 } : {}}
                                    whileTap={consumeAmount > 0 && consumeAmount <= selectedItem.stock ? { scale: 0.98 } : {}}
                                >
                                    Consommer
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Stocks;