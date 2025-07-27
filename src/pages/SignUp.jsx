import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAccount } from '../lib/appwrite';
import logo from '../assets/logo.svg';

const SignUp = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        hospital: '',
        department: '',
        experience: '',
        specialization: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.name.trim()) return 'Le nom est requis';
                if (!formData.email.trim()) return 'L\'email est requis';
                if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email invalide';
                return null;
            case 2:
                if (!formData.password) return 'Le mot de passe est requis';
                if (formData.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
                if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';
                return null;
            case 3:
                if (!formData.hospital.trim()) return 'L\'hôpital est requis';
                if (!formData.department.trim()) return 'Le service est requis';
                return null;
            default:
                return null;
        }
    };

    const nextStep = () => {
        const error = validateStep(currentStep);
        if (error) {
            setError(error);
            return;
        }
        setError('');
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateStep(3);
        if (error) {
            setError(error);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await createAccount(formData.email, formData.password, formData.name);
            if (result.success) {
                navigate('/home');
            } else {
                setError(result.error || 'Erreur lors de l\'inscription');
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

    const stepVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        exit: {
            x: -50,
            opacity: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    const experiences = [
        'Moins de 1 an',
        '1-3 ans',
        '3-5 ans',
        '5-10 ans',
        'Plus de 10 ans'
    ];

    const specializations = [
        'Soins généraux',
        'Soins intensifs',
        'Pédiatrie',
        'Gériatrie',
        'Chirurgie',
        'Urgences',
        'Psychiatrie',
        'Autre'
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Informations Personnelles</h2>
                            <p className="text-white/70">Commençons par vous connaître</p>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Nom Complet
                            </label>
                            <motion.input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                placeholder="Votre nom complet"
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Adresse Email
                            </label>
                            <motion.input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                placeholder="votre.email@exemple.com"
                                whileFocus={{ scale: 1.02 }}
                            />
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Sécurité</h2>
                            <p className="text-white/70">Créez un mot de passe sécurisé</p>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Mot de Passe
                            </label>
                            <div className="relative">
                                <motion.input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="••••••••"
                                    whileFocus={{ scale: 1.02 }}
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Confirmer le Mot de Passe
                            </label>
                            <div className="relative">
                                <motion.input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="••••••••"
                                    whileFocus={{ scale: 1.02 }}
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showConfirmPassword ? (
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
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="space-y-2">
                            <p className="text-white/70 text-xs">Force du mot de passe:</p>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <motion.div
                                        key={level}
                                        className={`h-2 flex-1 rounded-full ${formData.password.length >= level * 2
                                            ? level <= 2
                                                ? 'bg-red-400'
                                                : level === 3
                                                    ? 'bg-yellow-400'
                                                    : 'bg-green-400'
                                            : 'bg-white/20'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: level * 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step3"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Informations Professionnelles</h2>
                            <p className="text-white/70">Parlez-nous de votre expérience</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white font-semibold mb-2 text-sm">
                                    Hôpital/Clinique
                                </label>
                                <motion.input
                                    type="text"
                                    value={formData.hospital}
                                    onChange={(e) => handleInputChange('hospital', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Nom de l'établissement"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2 text-sm">
                                    Service
                                </label>
                                <motion.input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
                                    placeholder="Ex: Cardiologie"
                                    whileFocus={{ scale: 1.02 }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Expérience
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {experiences.map((exp) => (
                                    <motion.button
                                        key={exp}
                                        type="button"
                                        onClick={() => handleInputChange('experience', exp)}
                                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${formData.experience === exp
                                            ? 'bg-white text-[#5E67AC]'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {exp}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2 text-sm">
                                Spécialisation (optionnel)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {specializations.map((spec) => (
                                    <motion.button
                                        key={spec}
                                        type="button"
                                        onClick={() => handleInputChange('specialization', spec)}
                                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${formData.specialization === spec
                                            ? 'bg-white text-[#5E67AC]'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {spec}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
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
                        <img src={logo} alt="ActiNurse" className="w-full h-full" />
                    </motion.div>
                    <motion.h1
                        className="text-3xl font-black text-white mb-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        Rejoignez ActiNurse
                    </motion.h1>
                    <motion.p className="text-white/70 text-lg">
                        Créez votre compte en quelques étapes
                    </motion.p>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div className="mb-8" variants={itemVariants}>
                    <div className="flex justify-between items-center mb-4">
                        {[1, 2, 3].map((step) => (
                            <motion.div
                                key={step}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step <= currentStep
                                    ? 'bg-white text-[#5E67AC]'
                                    : 'bg-white/20 text-white/50'
                                    }`}
                                animate={{
                                    scale: step === currentStep ? 1.1 : 1
                                }}
                            >
                                {step}
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        {[1, 2, 3].map((step) => (
                            <motion.div
                                key={step}
                                className={`h-2 flex-1 rounded-full transition-all duration-300 ${step <= currentStep ? 'bg-white' : 'bg-white/20'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: step * 0.2 }}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
                    variants={itemVariants}
                >
                    <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-300 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {currentStep > 1 ? (
                                <motion.button
                                    type="button"
                                    onClick={prevStep}
                                    className="bg-white/20 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-300"
                                    whileHover={{ scale: 1.02, x: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    ← Précédent
                                </motion.button>
                            ) : (
                                <div></div>
                            )}

                            <motion.button
                                type={currentStep === 3 ? "submit" : "button"}
                                onClick={currentStep === 3 ? undefined : nextStep}
                                disabled={isLoading}
                                className="bg-white text-[#5E67AC] font-bold py-3 px-6 rounded-2xl hover:bg-white/90 disabled:opacity-50 transition-all duration-300 shadow-lg"
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? (
                                    <motion.div
                                        className="flex items-center space-x-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="w-5 h-5 border-2 border-[#5E67AC]/30 border-t-[#5E67AC] rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                        <span>Inscription...</span>
                                    </motion.div>
                                ) : currentStep === 3 ? (
                                    'Créer le Compte'
                                ) : (
                                    'Suivant →'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>

                {/* Sign In Link */}
                <motion.div className="text-center mt-6" variants={itemVariants}>
                    <p className="text-white/70">
                        Déjà un compte?{' '}
                        <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                            <Link
                                to="/signin"
                                className="text-white font-semibold hover:text-yellow-300 transition-colors"
                            >
                                Se connecter
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

export default SignUp;
