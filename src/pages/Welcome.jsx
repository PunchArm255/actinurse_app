import { Link } from 'react-router-dom';
import logo2 from '../assets/logo2.svg';

const Welcome = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md flex flex-col items-center animate-fadeIn">
                {/* Logo */}
                <img src={logo2} alt="ActiNurse Logo" className="w-48 md:w-64 mb-12 animate-pulse" />

                {/* Continue Button */}
                <Link
                    to="/signin"
                    className="bg-[#5E67AC] text-white w-full py-3 px-6 rounded-full
                   hover:bg-[#4F5796] transition-all duration-300 ease-in-out
                   text-center font-semibold text-lg shadow-lg
                   transform hover:scale-105 active:scale-95"
                >
                    Continue with Email
                </Link>
            </div>
        </div>
    );
};

export default Welcome;
