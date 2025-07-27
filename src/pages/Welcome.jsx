import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.svg';

const Welcome = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

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
                            <img src={logo} alt="ActiNurse" className="h-8 w-8" />
                        </motion.div>
                        <div className="text-white">
                            <h1 className="text-2xl font-black">ActiNurse</h1>
                            <p className="text-xs opacity-70">v0.1.0 - Bêta</p>
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
        </div>
    );
};

export default Welcome;
