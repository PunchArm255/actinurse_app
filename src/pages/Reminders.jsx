import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

const Reminders = () => {
    // Top bar and modal states (matching Home.jsx)
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

    // Reminders specific state
    const [reminders, setReminders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [reminderName, setReminderName] = useState('');
    const [reminderType, setReminderType] = useState('1');
    const [countdownMinutes, setCountdownMinutes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [notifications, setNotifications] = useState([]);

    // User and navigation
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-5, 5, -5],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

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
            setCurrentDate(now.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.modal-trigger') && !e.target.closest('.modal-content')) {
                setShowNotificationModal(false);
                setShowSettingsModal(false);
                setShowProfileModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



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

    const handleNotificationToggle = () => {
        setShowNotificationModal(!showNotificationModal);
        setShowSettingsModal(false);
        setShowProfileModal(false);

        // Mark notifications as read when opening
        if (!showNotificationModal) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        }
    };

    const handleSubmitFeedback = () => {
        setFeedback('');
        setRating(0);
        setShowSettingsModal(false);
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/signin');
        }
    };

    // Load reminders from localStorage
    useEffect(() => {
        const savedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
        console.log('📥 Loading reminders from localStorage:', savedReminders);
        setReminders(savedReminders);
    }, []);

    // Save reminders to localStorage
    useEffect(() => {
        console.log('💾 Saving reminders to localStorage:', reminders);
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Load notifications from localStorage
    useEffect(() => {
        const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        setNotifications(savedNotifications);
    }, []);

    // Save notifications to localStorage
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Check for expired/expiring reminders and create notifications
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date().getTime();
            const newNotifications = [];

            reminders.forEach(reminder => {
                if (reminder.completed) return;

                const expirationTime = new Date(reminder.expirationTime).getTime();
                const timeLeft = expirationTime - now;
                const minutesLeft = Math.floor(timeLeft / (1000 * 60));

                // Check if reminder is expired (within last 5 minutes)
                if (timeLeft <= 0 && timeLeft > -5 * 60 * 1000) {
                    const existingNotification = notifications.find(n =>
                        n.type === 'expired' && n.reminderId === reminder.id
                    );

                    if (!existingNotification) {
                        newNotifications.push({
                            id: Date.now().toString(),
                            type: 'expired',
                            title: 'Rappel expiré',
                            message: `Le rappel "${reminder.name}" a expiré`,
                            reminderId: reminder.id,
                            timestamp: new Date().toISOString(),
                            read: false
                        });
                    }
                }
                // Check if reminder is expiring soon (within 5 minutes)
                else if (timeLeft > 0 && minutesLeft <= 5) {
                    const existingNotification = notifications.find(n =>
                        n.type === 'expiring' && n.reminderId === reminder.id
                    );

                    if (!existingNotification) {
                        newNotifications.push({
                            id: Date.now().toString(),
                            type: 'expiring',
                            title: 'Rappel expirant bientôt',
                            message: `Le rappel "${reminder.name}" expire dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
                            reminderId: reminder.id,
                            timestamp: new Date().toISOString(),
                            read: false
                        });
                    }
                }
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => [...prev, ...newNotifications]);

                // Show browser notification if app is not focused
                if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                    newNotifications.forEach(notification => {
                        new Notification(notification.title, {
                            body: notification.message,
                            icon: '/favicon.ico',
                            tag: notification.reminderId
                        });
                    });
                }
            }
        };

        // Check immediately
        checkReminders();

        // Check every minute
        const interval = setInterval(checkReminders, 60 * 1000);

        return () => clearInterval(interval);
    }, [reminders, notifications]);

    // Clean up old notifications (older than 24 hours)
    useEffect(() => {
        const cleanupNotifications = () => {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            setNotifications(prev =>
                prev.filter(notification =>
                    new Date(notification.timestamp) > oneDayAgo
                )
            );
        };

        cleanupNotifications();
        const interval = setInterval(cleanupNotifications, 60 * 60 * 1000); // Every hour

        return () => clearInterval(interval);
    }, []);

    // Request notification permissions on component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Get time remaining for countdown
    const getTimeRemaining = (expirationTime) => {
        const now = new Date().getTime();
        const expiration = new Date(expirationTime).getTime();
        const timeLeft = expiration - now;

        if (timeLeft <= 0) return { expired: true, time: 'Expiré' };

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return {
            expired: false,
            time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        };
    };

    // Save reminder
    const handleSaveReminder = () => {
        if (!reminderName.trim() || !countdownMinutes.trim()) return;

        const minutes = parseInt(countdownMinutes);
        if (isNaN(minutes) || minutes <= 0) return;

        const expirationTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();

        const newReminder = {
            id: editingReminder ? editingReminder.id : Date.now().toString(),
            name: reminderName,
            type: reminderType,
            countdownMinutes: minutes,
            expirationTime,
            createdAt: new Date().toISOString(),
            completed: false
        };

        if (editingReminder) {
            setReminders(reminders.map(r => r.id === editingReminder.id ? newReminder : r));
            window.trackRemindersUX?.('edit_reminder', 'modal');
        } else {
            setReminders([...reminders, newReminder]);
            window.trackRemindersUX?.('create_reminder', 'modal');
        }

        setReminderName('');
        setReminderType('1');
        setCountdownMinutes('');
        setEditingReminder(null);
        setShowModal(false);
    };

    // Delete reminder
    const handleDeleteReminder = (id) => {
        setReminders(reminders.filter(r => r.id !== id));

        // Clear notifications for this reminder when deleted
        setNotifications(prev =>
            prev.filter(n => n.reminderId !== id)
        );

        window.trackRemindersUX?.('delete_reminder', 'card_action');
    };

    // Mark reminder as done
    const handleMarkDone = (id) => {
        setReminders(reminders.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
        ));

        // Clear notifications for this reminder when completed
        setNotifications(prev =>
            prev.filter(n => n.reminderId !== id)
        );

        window.trackRemindersUX?.('toggle_reminder', 'card_action');
    };

    // Edit reminder
    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setReminderName(reminder.name);
        setReminderType(reminder.type);
        setCountdownMinutes(reminder.countdownMinutes.toString());
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReminder(null);
        setReminderName('');
        setReminderType('1');
        setCountdownMinutes('');
    };

    // Filter and search reminders
    const filteredReminders = reminders.filter(reminder => {
        const matchesSearch = reminder.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' ||
            (filterType === 'active' && !reminder.completed) ||
            (filterType === 'completed' && reminder.completed);

        return matchesSearch && matchesFilter;
    });

    // Get reminder type label and color
    const getReminderTypeInfo = (type) => {
        const types = {
            '1': { label: 'Médicament', color: '#e63946', bgColor: '#ffe6e6' },
            '2': { label: 'Examen', color: '#1f9d55', bgColor: '#e6f4ea' },
            '3': { label: 'Soin', color: '#f4a623', bgColor: '#fff8e6' },
            '4': { label: 'Autre', color: '#5E67AC', bgColor: '#f1f3ff' }
        };
        return types[type] || types['4'];
    };

    // Calculate statistics
    const stats = {
        total: reminders.length,
        active: reminders.filter(r => !r.completed).length,
        completed: reminders.filter(r => r.completed).length,
        expired: reminders.filter(r => !r.completed && getTimeRemaining(r.expirationTime).expired).length
    };

    // UX Analytics and Validation Logs
    useEffect(() => {
        console.log('🔍 REMINDERS UX ANALYSIS:');
        console.log('📊 Current State:', {
            totalReminders: stats.total,
            activeReminders: stats.active,
            completedReminders: stats.completed,
            expiredReminders: stats.expired,
            hasReminders: stats.total > 0,
            searchTerm: searchTerm,
            filterType: filterType,
            filteredCount: filteredReminders.length,
            notificationsCount: notifications.length,
            unreadNotifications: notifications.filter(n => !n.read).length
        });

        console.log('🎯 UX Issues Detected:');
        console.log('- Duplicate create buttons:', stats.total === 0 ? 'YES (empty state + controls)' : 'NO');
        console.log('- Missing visual feedback:', 'YES (no confirmations/toasts)');
        console.log('- No urgency indicators:', stats.expired > 0 ? 'YES (expired reminders)' : 'N/A');
        console.log('- Contextual actions needed:', stats.total === 0 ? 'YES (different actions for empty state)' : 'N/A');

        // Track user interactions for UX validation
        const trackUXInteraction = (action, context) => {
            console.log(`🎯 UX INTERACTION: ${action} in ${context} at ${new Date().toLocaleTimeString()}`);
        };

        window.trackRemindersUX = trackUXInteraction;

        return () => {
            delete window.trackRemindersUX;
        };
    }, [stats, searchTerm, filterType, filteredReminders.length]);

    return (
        <motion.div
            className="min-h-screen font-red-hat-display bg-gray-50 text-gray-900 overflow-x-hidden relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Top Bar - Exact Home.jsx Version */}
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
                                    {notifications.filter(n => !n.read).length}
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
                                            <label className="block text-sm mb-1">Note</label>
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-white/30'}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 transition-colors text-sm font-medium"
                                            onClick={handleSubmitFeedback}
                                        >
                                            Envoyer
                                        </button>
                                    </div>
                                </div>

                                {/* Logout */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <button
                                        className="w-full bg-[#ffd3d3] hover:bg-[#ffbcbc] text-[#ac5e5e] rounded-lg py-2 transition-colors text-sm font-medium"
                                        onClick={handleLogout}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modals - Same as Home.jsx */}
            <AnimatePresence>
                {showNotificationModal && (
                    <motion.div
                        className="modal-content fixed top-24 right-6 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-gray-200 max-h-96 overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => setNotifications([])}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Tout effacer
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <p className="text-gray-600 text-sm">Aucune nouvelle notification</p>
                        ) : (
                            <div className="space-y-3">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border-l-4 ${notification.type === 'expired'
                                            ? 'bg-red-50 border-red-400'
                                            : 'bg-yellow-50 border-yellow-400'
                                            } ${notification.read ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-gray-900">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setNotifications(prev =>
                                                        prev.filter(n => n.id !== notification.id)
                                                    );
                                                }}
                                                className="text-gray-400 hover:text-gray-600 ml-2"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length > 5 && (
                                    <p className="text-xs text-gray-500 text-center">
                                        +{notifications.length - 5} autres notifications
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {showSettingsModal && (
                    <motion.div
                        className="modal-content fixed top-24 right-6 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-gray-200"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-gray-900 mb-3">Paramètres</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mode sombre</label>
                                <button
                                    className={`w-full rounded-lg py-2 px-3 text-sm font-medium transition-colors ${darkMode ? 'bg-[#5E67AC] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setDarkMode(!darkMode)}
                                >
                                    {darkMode ? 'Activé' : 'Désactivé'}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Taille de police</label>
                                <select
                                    className="w-full rounded-lg py-2 px-3 text-sm border border-gray-300 focus:border-[#5E67AC] focus:outline-none"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                >
                                    <option value="small">Petite</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}

                {showProfileModal && (
                    <motion.div
                        className="modal-content fixed top-24 right-6 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-gray-200"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={avatarUrl || profileSVG} className="w-12 h-12 rounded-full" alt="Profile" />
                            <div>
                                <h3 className="font-bold text-gray-900">{user?.name || 'Utilisateur'}</h3>
                                <p className="text-sm text-gray-600">{user?.email || 'email@example.com'}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">
                                Modifier le profil
                            </button>
                            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700">
                                Changer le mot de passe
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.main
                className="pt-28 md:pt-32 px-4 md:px-6 pb-8 relative z-10"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    variants={itemVariants}
                >
                    <motion.h1
                        className="text-3xl md:text-4xl font-black text-[#5E67AC] mb-2"
                        variants={floatingVariants}
                        animate="animate"
                    >
                        Rappels Intelligents
                    </motion.h1>
                    <p className="text-gray-600 text-lg">Gérez vos rappels et ne manquez jamais un traitement important</p>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                    variants={itemVariants}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-medium">Total</p>
                            <p className="text-2xl font-black text-[#5E67AC]">{stats.total}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-medium">Actifs</p>
                            <p className="text-2xl font-black text-[#1f9d55]">{stats.active}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-medium">Terminés</p>
                            <p className="text-2xl font-black text-[#f4a623]">{stats.completed}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    >
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-medium">Expirés</p>
                            <p className="text-2xl font-black text-[#e63946]">{stats.expired}</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
                    variants={itemVariants}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                placeholder="Rechercher un rappel..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    window.trackRemindersUX?.('search_input', e.target.value);
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-[#5E67AC] focus:outline-none text-sm"
                            />

                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    window.trackRemindersUX?.('filter_change', e.target.value);
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-[#5E67AC] focus:outline-none text-sm"
                            >
                                <option value="all">Tous</option>
                                <option value="active">Actifs</option>
                                <option value="completed">Terminés</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-2 bg-[#5E67AC] text-white rounded-lg font-medium hover:bg-[#4F5796] transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            + Nouveau Rappel
                        </button>
                    </div>
                </motion.div>

                {/* Reminders List */}
                <motion.div
                    className="space-y-4"
                    variants={itemVariants}
                >
                    {filteredReminders.length === 0 ? (
                        <motion.div
                            className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-6xl mb-4">⏰</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun rappel</h3>
                            <p className="text-gray-600 mb-4">Utilisez le bouton "Nouveau Rappel" ci-dessus pour commencer</p>
                        </motion.div>
                    ) : (
                        filteredReminders.map((reminder) => {
                            const timeRemaining = getTimeRemaining(reminder.expirationTime);
                            const typeInfo = getReminderTypeInfo(reminder.type);

                            return (
                                <motion.div
                                    key={reminder.id}
                                    className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-200 ${reminder.completed ? 'opacity-60' : ''
                                        }`}
                                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: typeInfo.bgColor }}
                                            >
                                                <span className="text-2xl">
                                                    {reminder.type === '1' ? '💊' :
                                                        reminder.type === '2' ? '🔬' :
                                                            reminder.type === '3' ? '🩺' : '📝'}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className={`font-bold text-lg ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                        {reminder.name}
                                                    </h3>
                                                    <span
                                                        className="px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            backgroundColor: typeInfo.bgColor,
                                                            color: typeInfo.color
                                                        }}
                                                    >
                                                        {typeInfo.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>⏱️ {reminder.countdownMinutes} min</span>
                                                    <span>📅 {new Date(reminder.createdAt).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {!reminder.completed && (
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${timeRemaining.expired ? 'text-red-600' : 'text-gray-900'
                                                        }`}>
                                                        {timeRemaining.time}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {timeRemaining.expired ? 'Expiré' : 'Restant'}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleMarkDone(reminder.id)}
                                                    className={`p-2 rounded-lg transition-colors ${reminder.completed
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {reminder.completed ? '✓' : '○'}
                                                </button>

                                                <button
                                                    onClick={() => handleEditReminder(reminder)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteReminder(reminder.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    className="text-center mt-8"
                    variants={itemVariants}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-[#5E67AC] text-white rounded-xl font-medium hover:bg-[#4F5796] transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        <span>← Retour à l'accueil</span>
                    </Link>
                </motion.div>
            </motion.main>

            {/* Add/Edit Reminder Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 w-full max-w-md"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {editingReminder ? 'Modifier le rappel' : 'Nouveau rappel'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du rappel
                                    </label>
                                    <input
                                        type="text"
                                        value={reminderName}
                                        onChange={(e) => setReminderName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5E67AC] focus:outline-none"
                                        placeholder="Ex: Prise de médicament"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={reminderType}
                                        onChange={(e) => setReminderType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5E67AC] focus:outline-none"
                                    >
                                        <option value="1">Médicament</option>
                                        <option value="2">Examen</option>
                                        <option value="3">Soin</option>
                                        <option value="4">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Durée (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={countdownMinutes}
                                        onChange={(e) => setCountdownMinutes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#5E67AC] focus:outline-none"
                                        placeholder="Ex: 30"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveReminder}
                                    className="flex-1 px-4 py-2 bg-[#5E67AC] text-white rounded-lg hover:bg-[#4F5796] transition-colors"
                                >
                                    {editingReminder ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Reminders;