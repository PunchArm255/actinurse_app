import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import { createAccount, uploadAvatar, createOrUpdateProfile } from '../lib/appwrite';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatar(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        console.log("Starting account creation with:", { email, password, name: fullName });

        try {
            // 1. Create account
            const result = await createAccount(email, password, fullName);
            if (result.success) {
                let avatarFileId = null;
                // 2. If avatar file is selected, upload to Appwrite Storage
                if (avatarFile) {
                    const uploadResult = await uploadAvatar(avatarFile);
                    avatarFileId = uploadResult.$id;
                }
                // 3. Save profile with avatarFileId
                await createOrUpdateProfile(result.user.$id, avatarFileId);
                if (result.loginFailed) {
                    setErrorMessage(result.error);
                    setTimeout(() => { navigate('/signin'); }, 3000);
                } else {
                    navigate('/home');
                }
            } else {
                setErrorMessage(result.error);
            }
        } catch (error) {
            console.error('Account creation error:', error);
            setErrorMessage(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display flex flex-col items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 animate-fadeIn">
                <div className="flex flex-col items-center mb-6">
                    <Link to="/">
                        <img src={logo2} alt="ActiNurse Logo" className="w-32 mb-6" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-[#4f5796]">Create Account</h1>
                    <p className="text-gray-500 mt-2">Join ActiNurse today</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div
                            onClick={triggerFileInput}
                            className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#cbd1ff] cursor-pointer
                        transition-all duration-300 hover:border-[#5E67AC] group"
                        >
                            <img
                                src={avatar || profileSVG}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[#5E67AC]/60 flex items-center justify-center 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="text-white text-xs font-semibold">Upload Photo</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-[#4f5796] font-semibold mb-1 ml-1">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-3 
                       border border-[#cbd1ff] focus:border-[#4f5796] outline-none 
                       transition-colors placeholder:text-[#4f5796]/50"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="userId" className="block text-[#4f5796] font-semibold mb-1 ml-1">
                            ID Number
                        </label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-3 
                       border border-[#cbd1ff] focus:border-[#4f5796] outline-none 
                       transition-colors placeholder:text-[#4f5796]/50"
                            placeholder="Employee ID or Student ID"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-[#4f5796] font-semibold mb-1 ml-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-3 
                       border border-[#cbd1ff] focus:border-[#4f5796] outline-none 
                       transition-colors placeholder:text-[#4f5796]/50"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-[#4f5796] font-semibold mb-1 ml-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-3 
                       border border-[#cbd1ff] focus:border-[#4f5796] outline-none 
                       transition-colors placeholder:text-[#4f5796]/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#5E67AC] text-white rounded-full py-3 px-6 
                        font-semibold text-lg shadow-md 
                        hover:bg-[#4F5796] transition-all duration-300 
                        transform hover:scale-105 active:scale-95
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-[#5E67AC] font-semibold hover:text-[#4F5796] transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
