import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.svg';
import { login } from '../lib/appwrite';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        console.log("Attempting login with:", { email });

        try {
            const result = await login(email, password);
            console.log("Login result:", result);

            if (result.success) {
                console.log("Successfully logged in");
                navigate('/home');
            } else {
                console.error("Login failed:", result.error);
                setErrorMessage(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 animate-fadeIn">
                <div className="flex flex-col items-center mb-8">
                    <Link to="/">
                        <img src={logo2} alt="ActiNurse Logo" className="w-32 mb-6" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-[#4f5796]">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#5E67AC] font-semibold hover:text-[#4F5796] transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
