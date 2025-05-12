import { useState, useEffect, useRef, useCallback, createRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

// Import all card icons
import JournalIcon from '../assets/journal.svg';
import RemindersIcon from '../assets/reminders.svg';
import ProgressIcon from '../assets/progress.svg';
import ArchiveIcon from '../assets/archive.svg';
import StocksIcon from '../assets/stocks.svg';

const defaultCardsData = [
    { id: '1', title: 'Journal', icon: JournalIcon, link: '/journal' },
    { id: '2', title: 'Reminders', icon: RemindersIcon, link: '/reminders' },
    { id: '3', title: 'Progress', icon: ProgressIcon, link: '/progress' },
    { id: '4', title: 'Archive', icon: ArchiveIcon, link: '/archive' },
    { id: '5', title: 'Stocks', icon: StocksIcon, link: '/stocks' }
];

const Home = () => {
    // State management
    const [isTopBarExpanded, setIsTopBarExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [weather, setWeather] = useState({ temp: '22°C', condition: 'Sunny' });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(2); // Middle card (Progress) is active by default
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [language, setLanguage] = useState('fr');
    const [cardsData, setCardsData] = useState([]);
    const [inspirationalQuote, setInspirationalQuote] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Mouse drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragCardIndex, setDragCardIndex] = useState(null);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragCurrentX, setDragCurrentX] = useState(0);

    // Refs
    const carouselRef = useRef(null);
    const cardRefs = useRef([]);

    // Use the authentication context
    const navigate = useNavigate();

    // State for user
    const [user, setUser] = useState(null);

    // Load cards data from localStorage or use default
    useEffect(() => {
        const savedCardsData = localStorage.getItem('cardsOrder');
        if (savedCardsData) {
            setCardsData(JSON.parse(savedCardsData));
        } else {
            setCardsData(defaultCardsData);
        }

        // Select a random quote
        const quotes = [
            "Les soins infirmiers sont l'art de s'occuper des autres et une science de compassion.",
            "Le meilleur moyen de s'améliorer est d'aider quelqu'un d'autre.",
            "Un infirmier ne soigne pas seulement. Il écoute, rassure et réconforte.",
            "Chaque jour apporte l'opportunité de faire une différence dans la vie d'autrui.",
            "Notre expertise sauve des vies. Notre compassion guérit les âmes.",
            "La santé ne consiste pas seulement à être exempt de maladie, mais à être pleinement vivant.",
            "Soigner, c'est aimer. Aimer, c'est soigner.",
            "Un simple geste de bienveillance peut illuminer la journée d'un patient."
        ];
        setInspirationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    // Set up refs for each card
    cardRefs.current = cardsData.map((_, i) => cardRefs.current[i] ?? createRef());

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

    // Handle carousel scrolling logic
    useEffect(() => {
        const handleWheel = (e) => {
            if (carouselRef.current && !isDragging) {
                if (e.deltaY > 0) {
                    // Scroll right
                    setActiveCardIndex(prev => Math.min(prev + 1, cardsData.length - 1));
                } else {
                    // Scroll left
                    setActiveCardIndex(prev => Math.max(prev - 1, 0));
                }
            }
        };

        const handleKeyDown = (e) => {
            if (!isDragging && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
                if (e.key === 'ArrowRight') {
                    setActiveCardIndex(prev => Math.min(prev + 1, cardsData.length - 1));
                } else if (e.key === 'ArrowLeft') {
                    setActiveCardIndex(prev => Math.max(prev - 1, 0));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const carouselElement = carouselRef.current;
        if (carouselElement) {
            carouselElement.addEventListener('wheel', handleWheel);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (carouselElement) {
                carouselElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, [cardsData.length, isDragging]);

    // Scroll to the active card when activeCardIndex changes
    useEffect(() => {
        if (cardRefs.current[activeCardIndex]?.current && !isDragging) {
            cardRefs.current[activeCardIndex].current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activeCardIndex, isDragging]);

    // Handle touch events for mobile scrolling
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        let startX;
        let isSwiping = false;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        };

        const handleTouchMove = (e) => {
            if (!isSwiping) return;

            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;

            if (Math.abs(diff) > 30) { // Threshold to avoid accidental swipes
                if (diff > 0) {
                    // Swipe left, go right
                    setActiveCardIndex(prev => Math.min(prev + 1, cardsData.length - 1));
                } else {
                    // Swipe right, go left
                    setActiveCardIndex(prev => Math.max(prev - 1, 0));
                }
                isSwiping = false;
            }
        };

        const handleTouchEnd = () => {
            isSwiping = false;
        };

        carousel.addEventListener('touchstart', handleTouchStart);
        carousel.addEventListener('touchmove', handleTouchMove);
        carousel.addEventListener('touchend', handleTouchEnd);

        return () => {
            carousel.removeEventListener('touchstart', handleTouchStart);
            carousel.removeEventListener('touchmove', handleTouchMove);
            carousel.removeEventListener('touchend', handleTouchEnd);
        };
    }, [cardsData.length]);

    // Mouse events for drag and drop
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && dragCardIndex !== null) {
                setDragCurrentX(e.clientX - dragStartX);
            }
        };

        const handleMouseUp = () => {
            if (isDragging && dragCardIndex !== null) {
                const dragDistance = dragCurrentX;

                // If dragged far enough, reorder cards
                if (Math.abs(dragDistance) > 100) {
                    const newCardsData = [...cardsData];

                    // Dragged right, move card to the right in array
                    if (dragDistance > 0 && dragCardIndex < cardsData.length - 1) {
                        const temp = newCardsData[dragCardIndex];
                        newCardsData[dragCardIndex] = newCardsData[dragCardIndex + 1];
                        newCardsData[dragCardIndex + 1] = temp;
                        setActiveCardIndex(dragCardIndex + 1);
                    }
                    // Dragged left, move card to the left in array
                    else if (dragDistance < 0 && dragCardIndex > 0) {
                        const temp = newCardsData[dragCardIndex];
                        newCardsData[dragCardIndex] = newCardsData[dragCardIndex - 1];
                        newCardsData[dragCardIndex - 1] = temp;
                        setActiveCardIndex(dragCardIndex - 1);
                    }

                    setCardsData(newCardsData);
                    localStorage.setItem('cardsOrder', JSON.stringify(newCardsData));
                }
            }

            // Reset drag state
            setIsDragging(false);
            setDragCardIndex(null);
            setDragCurrentX(0);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragCardIndex, dragStartX, dragCurrentX, cardsData]);

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

    // Start drag
    const handleMouseDown = (e, index) => {
        // Use right click for initiating drag
        if (e.button === 2) {
            e.preventDefault();
            setIsDragging(true);
            setDragCardIndex(index);
            setDragStartX(e.clientX);
            setActiveCardIndex(index);
        }
    };

    // Handle context menu
    const handleContextMenu = (e, index) => {
        e.preventDefault();
        setIsDragging(true);
        setDragCardIndex(index);
        setDragStartX(e.clientX);
        setActiveCardIndex(index);
        return false;
    };

    // Long touch for mobile
    const handleLongTouch = (index) => {
        setIsDragging(true);
        setDragCardIndex(index);
        setActiveCardIndex(index);
    };

    // Convert index to scale for carousel effect
    const getCardScale = (index) => {
        const distance = Math.abs(index - activeCardIndex);
        if (distance === 0) return 1; // Active card is full size
        if (distance === 1) return 0.85; // Adjacent cards are 85% size
        return 0.7; // Further cards are 70% size
    };

    // Get opacity based on distance from active card
    const getCardOpacity = (index) => {
        const distance = Math.abs(index - activeCardIndex);
        if (distance === 0) return 1;
        if (distance === 1) return 0.8;
        return 0.6;
    };

    // Get transform for card being dragged
    const getCardTransform = (index) => {
        const scale = getCardScale(index);

        if (index === dragCardIndex && isDragging) {
            return `translateX(${dragCurrentX}px) scale(${scale})`;
        }

        return `scale(${scale})`;
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

    return (
        <div className={`min-h-screen font-red-hat-display transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Top Bar */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#5E67AC] transition-all duration-500 ease-in-out
                           ${isTopBarExpanded ? 'h-screen' : 'h-20'} rounded-b-3xl shadow-lg`}
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
            </div>

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
            <main className={`pt-28 md:pt-32 px-4 md:px-6 pb-8 transition-all duration-300 ${isTopBarExpanded ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <h1 className={`text-3xl md:text-5xl font-black text-[#5E67AC] mb-8 md:mb-12 text-center`}>{getGreeting()}</h1>

                {/* Carousel Container */}
                <div
                    ref={carouselRef}
                    className="flex items-center justify-center h-[340px] md:h-[400px] mx-auto relative overflow-hidden"
                >
                    <div className="flex space-x-6 items-center px-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth">
                        {cardsData.map((card, index) => (
                            <div
                                key={card.id}
                                className="cursor-grab active:cursor-grabbing"
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onContextMenu={(e) => handleContextMenu(e, index)}
                                onTouchStart={() => {
                                    const timer = setTimeout(() => {
                                        handleLongTouch(index);
                                    }, 800);

                                    return () => clearTimeout(timer);
                                }}
                            >
                                <Link
                                    to={isDragging ? '#' : card.link}
                                    ref={cardRefs.current[index]}
                                    data-index={index}
                                    className={`flex-none w-64 h-80 md:w-72 md:h-96 rounded-[2rem] p-6
                                              transition-all duration-300 snap-center block
                                              ${activeCardIndex === index ? 'shadow-xl shadow-[#5E67AC]/30' : ''}
                                              ${dragCardIndex === index && isDragging ? 'ring-2 ring-white shadow-xl' : ''}
                                              hover:shadow-lg hover:shadow-[#5E67AC]/20`}
                                    style={{
                                        backgroundColor: '#5E67AC',
                                        transform: getCardTransform(index),
                                        opacity: getCardOpacity(index),
                                        zIndex: 10 - Math.abs(activeCardIndex - index)
                                    }}
                                    onClick={(e) => {
                                        if (isDragging) {
                                            e.preventDefault();
                                            return;
                                        }
                                        if (activeCardIndex !== index) {
                                            e.preventDefault();
                                            setActiveCardIndex(index);
                                        }
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-between h-full">
                                        <h2 className="text-2xl font-black text-white mb-4">{card.title}</h2>
                                        <div className="flex-1 flex items-center justify-center">
                                            <img
                                                src={card.icon}
                                                className={`w-28 h-28 md:w-32 md:h-32 filter drop-shadow-lg transition-transform duration-300 ${card.title === 'Archive' ? 'preserve-color' : ''}`}
                                                alt={card.title}
                                                style={{
                                                    transform: activeCardIndex === index ? 'scale(1.1)' : 'scale(1)'
                                                }}
                                                draggable="false"
                                            />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation dots */}
                <div className="flex justify-center mt-6 space-x-2">
                    {cardsData.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                                      ${activeCardIndex === index
                                    ? 'bg-[#5E67AC] w-6'
                                    : darkMode ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setActiveCardIndex(index)}
                        />
                    ))}
                </div>

                {/* Inspirational Quote */}
                <div className="mt-8 md:mt-10 text-center px-4 max-w-2xl mx-auto">
                    <div className={`${darkMode ? 'bg-gray-800/60' : 'bg-[#f1f3ff]'} rounded-2xl p-4 md:p-6 shadow-md`}>
                        <p className={`text-lg md:text-xl italic font-medium ${darkMode ? 'text-white/80' : 'text-[#5E67AC]'}`}>
                            "{inspirationalQuote}"
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;