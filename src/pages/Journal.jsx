import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

const Journal = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [tasks, setTasks] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [highlightedActe, setHighlightedActe] = useState(null);
    const searchRef = useRef(null);

    // Basic acte info
    const [taskName, setTaskName] = useState('');
    const [taskType, setTaskType] = useState('1');

    // New patient information fields
    const [patientName, setPatientName] = useState('');
    const [patientNumber, setPatientNumber] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [doctorShift, setDoctorShift] = useState('');
    const [nurseName, setNurseName] = useState('');
    const [nurseShift, setNurseShift] = useState('');
    const [diagnostic, setDiagnostic] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [dischargeDate, setDischargeDate] = useState('');

    // Room and bed selection
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBed, setSelectedBed] = useState('1');

    // Load tasks on component mount
    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
        setTasks(savedTasks);

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Search functionality
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = [];
        const query = searchQuery.toLowerCase();

        // Search through all rooms and beds
        Object.keys(tasks).forEach(roomKey => {
            const roomNum = roomKey.split('_')[1];

            Object.keys(tasks[roomKey]).forEach(bedKey => {
                const bedNum = bedKey.split('_')[1];

                tasks[roomKey][bedKey].forEach(acte => {
                    // Search by name or patient info
                    if ((acte.name && acte.name.toLowerCase().includes(query)) ||
                        (acte.patientName && acte.patientName.toLowerCase().includes(query)) ||
                        (acte.patientNumber && acte.patientNumber.toLowerCase().includes(query))) {

                        results.push({
                            ...acte,
                            room: roomNum,
                            bed: bedNum
                        });
                    }
                });
            });
        });

        setSearchResults(results);
        setShowSearchResults(results.length > 0);
    }, [searchQuery, tasks]);

    // Clear search when navigating to a room
    useEffect(() => {
        if (selectedRoom) {
            setSearchQuery('');
            setShowSearchResults(false);
        }
    }, [selectedRoom]);

    // Navigate to a specific acte's room and bed
    const navigateToActe = (acte) => {
        setSelectedRoom(acte.room);
        setSelectedBed(acte.bed);
        setHighlightedActe(acte.id);

        // Clear highlight after a few seconds
        setTimeout(() => {
            setHighlightedActe(null);
        }, 3000);
    };

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Click outside handler for search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleSaveTask = () => {
        if (!taskName.trim() || !selectedRoom || !selectedBed) return;

        const roomKey = `room_${selectedRoom}`;
        const bedKey = `bed_${selectedBed}`;

        const newTask = {
            id: editingTask?.id || Date.now().toString(),
            name: taskName,
            type: taskType,
            date: new Date().toLocaleString(),
            patientName,
            patientNumber,
            doctorName,
            doctorShift,
            nurseName,
            nurseShift,
            diagnostic,
            admissionDate,
            dischargeDate
        };

        const updatedTasks = { ...tasks };

        if (!updatedTasks[roomKey]) {
            updatedTasks[roomKey] = {};
        }

        if (!updatedTasks[roomKey][bedKey]) {
            updatedTasks[roomKey][bedKey] = [];
        }

        if (editingTask) {
            updatedTasks[roomKey][bedKey] = updatedTasks[roomKey][bedKey].map(t =>
                t.id === editingTask.id ? newTask : t
            );
        } else {
            updatedTasks[roomKey][bedKey] = [...updatedTasks[roomKey][bedKey], newTask];
        }

        setTasks(updatedTasks);
        handleCloseModal();
    };

    const handleDeleteTask = () => {
        if (!selectedRoom || !selectedBed || !editingTask) return;

        const roomKey = `room_${selectedRoom}`;
        const bedKey = `bed_${selectedBed}`;

        const updatedTasks = { ...tasks };

        if (updatedTasks[roomKey] && updatedTasks[roomKey][bedKey]) {
            updatedTasks[roomKey][bedKey] = updatedTasks[roomKey][bedKey].filter(
                t => t.id !== editingTask.id
            );
            setTasks(updatedTasks);
        }

        handleCloseModal();
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskName(task.name);
        setTaskType(task.type);
        setPatientName(task.patientName || '');
        setPatientNumber(task.patientNumber || '');
        setDoctorName(task.doctorName || '');
        setDoctorShift(task.doctorShift || '');
        setNurseName(task.nurseName || '');
        setNurseShift(task.nurseShift || '');
        setDiagnostic(task.diagnostic || '');
        setAdmissionDate(task.admissionDate || '');
        setDischargeDate(task.dischargeDate || '');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setTaskName('');
        setTaskType('1');
        setPatientName('');
        setPatientNumber('');
        setDoctorName('');
        setDoctorShift('');
        setNurseName('');
        setNurseShift('');
        setDiagnostic('');
        setAdmissionDate('');
        setDischargeDate('');
    };

    const handleSelectRoom = (roomNumber) => {
        setSelectedRoom(roomNumber);
        // Default to bed 1 when selecting a room
        setSelectedBed('1');
    };

    const handleBackToRooms = () => {
        setSelectedRoom(null);
        setSelectedBed('1');
    };

    // Get current tasks for the selected room and bed
    const getCurrentTasks = () => {
        if (!selectedRoom || !selectedBed) return [];

        const roomKey = `room_${selectedRoom}`;
        const bedKey = `bed_${selectedBed}`;

        return (tasks[roomKey]?.[bedKey] || []);
    };

    // Check if it's an isolation room
    const isIsolationRoom = (roomNumber) => roomNumber > 16;

    // Generate room buttons
    const renderRoomButtons = () => {
        const regularRooms = Array.from({ length: 16 }, (_, i) => i + 1);
        const isolationRooms = [17, 18];

        return (
            <div className="w-full h-full flex flex-col overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {regularRooms.map((room) => (
                        <button
                            key={room}
                            onClick={() => handleSelectRoom(room)}
                            className="bg-[#cbd1ff] text-[#4f5796] rounded-xl py-4 
                                      hover:bg-[#b8bfff] transition-colors 
                                      aspect-square flex items-center justify-center
                                      text-xl font-bold shadow-md"
                        >
                            Salle {room}
                        </button>
                    ))}
                </div>

                <div className="w-full border-t-2 border-[#4f5796] my-4"></div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    {isolationRooms.map((room) => (
                        <button
                            key={room}
                            onClick={() => handleSelectRoom(room)}
                            className="bg-[#ffd3d3] text-[#ac5e5e] rounded-xl py-3
                                      hover:bg-[#ffbcbc] transition-colors 
                                      h-20 flex items-center justify-center
                                      text-lg font-bold shadow-md"
                        >
                            Salle d'Isolation {room - 16}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Render bed tabs and notes for a selected room
    const renderRoomContent = () => {
        const currentTasks = getCurrentTasks();
        const maxBeds = isIsolationRoom(selectedRoom) ? 1 : 2;

        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleBackToRooms}
                        className="bg-[#4f5796] text-white rounded-full py-1 px-4 
                                  hover:bg-[#3a4170] transition-colors text-sm"
                    >
                        Retour aux Salles
                    </button>
                    <h3 className="text-xl font-bold text-[#4f5796]">
                        {isIsolationRoom(selectedRoom)
                            ? `Salle d'Isolation ${selectedRoom - 16}`
                            : `Salle ${selectedRoom}`}
                    </h3>
                </div>

                {/* Bed tabs */}
                <div className="flex mb-4 border-b border-[#cbd1ff]">
                    {Array.from({ length: maxBeds }, (_, i) => i + 1).map((bed) => (
                        <button
                            key={bed}
                            onClick={() => setSelectedBed(bed.toString())}
                            className={`py-2 px-6 text-lg font-semibold rounded-t-lg transition-colors
                                      ${selectedBed === bed.toString()
                                    ? 'bg-[#cbd1ff] text-[#4f5796]'
                                    : 'bg-transparent text-[#4f5796]/70 hover:bg-[#cbd1ff]/50'
                                }`}
                        >
                            Lit {bed}
                        </button>
                    ))}
                </div>

                {/* Actes for the selected bed */}
                <div className="flex-1 overflow-y-auto">
                    {currentTasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleEditTask(task)}
                            className={`p-3 mb-3 rounded-2xl text-lg px-4 
                                      flex flex-col cursor-pointer 
                                      transition-colors ${getTaskColor(task.type)} 
                                      ${getTaskTextColor(task.type)}
                                      ${highlightedActe === task.id ? 'ring-4 ring-[#4f5796] animate-pulse' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">• {task.name}</span>
                                <span className="text-sm opacity-80">{task.date}</span>
                            </div>

                            {task.patientName && (
                                <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                    <div>
                                        <span className="font-semibold">Patient:</span> {task.patientName}
                                        {task.patientNumber && <span> (#{task.patientNumber})</span>}
                                    </div>
                                    {task.diagnostic && (
                                        <div>
                                            <span className="font-semibold">Diagnostic:</span> {task.diagnostic}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {currentTasks.length === 0 && (
                        <div className="text-center text-gray-500 mt-8">
                            Aucun acte pour ce lit. Ajoutez-en un !
                        </div>
                    )}
                </div>
            </div>
        );
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
            <main className="pt-24 md:pt-32 px-4 md:px-6 pb-8 max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black text-[#4f5796] mb-4 md:mb-8">Journal</h1>

                <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between mb-4 md:mb-8">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                            onClick={() => selectedRoom ? setShowModal(true) : null}
                            className={`${selectedRoom
                                ? 'bg-[#cbd1ff] text-[#4f5796] hover:bg-[#b8bfff]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'} 
                                rounded-full py-2 px-6 transition-colors text-sm md:text-base`}
                            disabled={!selectedRoom}
                        >
                            Ajouter un acte
                        </button>

                        {/* Search bar */}
                        <div className="relative" ref={searchRef}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par nom ou ID..."
                                className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-6 
                                         transition-colors text-sm md:text-base min-w-[200px] sm:min-w-[250px]
                                         border border-[#cbd1ff] focus:border-[#4f5796] outline-none"
                                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                            />

                            {/* Search results dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full left-0 mt-1 w-full sm:w-96 bg-white rounded-xl shadow-lg 
                                               z-10 max-h-80 overflow-y-auto">
                                    <div className="p-2 border-b border-gray-100">
                                        <p className="text-sm text-gray-500">
                                            {searchResults.length} résultats trouvés
                                        </p>
                                    </div>

                                    {searchResults.map((result) => (
                                        <div
                                            key={result.id}
                                            onClick={() => navigateToActe(result)}
                                            className="p-2 hover:bg-[#f1f3ff] cursor-pointer border-b border-gray-100"
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-[#4f5796]">{result.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    Salle {result.room}, Lit {result.bed}
                                                </span>
                                            </div>

                                            {result.patientName && (
                                                <div className="text-sm text-gray-700">
                                                    <span>Patient: {result.patientName}</span>
                                                    {result.patientNumber && <span> (#{result.patientNumber})</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 
                                 hover:bg-[#3a4170] transition-colors text-sm md:text-base"
                    >
                        Retour à l'accueil
                    </Link>
                </div>

                {/* Display Area - responsive and with proper height controls */}
                <div className="w-full h-[500px] md:h-[600px] bg-[#f1f3ff] rounded-3xl p-4 
                              shadow-[0_0_50px_0.1px_#cbd1ff] flex flex-col">
                    {selectedRoom ? renderRoomContent() : renderRoomButtons()}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4">
                    <div className="bg-[#cbd1ff] p-4 md:p-6 rounded-3xl shadow-lg w-full max-w-[600px] animate-slideUp max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 ml-1 text-[#4f5796]">
                            {editingTask ? 'Modifier l\'acte' : 'Ajouter un acte'}
                        </h2>
                        <p className="text-sm text-[#4f5796] mb-3 ml-1">
                            {isIsolationRoom(selectedRoom)
                                ? `Salle d'Isolation ${selectedRoom - 16} - Lit ${selectedBed}`
                                : `Salle ${selectedRoom} - Lit ${selectedBed}`}
                        </p>

                        <div className="space-y-4">
                            {/* Basic acte info */}
                            <div>
                                <label className="block text-[#4f5796] font-semibold mb-1 ml-1">Nom de l'acte</label>
                                <input
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50"
                                    placeholder="Nom de l'acte"
                                />
                            </div>

                            <div>
                                <label className="block text-[#4f5796] font-semibold mb-1 ml-1">Catégorie</label>
                                <select
                                    value={taskType}
                                    onChange={(e) => setTaskType(e.target.value)}
                                    className={`w-full border bg-[#f1f3ff] rounded-lg p-2 ${taskType === '1' ? 'text-red-400' :
                                        taskType === '2' ? 'text-green-300' : 'text-yellow-400'
                                        }`}
                                >
                                    <option value="1" className="text-red-400">Examens Paracliniques</option>
                                    <option value="2" className="text-green-300">Traitement Reçu</option>
                                    <option value="3" className="text-yellow-400">Soins Prodigués</option>
                                </select>
                            </div>

                            {/* Patient info section */}
                            <div className="pt-2 border-t border-[#4f5796]/20">
                                <h3 className="text-lg font-semibold text-[#4f5796] mb-2">Information du Patient</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Nom du Patient</label>
                                        <input
                                            type="text"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50"
                                            placeholder="Nom complet"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Numéro d'entrée</label>
                                        <input
                                            type="text"
                                            value={patientNumber}
                                            onChange={(e) => setPatientNumber(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50"
                                            placeholder="Ex: 2023-1234"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Diagnostic</label>
                                    <textarea
                                        value={diagnostic}
                                        onChange={(e) => setDiagnostic(e.target.value)}
                                        className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50 min-h-[60px]"
                                        placeholder="Description du diagnostic"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Date d'entrée</label>
                                        <input
                                            type="datetime-local"
                                            value={admissionDate}
                                            onChange={(e) => setAdmissionDate(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Date de sortie</label>
                                        <input
                                            type="datetime-local"
                                            value={dischargeDate}
                                            onChange={(e) => setDischargeDate(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Medical staff section */}
                            <div className="pt-2 border-t border-[#4f5796]/20">
                                <h3 className="text-lg font-semibold text-[#4f5796] mb-2">Personnel Médical</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Médecin Traitant</label>
                                        <input
                                            type="text"
                                            value={doctorName}
                                            onChange={(e) => setDoctorName(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50"
                                            placeholder="Nom complet"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Jour et heure de garde</label>
                                        <input
                                            type="datetime-local"
                                            value={doctorShift}
                                            onChange={(e) => setDoctorShift(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Infirmier de garde</label>
                                        <input
                                            type="text"
                                            value={nurseName}
                                            onChange={(e) => setNurseName(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 placeholder:text-primary/50"
                                            placeholder="Nom complet"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[#4f5796] text-sm font-medium mb-1 ml-1">Jour et heure de garde</label>
                                        <input
                                            type="datetime-local"
                                            value={nurseShift}
                                            onChange={(e) => setNurseShift(e.target.value)}
                                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end mt-6">
                            <button
                                onClick={handleSaveTask}
                                className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-4 hover:bg-[#3a4170] transition-colors"
                            >
                                Enregistrer
                            </button>
                            {editingTask && (
                                <button
                                    onClick={handleDeleteTask}
                                    className="bg-[#d55e5e] text-[#ffe1e1] rounded-full py-2 px-4 hover:bg-[#b84f4f] transition-colors"
                                >
                                    Supprimer
                                </button>
                            )}
                            <button
                                onClick={handleCloseModal}
                                className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-4 hover:bg-[#e0e2ff] transition-colors"
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

export default Journal;