import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useHorizontalScroll } from '../hooks/useHorizontalScroll';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

// Import all card icons
import JournalIcon from '../assets/journal.svg';
import RemindersIcon from '../assets/reminders.svg';
import ProgressIcon from '../assets/progress.svg';
import ArchiveIcon from '../assets/archive.svg';
import StocksIcon from '../assets/stocks.svg';

const cardsData = [
    { id: '1', title: 'Journal', icon: JournalIcon, link: '/journal' },
    { id: '2', title: 'Reminders', icon: RemindersIcon, link: '/reminders' },
    { id: '3', title: 'Progress', icon: ProgressIcon, link: '/progress' },
    { id: '4', title: 'Archive', icon: ArchiveIcon, link: '/archive' },
    { id: '5', title: 'Stocks', icon: StocksIcon, link: '/stocks' }
];

const Home = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const scrollRef = useHorizontalScroll();

    const getGreeting = useCallback(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning!';
        if (hour < 18) return 'Good Afternoon!';
        return 'Good Evening!';
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display">
            {/* Top Bar */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#5E67AC] transition-all duration-300 ${isExpanded ? 'h-screen' : 'h-20'
                    } rounded-b-3xl shadow-lg cursor-pointer`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between h-20 px-6">
                    <img src={logo} alt="ActiNurse Logo" className="h-12 w-auto" />

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full hover:bg-secondary/20 transition-colors">
                            <img src={settingsIcon} className="w-6 h-6 filter drop-shadow-sm" alt="Settings" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-secondary/20 transition-colors">
                            <img src={notificationIcon} className="w-6 h-6 filter drop-shadow-sm" alt="Notifications" />
                        </button>
                        <div className="flex items-center bg-white/20 rounded-full pl-3 pr-4 gap-2">
                            <span className="text-secondary font-black text-sm">{currentTime}</span>
                            <img src={profileImage} className="w-10 h-10 rounded-full" alt="Profile" />
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-6 text-white animate-fadeIn">
                        {/* Newsletter/changelog content */}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="pt-32 px-6 pb-8">
                <h1 className="text-4xl font-black text-[#5E67AC] mb-8">{getGreeting()}</h1>

                {/* Cards Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
                >
                    {cardsData.map((card) => (
                        <Link
                            key={card.id}
                            to={card.link}
                            className="flex-none w-64 h-80 bg-[#5E67AC] rounded-3xl p-6
                transition-all duration-300 hover:shadow-xl hover:shadow-[#5E67AC]/30
                snap-center cursor-pointer hover:scale-105 active:scale-95"
                        >
                            <div className="flex flex-col items-center h-full">
                                <h2 className="text-2xl font-black text-white mb-4">{card.title}</h2>
                                <img
                                    src={card.icon}
                                    className="w-32 h-32 mt-auto filter drop-shadow-lg"
                                    alt={card.title}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Home;