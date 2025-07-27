import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';

const LoadingScreen = () => {
    return (
        <motion.div
            className="fixed inset-0 bg-gradient-to-br from-[#5E67AC] to-[#4F5796] flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
                {/* Logo with animation */}
                <motion.div className="mb-8 relative">
                    <motion.div
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="relative bg-white/10 backdrop-blur-sm rounded-full p-8 border border-white/20"
                        animate={{
                            rotate: [0, 360],
                            borderColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.2)"]
                        }}
                        transition={{
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            borderColor: { duration: 2, repeat: Infinity }
                        }}
                    >
                        <motion.img
                            src={logo}
                            alt="ActiNurse Logo"
                            className="h-16 w-16 md:h-20 md:w-20 mx-auto"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>
                </motion.div>

                {/* App name */}
                <motion.h1
                    className="text-3xl md:text-4xl font-black text-white mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    ActiNurse
                </motion.h1>
                <motion.p
                    className="text-white/80 text-lg mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                >
                    Votre assistant médical intelligent
                </motion.p>

                {/* Loading animation */}
                <motion.div
                    className="flex justify-center space-x-2 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-3 h-3 bg-white rounded-full"
                            animate={{
                                y: [-8, 8, -8],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: index * 0.1,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </motion.div>

                {/* Loading text */}
                <motion.p
                    className="text-white/60 text-sm"
                    animate={{
                        opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    Chargement en cours...
                </motion.p>

                {/* Progress bar */}
                <motion.div
                    className="mt-6 w-64 mx-auto"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 256, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                >
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="bg-white h-full rounded-full"
                            animate={{
                                x: [-256, 256],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                </motion.div>

                {/* Version info */}
                <motion.div
                    className="mt-8 text-white/50 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                >
                    Version 0.1.0 - Bêta
                </motion.div>
            </motion.div>

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <style jsx>{`
                @keyframes loadingProgress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </motion.div>
    );
};

export default LoadingScreen; 