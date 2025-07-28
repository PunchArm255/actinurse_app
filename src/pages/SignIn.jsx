import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/appwrite';
import logoIcon from '../assets/logoIcon.svg';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || 'Erreur de connexion');
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

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

    const formVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#5E67AC] via-[#4F5796] to-[#3A4170] font-red-hat-display flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
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
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="text-center mb-8" variants={itemVariants}>
                    <motion.div
                        className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-6 border border-white/20"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img src={logoIcon} alt="ActiNurse" className="w-full h-full" />
                    </motion.div>
                    <motion.h1
                        className="text-3xl font-black text-white mb-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        Bon Retour!
                    </motion.h1>
                    <motion.p className="text-white/70 text-lg">
                        Connectez-vous à votre compte ActiNurse
                    </motion.p>
                </motion.div>

                {/* Form */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
                    variants={formVariants}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Adresse Email
                            </label>
                            <motion.div
                                className="relative"
                                whileFocus={{ scale: 1.02 }}
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="votre.email@exemple.com"
                                    required
                                />
                                <motion.div
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: email ? 1 : 0 }}
                                >
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Mot de Passe
                            </label>
                            <motion.div
                                className="relative"
                                whileFocus={{ scale: 1.02 }}
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-300 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-[#5E67AC] font-bold py-3 px-6 rounded-2xl hover:bg-white/90 disabled:opacity-50 transition-all duration-300 shadow-lg"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            variants={itemVariants}
                        >
                            {isLoading ? (
                                <motion.div
                                    className="flex items-center justify-center space-x-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className="w-5 h-5 border-2 border-[#5E67AC]/30 border-t-[#5E67AC] rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Connexion...</span>
                                </motion.div>
                            ) : (
                                'Se Connecter'
                            )}
                        </motion.button>

                        {/* Forgot Password */}
                        <motion.div className="text-center" variants={itemVariants}>
                            <motion.button
                                type="button"
                                className="text-white/70 hover:text-white text-sm transition-colors"
                                whileHover={{ scale: 1.05 }}
                            >
                                Mot de passe oublié?
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div className="text-center mt-6" variants={itemVariants}>
                    <p className="text-white/70">
                        Pas encore de compte?{' '}
                        <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                            <Link
                                to="/signup"
                                className="text-white font-semibold hover:text-yellow-300 transition-colors"
                            >
                                Créer un compte
                            </Link>
                        </motion.span>
                    </p>
                </motion.div>

                {/* Back to Welcome */}
                <motion.div className="text-center mt-4" variants={itemVariants}>
                    <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                        <Link
                            to="/"
                            className="text-white/50 hover:text-white/80 text-sm transition-colors inline-flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Retour à l'accueil</span>
                        </Link>
                    </motion.span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SignIn;
