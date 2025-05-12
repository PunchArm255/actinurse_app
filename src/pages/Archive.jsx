import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.svg';

const Archive = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [archivedActes, setArchivedActes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredActes, setFilteredActes] = useState([]);
    const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
    const [selectedActe, setSelectedActe] = useState(null);

    // Load archived actes on component mount
    useEffect(() => {
        const loadArchivedActes = () => {
            const savedArchivedActes = JSON.parse(localStorage.getItem('archivedActes')) || [];
            setArchivedActes(savedArchivedActes);
            setFilteredActes(savedArchivedActes);
        };

        loadArchivedActes();

        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Filter actes when search query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredActes(archivedActes);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = archivedActes.filter(acte =>
            (acte.name && acte.name.toLowerCase().includes(query)) ||
            (acte.patientName && acte.patientName.toLowerCase().includes(query)) ||
            (acte.patientNumber && acte.patientNumber.toLowerCase().includes(query)) ||
            (acte.diagnostic && acte.diagnostic.toLowerCase().includes(query))
        );

        setFilteredActes(filtered);
    }, [searchQuery, archivedActes]);

    const handleUnarchiveActe = () => {
        if (!selectedActe) return;

        // Get existing tasks
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};

        // Get room and bed from the archived acte
        const roomKey = `room_${selectedActe.room}`;
        const bedKey = `bed_${selectedActe.bed}`;

        // Ensure the room and bed exist in the tasks structure
        if (!tasks[roomKey]) {
            tasks[roomKey] = {};
        }

        if (!tasks[roomKey][bedKey]) {
            tasks[roomKey][bedKey] = [];
        }

        // Remove from archived actes
        const newArchivedActes = archivedActes.filter(acte => acte.id !== selectedActe.id);

        // Add to tasks
        const unarchived = { ...selectedActe };
        delete unarchived.room;
        delete unarchived.bed;
        tasks[roomKey][bedKey].push(unarchived);

        // Save both updated collections
        localStorage.setItem('archivedActes', JSON.stringify(newArchivedActes));
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Update state
        setArchivedActes(newArchivedActes);
        setFilteredActes(newArchivedActes);

        // Close modal
        setShowUnarchiveModal(false);
        setSelectedActe(null);
    };

    const openUnarchiveModal = (acte) => {
        setSelectedActe(acte);
        setShowUnarchiveModal(true);
    };

    const closeUnarchiveModal = () => {
        setShowUnarchiveModal(false);
        setSelectedActe(null);
    };

    const getTaskColor = (type) => {
        switch (type) {
            case '1': return 'bg-[#ffd3d3]';
            case '2': return 'bg-[#d3ffda]';
            case '3': return 'bg-[#fff3b3]';
            default: return 'bg-[#f1f3ff]';
        }
    };

    const getTaskTextColor = (type) => {
        switch (type) {
            case '1': return 'text-[#ac5e5e]';
            case '2': return 'text-[#437d4f]';
            case '3': return 'text-[#8c8325]';
            default: return 'text-[#5e67ac]';
        }
    };

    const getTaskTypeLabel = (type) => {
        switch (type) {
            case '1': return 'Examen Paraclinique';
            case '2': return 'Traitement Reçu';
            case '3': return 'Soin Prodigué';
            default: return 'Acte';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display">
            {/* Top Bar */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#5E67AC] transition-all duration-300 
                          ${isExpanded ? 'h-screen' : 'h-20'} rounded-b-3xl shadow-lg cursor-pointer`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between h-20 px-4 md:px-6">
                    <img src={logo} alt="ActiNurse Logo" className="h-10 md:h-12 w-auto" />

                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="p-1 md:p-2 rounded-full hover:bg-secondary/20 transition-colors">
                            <img src={settingsIcon} className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-sm" alt="Settings" />
                        </button>
                        <button className="p-1 md:p-2 rounded-full hover:bg-secondary/20 transition-colors">
                            <img src={notificationIcon} className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-sm" alt="Notifications" />
                        </button>
                        <div className="flex items-center bg-white/20 rounded-full pl-2 md:pl-3 pr-2 md:pr-4 gap-1 md:gap-2">
                            <span className="text-secondary font-black text-xs md:text-sm">{currentTime}</span>
                            <img src={profileImage} className="w-8 h-8 md:w-10 md:h-10 rounded-full" alt="Profile" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="pt-24 md:pt-32 px-4 md:px-10 pb-8 max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[#5e67ac] mb-4 md:mb-8">Archives</h1>

                <div className="w-full flex flex-col sm:flex-row gap-4 sm:justify-between mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un acte archivé..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white rounded-full py-2 px-6 pr-12 w-full sm:w-[400px] focus:outline-none focus:ring-2 focus:ring-[#5e67ac] shadow-md text-gray-700"
                        />
                        <svg
                            className="w-5 h-5 absolute right-5 top-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <Link
                        to="/journal"
                        className="bg-[#5e67ac] text-[#cbd1ff] rounded-full py-2 px-6 hover:bg-[#4f5796] transition-colors text-center sm:text-left"
                    >
                        Retour au Journal
                    </Link>
                </div>

                {/* Archive Content */}
                <div className="bg-[#f1f3ff] rounded-3xl p-4 md:p-6 shadow-[0_0_50px_0.1px_#cbd1ff]">
                    {filteredActes.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <svg
                                className="w-20 h-20 mx-auto mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                ></path>
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">Aucun acte archivé</h3>
                            <p>Les actes archivés depuis le journal apparaîtront ici.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredActes.map((acte) => (
                                <div
                                    key={acte.id}
                                    className={`${getTaskColor(acte.type)} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className={`font-bold text-xl ${getTaskTextColor(acte.type)}`}>{acte.name}</h3>
                                            <span className="text-gray-600 text-sm">
                                                {getTaskTypeLabel(acte.type)}
                                            </span>
                                        </div>
                                        <div className="bg-white/60 rounded-lg px-3 py-1 text-xs">
                                            Chambre {acte.room}, Lit {acte.bed}
                                        </div>
                                    </div>

                                    {acte.patientName && (
                                        <div className="mb-2">
                                            <span className="font-semibold">Patient:</span> {acte.patientName}
                                            {acte.patientNumber && ` (${acte.patientNumber})`}
                                        </div>
                                    )}

                                    {acte.diagnostic && (
                                        <div className="mb-2">
                                            <span className="font-semibold">Diagnostic:</span> {acte.diagnostic}
                                        </div>
                                    )}

                                    {acte.doctorName && (
                                        <div className="mb-2">
                                            <span className="font-semibold">Médecin:</span> {acte.doctorName}
                                            {acte.doctorShift && ` (${acte.doctorShift})`}
                                        </div>
                                    )}

                                    {acte.nurseName && (
                                        <div className="mb-2">
                                            <span className="font-semibold">Infirmier(e):</span> {acte.nurseName}
                                            {acte.nurseShift && ` (${acte.nurseShift})`}
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Archivé le: {new Date(acte.archivedDate).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => openUnarchiveModal(acte)}
                                            className="bg-white rounded-full px-4 py-1.5 font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            Désarchiver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Unarchive Modal */}
            {showUnarchiveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-[500px] max-w-[95vw]">
                        <h2 className="text-2xl font-bold text-[#5e67ac] mb-4">Confirmation</h2>
                        <p className="mb-6 text-gray-700">
                            Êtes-vous sûr de vouloir désarchiver cet acte et le renvoyer à la chambre {selectedActe?.room}, lit {selectedActe?.bed} ?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeUnarchiveModal}
                                className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUnarchiveActe}
                                className="px-6 py-2 rounded-full bg-[#5e67ac] hover:bg-[#4f5796] transition-colors text-white"
                            >
                                Désarchiver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archive;