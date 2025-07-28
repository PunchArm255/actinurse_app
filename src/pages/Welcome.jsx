import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoIcon from '../assets/logoIcon.svg';
import abirImage from '../assets/abir.png';
import mohammedImage from '../assets/mohammed.png';
import oumaimaImage from '../assets/oumaima.png';

const Welcome = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [showTeamModal, setShowTeamModal] = useState(false);

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

    const handleTeamModalToggle = () => {
        setShowTeamModal(!showTeamModal);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const features = [
        {
            icon: "📋",
            title: "Journal Médical",
            description: "Gérez vos actes médicaux en toute simplicité"
        },
        {
            icon: "⏰",
            title: "Rappels Intelligents",
            description: "Ne manquez jamais un traitement important"
        },
        {
            icon: "📊",
            title: "Suivi de Performance",
            description: "Analysez vos progrès avec des graphiques détaillés"
        },
        {
            icon: "📦",
            title: "Gestion de Stock",
            description: "Surveillez vos fournitures médicales"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#5E67AC] via-[#4F5796] to-[#3A4170] font-red-hat-display overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full"
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
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full"
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
                    className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/10 rounded-full"
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
            </div>

            {/* Header */}
            <motion.header
                className="relative z-10 px-6 py-6"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <motion.div
                        className="flex items-center space-x-3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <motion.div
                            className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20"
                            variants={floatingVariants}
                            animate="animate"
                        >
                            <img src={logoIcon} alt="ActiNurse" className="h-8 w-8" />
                        </motion.div>
                        <div className="text-white">
                            <h1 className="text-2xl font-black">ActiNurse</h1>
                            <p className="text-xs opacity-70">v0.2.5 - Prototype</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="text-white text-right hidden sm:block"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <p className="text-sm opacity-80">{currentDate}</p>
                        <p className="text-2xl font-bold">{currentTime}</p>
                    </motion.div>
                </div>
            </motion.header>

            {/* Main Content */}
            <motion.main
                className="relative z-10 px-6 py-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-6xl mx-auto text-center">
                    {/* Hero Section */}
                    <motion.div className="mb-16" variants={itemVariants}>
                        <motion.h2
                            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Votre Assistant
                            <motion.span
                                className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                Médical Intelligent
                            </motion.span>
                        </motion.h2>

                        <motion.p
                            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Optimisez votre pratique infirmière avec une plateforme intuitive
                            conçue pour simplifier vos tâches quotidiennes et améliorer les soins aux patients.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                            variants={itemVariants}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Link
                                    to="/signin"
                                    className="bg-white text-[#5E67AC] px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 inline-flex items-center space-x-2"
                                >
                                    <span>Commencer Maintenant</span>
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        →
                                    </motion.span>
                                </Link>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Link
                                    to="/signup"
                                    className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Créer un Compte
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={itemVariants}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                                whileHover={{
                                    scale: 1.05,
                                    y: -10,
                                    transition: { type: "spring", stiffness: 400 }
                                }}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                            >
                                <motion.div
                                    className="text-4xl mb-4"
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.2
                                    }}
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Footer CTA */}
                    <motion.div
                        className="mt-16 text-center"
                        variants={itemVariants}
                    >
                        <motion.p
                            className="text-white/60 text-sm"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Rejoignez des milliers d'infirmiers qui font confiance à ActiNurse
                        </motion.p>
                    </motion.div>

                    {/* About/Credits Button */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                    >
                        <motion.button
                            onClick={handleTeamModalToggle}
                            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/30 hover:bg-white/30"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.2)"
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
                </div>
            </motion.main>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <motion.div
                        className="w-1 h-3 bg-white rounded-full mt-2"
                        animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>
            </motion.div>

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
                                            <p className="text-green-600 font-medium mb-2">Conceptualisation & Organisation</p>
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
        </div>
    );
};

export default Welcome;
