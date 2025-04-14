// src/pages/Welcome.jsx
import { Link } from 'react-router-dom';

export default function Welcome() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-8">Welcome to ActiNurse</h1>
            <div className="flex gap-4">
                <Link to="/signin" className="px-6 py-3 bg-blue-500 text-white rounded-lg">
                    Sign In
                </Link>
                <Link to="/signup" className="px-6 py-3 bg-green-500 text-white rounded-lg">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}