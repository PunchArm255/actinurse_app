import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { logout, getCurrentUser, getProfile, getAvatarUrl } from '../lib/appwrite';

const Progress = () => {
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

    // Progress specific states
    const [activeFilter, setActiveFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('week');
    const [chartType, setChartType] = useState('line');

    // Refs
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

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

    // Get tasks from localStorage
    const getTasks = () => {
        return JSON.parse(localStorage.getItem('tasks')) || {};
    };

    // Filter tasks by type
    const filterTasksByType = (type) => {
        const tasks = getTasks();
        const allTasks = [];

        Object.values(tasks).forEach(rooms => {
            Object.values(rooms).forEach(actes => {
                allTasks.push(...actes);
            });
        });

        if (type === 'all') return allTasks;

        const typeMapping = {
            examens: '1',
            traitement: '2',
            soins: '3',
        };

        return allTasks.filter((task) => task.type === typeMapping[type]);
    };

    // Get data by time range
    const getDataByTimeRange = (filteredTasks, range) => {
        const now = new Date();
        const days = [];
        const counts = [];

        if (range === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));

                const dayCount = filteredTasks.filter(task => {
                    if (!task.date) return false;
                    const taskDate = new Date(task.date);
                    return taskDate.toDateString() === date.toDateString();
                }).length;

                counts.push(dayCount);
            }
        } else if (range === 'month') {
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                days.push(date.getDate().toString());

                const dayCount = filteredTasks.filter(task => {
                    if (!task.date) return false;
                    const taskDate = new Date(task.date);
                    return taskDate.toDateString() === date.toDateString();
                }).length;

                counts.push(dayCount);
            }
        }

        return { days, counts };
    };

    // Update chart
    useEffect(() => {
        if (!chartRef.current) return;

        const filteredTasks = filterTasksByType(activeFilter);
        const { days, counts } = getDataByTimeRange(filteredTasks, timeRange);

        // Track chart interactions
        window.trackProgressUX?.('chart_update', `${activeFilter}_${timeRange}_${chartType}`);

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(94, 103, 172, 0.8)');
        gradient.addColorStop(1, 'rgba(94, 103, 172, 0.1)');

        chartInstance.current = new Chart(ctx, {
            type: chartType,
            data: {
                labels: days,
                datasets: [{
                    label: 'Actes Médicaux',
                    data: counts,
                    backgroundColor: chartType === 'line' ? gradient : 'rgba(94, 103, 172, 0.8)',
                    borderColor: '#5E67AC',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#5E67AC',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.4,
                    fill: chartType === 'line',
                    borderRadius: chartType === 'bar' ? 8 : 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#5E67AC',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return `${context.parsed.y} acte${context.parsed.y > 1 ? 's' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                family: 'Red Hat Display',
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6B7280',
                            font: {
                                family: 'Red Hat Display',
                                size: 12
                            },
                            callback: function (value) {
                                return value + ' acte' + (value > 1 ? 's' : '');
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [activeFilter, timeRange, chartType]);

    // Calculate statistics
    const calculateStats = () => {
        const allTasks = filterTasksByType('all');
        const today = new Date().toDateString();

        const todayTasks = allTasks.filter(task => {
            if (!task.date) return false;
            return new Date(task.date).toDateString() === today;
        });

        const totalTasks = allTasks.length;
        const todayCount = todayTasks.length;
        const weeklyAverage = Math.round(totalTasks / 7);

        return { totalTasks, todayCount, weeklyAverage };
    };

    const stats = calculateStats();

    // UX Analytics and Validation Logs
    useEffect(() => {
        console.log('🔍 PROGRESS UX ANALYSIS:');
        console.log('📊 Current State:', {
            activeFilter: activeFilter,
            timeRange: timeRange,
            chartType: chartType,
            totalTasks: stats.totalTasks,
            todayCount: stats.todayCount,
            weeklyAverage: stats.weeklyAverage,
            hasData: stats.totalTasks > 0
        });

        console.log('🎯 UX Issues Detected:');
        console.log('- Chart controls clarity:', 'NEEDS IMPROVEMENT (filter buttons could be clearer)');
        console.log('- Missing visual feedback:', 'YES (no loading states for chart updates)');
        console.log('- No data guidance:', stats.totalTasks === 0 ? 'YES (no guidance when no data)' : 'N/A');
        console.log('- Filter complexity:', 'YES (multiple filter options might be overwhelming)');

        // Track user interactions for UX validation
        const trackUXInteraction = (action, context) => {
            console.log(`🎯 UX INTERACTION: ${action} in ${context} at ${new Date().toLocaleTimeString()}`);
        };

        window.trackProgressUX = trackUXInteraction;

        return () => {
            delete window.trackProgressUX;
        };
    }, [activeFilter, timeRange, chartType, stats]);

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
                        className="modal-content fixed top-24 right-6 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50 border border-gray-200"
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="font-bold text-gray-900 mb-3">Notifications</h3>
                        <p className="text-gray-600 text-sm">Aucune nouvelle notification</p>
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
                        Suivi de Performance
                    </motion.h1>
                    <p className="text-gray-600 text-lg">Analysez vos progrès et performances</p>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    variants={itemVariants}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Actes</p>
                                <p className="text-3xl font-black text-[#5E67AC]">{stats.totalTasks}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#5E67AC]/10 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Aujourd'hui</p>
                                <p className="text-3xl font-black text-[#1f9d55]">{stats.todayCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#1f9d55]/10 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📅</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Moyenne Hebdo</p>
                                <p className="text-3xl font-black text-[#f4a623]">{stats.weeklyAverage}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#f4a623]/10 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Chart Controls */}
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
                    variants={itemVariants}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
                            <div className="flex space-x-2">
                                {[
                                    { key: 'all', label: 'Tous', color: '#5E67AC' },
                                    { key: 'examens', label: 'Examens', color: '#e63946' },
                                    { key: 'traitement', label: 'Traitement', color: '#1f9d55' },
                                    { key: 'soins', label: 'Soins', color: '#f4a623' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => {
                                            setActiveFilter(filter.key);
                                            window.trackProgressUX?.('filter_change', filter.key);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter.key
                                            ? 'text-white shadow-lg'
                                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        style={{
                                            backgroundColor: activeFilter === filter.key ? filter.color : undefined
                                        }}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Période:</span>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#5E67AC] focus:outline-none text-sm"
                                >
                                    <option value="week">Semaine</option>
                                    <option value="month">Mois</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">Type:</span>
                                <select
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#5E67AC] focus:outline-none text-sm"
                                >
                                    <option value="line">Ligne</option>
                                    <option value="bar">Barres</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Chart */}
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    variants={itemVariants}
                >
                    <div className="h-80 md:h-96">
                        <canvas ref={chartRef}></canvas>
                    </div>
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
        </motion.div>
    );
};

export default Progress;