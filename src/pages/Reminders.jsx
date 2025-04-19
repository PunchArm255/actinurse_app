import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

const Reminders = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [reminders, setReminders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [reminderName, setReminderName] = useState('');
    const [reminderType, setReminderType] = useState('1');
    const [countdownMinutes, setCountdownMinutes] = useState('');

    useEffect(() => {
        const savedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
        setReminders(savedReminders);

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    const getTimeRemaining = (expirationTime) => {
        const now = new Date().getTime();
        const total = expirationTime - now;
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

        return { total, hours, minutes, seconds };
    };

    const handleSaveReminder = () => {
        if (!reminderName.trim() || !countdownMinutes) return;

        const expirationTime = Date.now() + (countdownMinutes * 60 * 1000);
        const newReminder = {
            id: editingReminder?.id || Date.now().toString(),
            name: reminderName,
            type: reminderType,
            expirationTime,
            done: false
        };

        if (editingReminder) {
            setReminders(reminders.map(r => r.id === editingReminder.id ? newReminder : r));
        } else {
            setReminders([...reminders, newReminder]);
        }

        handleCloseModal();
    };

    const handleDeleteReminder = () => {
        setReminders(reminders.filter(r => r.id !== editingReminder.id));
        handleCloseModal();
    };

    const handleMarkDone = (id) => {
        setReminders(reminders.map(r =>
            r.id === id ? { ...r, done: true } : r
        ));
    };

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setReminderName(reminder.name);
        setReminderType(reminder.type);
        const minutesLeft = Math.floor((reminder.expirationTime - Date.now()) / (60 * 1000));
        setCountdownMinutes(minutesLeft > 0 ? minutesLeft : '');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReminder(null);
        setReminderName('');
        setReminderType('1');
        setCountdownMinutes('');
    };

    return (
        <div className="min-h-screen bg-[#f7f7f7] font-red-hat-display">
            {/* Top Bar */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#5e67ac] transition-all duration-300 ${isExpanded ? 'h-screen' : 'h-20'
                    } rounded-b-3xl shadow-lg cursor-pointer`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between h-20 px-6">
                    <img src={logo} alt="ActiNurse Logo" className="h-12 w-auto" />

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full hover:bg-[#F5F5F5]/20 transition-colors">
                            <img src={settingsIcon} className="w-6 h-6 filter drop-shadow-sm" alt="Settings" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-[#F5F5F5]/20 transition-colors">
                            <img src={notificationIcon} className="w-6 h-6 filter drop-shadow-sm" alt="Notifications" />
                        </button>
                        <div className="flex items-center bg-white/20 rounded-full pl-3 pr-4 gap-2">
                            <span className="text-[#F5F5F5] font-black text-sm">{currentTime}</span>
                            <img src={profileImage} className="w-10 h-10 rounded-full" alt="Profile" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="pt-32 px-10 py-8 ml-[100px]">
                <h1 className="text-5xl font-bold text-[#5e67ac] mb-4">A Vérifier</h1>

                <div className="w-full flex justify-between mb-8">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#cbd1ff] text-[#5e67ac] rounded-full py-2 px-6 hover:bg-[#b8bfff] transition-colors"
                    >
                        Ajouter un reminder
                    </button>
                    <Link
                        to="/"
                        className="bg-[#5e67ac] text-[#cbd1ff] rounded-full py-2 px-5 mr-11 hover:bg-[#4f5796] transition-colors"
                    >
                        Retour à l'accueil
                    </Link>
                </div>

                <div className="flex space-x-4">
                    {/* Reminders Container */}
                    <div className="w-[700px] h-[500px] bg-[#f1f3ff] rounded-3xl p-4 overflow-y-auto shadow-[0_0_50px_0.1px_#cbd1ff]">
                        {reminders.map(reminder => (
                            <div
                                key={reminder.id}
                                onClick={() => handleEditReminder(reminder)}
                                className={`bg-white p-4 rounded-2xl mb-4 relative border-l-[6px] cursor-pointer transition-opacity ${reminder.done ? 'opacity-50' : ''
                                    }`}
                                style={{
                                    borderColor: reminder.type === '1' ? '#ef4444' :
                                        reminder.type === '2' ? '#4ade80' : '#facc15'
                                }}
                            >
                                <h2 className={`text-[#5e67ac] text-xl font-bold ${reminder.done ? 'line-through' : ''
                                    }`}>
                                    {reminder.name}{reminder.done ? ' - DONE' : ''}
                                </h2>
                                {!reminder.done && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkDone(reminder.id);
                                        }}
                                        className="absolute top-2 right-2 bg-[#5e67ac] text-[#f1f3ff] rounded-full mt-1 py-1 px-3 hover:bg-[#4f5796] transition-colors"
                                    >
                                        Mark as done
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Countdown Container */}
                    <div className="w-[500px] h-[500px] bg-[#f1f3ff] rounded-3xl p-4 overflow-y-auto shadow-[0_0_50px_0.1px_#cbd1ff]">
                        {reminders.filter(r => !r.done).map(reminder => (
                            <CountdownTimer
                                key={reminder.id}
                                reminder={reminder}
                                onExpire={(id) => setReminders(prev => prev.filter(r => r.id !== id))}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#5e67ac]/30 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
                    <div className="bg-[#cbd1ff] p-6 rounded-3xl shadow-lg w-[500px] animate-slideUp">
                        <h2 className="text-2xl font-bold mb-2 ml-1 text-[#5e67ac]">
                            {editingReminder ? 'Modifier le reminder' : 'Ajouter un reminder'}
                        </h2>

                        <input
                            type="text"
                            value={reminderName}
                            onChange={(e) => setReminderName(e.target.value)}
                            className="w-full bg-[#f1f3ff] text-[#5e67ac] rounded-lg p-2 mb-4 placeholder:text-[#5e67ac]/50"
                            placeholder="Nom du reminder"
                        />

                        <div className="mb-4">
                            <label className="mr-4 text-[#5e67ac] text-xl ml-1">Catégorie:</label>
                            <select
                                value={reminderType}
                                onChange={(e) => setReminderType(e.target.value)}
                                className={`border bg-[#f1f3ff] rounded-lg p-2 ${reminderType === '1' ? 'text-red-400' :
                                        reminderType === '2' ? 'text-green-300' : 'text-yellow-300'
                                    }`}
                            >
                                <option value="1" className="text-red-400">Examens Paracliniques</option>
                                <option value="2" className="text-green-300">Traitement Reçu</option>
                                <option value="3" className="text-yellow-300">Soins Prodigués</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="text-[#5e67ac] text-xl ml-1">Countdown (minutes):</label>
                            <input
                                type="number"
                                value={countdownMinutes}
                                onChange={(e) => setCountdownMinutes(e.target.value)}
                                className="w-full bg-[#f1f3ff] text-[#5e67ac] rounded-lg p-2"
                                placeholder="Enter countdown in minutes"
                            />
                        </div>

                        <div className="flex space-x-2 justify-end">
                            <button
                                onClick={handleSaveReminder}
                                className="bg-[#5e67ac] text-[#cbd1ff] rounded-full py-2 px-4 hover:bg-[#4f5796] transition-colors"
                            >
                                {editingReminder ? 'Modifier' : 'Enregistrer'}
                            </button>
                            {editingReminder && (
                                <button
                                    onClick={handleDeleteReminder}
                                    className="bg-[#d55e5e] text-[#ffe1e1] rounded-full py-2 px-4 hover:bg-[#b84f4f] transition-colors"
                                >
                                    Supprimer
                                </button>
                            )}
                            <button
                                onClick={handleCloseModal}
                                className="bg-[#f1f3ff] text-[#5e67ac] rounded-full py-2 px-4 hover:bg-[#e0e2ff] transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CountdownTimer = ({ reminder, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = getTimeRemaining(reminder.expirationTime);
            setTimeLeft(remaining);

            if (remaining.total <= 0) {
                clearInterval(timer);
                onExpire(reminder.id);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [reminder.expirationTime, onExpire, reminder.id]);

    const getTimeRemaining = (expirationTime) => {
        const total = expirationTime - Date.now();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

        return { total, hours, minutes, seconds };
    };

    return (
        <div className={`bg-white p-4 rounded-2xl mb-4 shadow-lg ${reminder.type === '1' ? 'bg-red-100 text-red-500 shadow-[0_0_10px_0.1px_#ffcccc]' :
                reminder.type === '2' ? 'bg-green-100 text-green-500 shadow-[0_0_10px_0.1px_#ccffcc]' :
                    'bg-yellow-100 text-yellow-500 shadow-[0_0_10px_0.1px_#ffffcc]'
            }`}>
            <h2 className="text-xl font-bold">{reminder.name}</h2>
            {timeLeft.total > 0 ? (
                <p className="text-[#5e67ac]">
                    Time Left: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </p>
            ) : (
                <p className="text-[#d55e5e]">Expired</p>
            )}
        </div>
    );
};

export default Reminders;