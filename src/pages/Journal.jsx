import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';
import profileSVG from '../assets/profile.svg';
import {
    logout,
    getCurrentUser,
    getProfile,
    getAvatarUrl,
    createJournalEntry,
    getUserJournalEntries,
    updateJournalEntry,
    deleteJournalEntry
} from '../lib/appwrite';

const Journal = () => {
    // State management
    const [isTopBarExpanded, setIsTopBarExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [weather, setWeather] = useState({ temp: '22°C', condition: 'Sunny' });
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [language, setLanguage] = useState('fr');
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Journal specific state
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

    // Static salles data - no backend needed
    const staticSalles = [
        // 16 regular salles with 2 beds each
        ...Array.from({ length: 16 }, (_, i) => ({
            id: `salle_${i + 1}`,
            name: `Salle ${i + 1}`,
            type: 'regular',
            bedCount: 2,
            beds: [1, 2]
        })),
        // 2 isolation salles with 1 bed each
        ...Array.from({ length: 2 }, (_, i) => ({
            id: `isolation_${i + 1}`,
            name: `Isolation ${i + 1}`,
            type: 'isolation',
            bedCount: 1,
            beds: [1]
        }))
    ];

    // Backend data
    const [loading, setLoading] = useState(true);
    const [journalEntries, setJournalEntries] = useState([]);

    // Use the authentication context
    const navigate = useNavigate();

    // State for user
    const [user, setUser] = useState(null);

    // Fetch the current user on component mount
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const result = await getCurrentUser();
            if (result.success) {
                setUser(result.user);
                // Fetch avatar/profile
                const profile = await getProfile(result.user.$id);
                if (profile && profile.avatarFileId) {
                    setAvatarUrl(getAvatarUrl(profile.avatarFileId));
                } else {
                    setAvatarUrl(profileSVG);
                }
            } else {
                navigate('/signin');
            }
        };
        fetchCurrentUser();
    }, [navigate]);

    // Get first name from full name
    const getFirstName = () => {
        if (!user || !user.name) return '';
        const nameParts = user.name.split(' ');
        return nameParts[0];
    };

    // Modified greeting to use the user's first name
    const getGreeting = useCallback(() => {
        const hour = new Date().getHours();
        const name = user ? getFirstName() : '';
        const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
        return `${greeting}, ${name}!`;
    }, [user]);

    // Update time and date every second
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setCurrentDate(now.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, [language]);

    // Load backend data on component mount
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setLoading(true);
            try {
                // Load journal entries only
                const entriesResult = await getUserJournalEntries();
                if (entriesResult.success) {
                    setJournalEntries(entriesResult.journals);

                    // Convert entries to the old tasks format for compatibility
                    const tasksFormat = {};
                    entriesResult.journals.forEach(entry => {
                        const roomKey = `room_${entry.salleId}`;
                        const bedKey = `bed_${entry.bedNumber}`;

                        if (!tasksFormat[roomKey]) {
                            tasksFormat[roomKey] = {};
                        }
                        if (!tasksFormat[roomKey][bedKey]) {
                            tasksFormat[roomKey][bedKey] = [];
                        }

                        tasksFormat[roomKey][bedKey].push({
                            id: entry.$id,
                            name: entry.actName,
                            type: entry.category,
                            date: new Date(entry.createdAt).toLocaleString(),
                            patientName: entry.patientName,
                            patientNumber: entry.numeroEntree,
                            doctorName: entry.medecinGarde,
                            doctorShift: new Date(entry.jourDateHeureMedecin).toLocaleString(),
                            nurseName: entry.infGarde,
                            nurseShift: new Date(entry.jourDateHeureInf).toLocaleString(),
                            diagnostic: entry.diagnostic,
                            admissionDate: entry.dateEntree ? new Date(entry.dateEntree).toLocaleDateString() : '',
                            dischargeDate: entry.dateSortie ? new Date(entry.dateSortie).toLocaleDateString() : '',
                            // Backend-specific fields
                            salleId: entry.salleId,
                            bedNumber: entry.bedNumber
                        });
                    });
                    setTasks(tasksFormat);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

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

    // Note: Tasks are now saved directly to backend in handleSaveTask

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

    // Check if a room is an isolation room
    const isIsolationRoom = (roomId) => {
        const room = staticSalles.find(s => s.id === roomId);
        return room ? room.type === 'isolation' : false;
    };

    const handleSaveTask = async () => {
        if (!taskName.trim() || !selectedRoom || !selectedBed || !patientName.trim() || !diagnostic.trim()) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            // DEBUG: Log all state values
            console.log('🔍 DEBUG - State Values:');
            console.log('selectedRoom:', selectedRoom, 'type:', typeof selectedRoom);
            console.log('selectedBed:', selectedBed, 'type:', typeof selectedBed);
            console.log('parseInt(selectedBed):', parseInt(selectedBed), 'type:', typeof parseInt(selectedBed));
            console.log('isNaN(parseInt(selectedBed)):', isNaN(parseInt(selectedBed)));

            // Prepare journal entry data with simple salle/bed references
            const journalData = {
                actName: taskName,
                category: taskType,
                patientName,
                numeroEntree: patientNumber,
                diagnostic,
                dateEntree: admissionDate ? new Date(admissionDate).toISOString() : new Date().toISOString(),
                dateSortie: dischargeDate ? new Date(dischargeDate).toISOString() : null,
                medecinGarde: doctorName,
                infGarde: nurseName,
                jourDateHeureMedecin: doctorShift ? new Date(doctorShift).toISOString() : new Date().toISOString(),
                jourDateHeureInf: nurseShift ? new Date(nurseShift).toISOString() : new Date().toISOString(),
                salleId: selectedRoom,
                bedNumber: parseInt(selectedBed)
            };

            // DEBUG: Log the complete journalData object
            console.log('🔍 DEBUG - Complete journalData object:');
            console.log(JSON.stringify(journalData, null, 2));
            console.log('bedNumber in journalData:', journalData.bedNumber, 'type:', typeof journalData.bedNumber);

            let result;
            if (editingTask) {
                // Update existing entry
                result = await updateJournalEntry(editingTask.id, journalData);
            } else {
                // Create new entry
                result = await createJournalEntry(journalData);
            }

            if (result.success) {
                // Refresh the data
                const entriesResult = await getUserJournalEntries();
                if (entriesResult.success) {
                    setJournalEntries(entriesResult.journals);

                    // Update tasks format for UI compatibility
                    const tasksFormat = {};
                    entriesResult.journals.forEach(entry => {
                        const roomKey = `room_${entry.salleId}`;
                        const bedKey = `bed_${entry.bedNumber}`;

                        if (!tasksFormat[roomKey]) {
                            tasksFormat[roomKey] = {};
                        }
                        if (!tasksFormat[roomKey][bedKey]) {
                            tasksFormat[roomKey][bedKey] = [];
                        }

                        tasksFormat[roomKey][bedKey].push({
                            id: entry.$id,
                            name: entry.actName,
                            type: entry.category,
                            date: new Date(entry.createdAt).toLocaleString(),
                            patientName: entry.patientName,
                            patientNumber: entry.numeroEntree,
                            doctorName: entry.medecinGarde,
                            doctorShift: new Date(entry.jourDateHeureMedecin).toLocaleString(),
                            nurseName: entry.infGarde,
                            nurseShift: new Date(entry.jourDateHeureInf).toLocaleString(),
                            diagnostic: entry.diagnostic,
                            admissionDate: entry.dateEntree ? new Date(entry.dateEntree).toLocaleDateString() : '',
                            dischargeDate: entry.dateSortie ? new Date(entry.dateSortie).toLocaleDateString() : '',
                            salleId: entry.salleId,
                            bedNumber: entry.bedNumber
                        });
                    });
                    setTasks(tasksFormat);
                }

                handleCloseModal();
            } else {
                alert(`Erreur lors de la sauvegarde: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDeleteTask = async () => {
        if (!editingTask) return;

        try {
            const result = await deleteJournalEntry(editingTask.id);

            if (result.success) {
                // Refresh the data
                const entriesResult = await getUserJournalEntries();
                if (entriesResult.success) {
                    setJournalEntries(entriesResult.journals);

                    // Update tasks format for UI compatibility
                    const tasksFormat = {};
                    entriesResult.journals.forEach(entry => {
                        const roomKey = `room_${entry.salleId}`;
                        const bedKey = `bed_${entry.bedNumber}`;

                        if (!tasksFormat[roomKey]) {
                            tasksFormat[roomKey] = {};
                        }
                        if (!tasksFormat[roomKey][bedKey]) {
                            tasksFormat[roomKey][bedKey] = [];
                        }

                        tasksFormat[roomKey][bedKey].push({
                            id: entry.$id,
                            name: entry.actName,
                            type: entry.category,
                            date: new Date(entry.createdAt).toLocaleString(),
                            patientName: entry.patientName,
                            patientNumber: entry.numeroEntree,
                            doctorName: entry.medecinGarde,
                            doctorShift: new Date(entry.jourDateHeureMedecin).toLocaleString(),
                            nurseName: entry.infGarde,
                            nurseShift: new Date(entry.jourDateHeureInf).toLocaleString(),
                            diagnostic: entry.diagnostic,
                            admissionDate: entry.dateEntree ? new Date(entry.dateEntree).toLocaleDateString() : '',
                            dischargeDate: entry.dateSortie ? new Date(entry.dateSortie).toLocaleDateString() : '',
                            salleId: entry.salleId,
                            bedNumber: entry.bedNumber
                        });
                    });
                    setTasks(tasksFormat);
                }

                handleCloseModal();
            } else {
                alert(`Erreur lors de la suppression: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleArchiveTask = () => {
        if (!selectedRoom || !selectedBed || !editingTask) return;

        const roomKey = `room_${selectedRoom}`;
        const bedKey = `bed_${selectedBed}`;

        // Get the task to archive
        const taskToArchive = tasks[roomKey][bedKey].find(t => t.id === editingTask.id);
        if (!taskToArchive) return;

        // Add room and bed info and archive date to the task
        const archivedTask = {
            ...taskToArchive,
            room: selectedRoom,
            bed: selectedBed,
            archivedDate: new Date().toISOString()
        };

        // Get current archived actes
        const archivedActes = JSON.parse(localStorage.getItem('archivedActes')) || [];

        // Add the new archived acte
        archivedActes.push(archivedTask);

        // Save to localStorage
        localStorage.setItem('archivedActes', JSON.stringify(archivedActes));

        // Remove from tasks
        const updatedTasks = { ...tasks };
        updatedTasks[roomKey][bedKey] = updatedTasks[roomKey][bedKey].filter(
            t => t.id !== editingTask.id
        );
        setTasks(updatedTasks);

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

    const handleSelectRoom = (salleId) => {
        setSelectedRoom(salleId);
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

        return tasks[roomKey]?.[bedKey] || [];
    };

    // Generate room buttons from static data
    const renderRoomButtons = () => {
        const regularSalles = staticSalles.filter(s => s.type === 'regular');
        const isolationSalles = staticSalles.filter(s => s.type === 'isolation');

        return (
            <div className="w-full h-full flex flex-col overflow-y-auto p-2">
                {/* Regular Rooms */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="bg-[#4f5796] rounded-full p-2 mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#4f5796]">Salles Générales</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {regularSalles.map((salle) => (
                            <button
                                key={salle.id}
                                onClick={() => handleSelectRoom(salle.id)}
                                className="group bg-gradient-to-br from-[#cbd1ff] to-[#b8bfff] text-[#4f5796] rounded-2xl py-6 px-4
                                          hover:from-[#b8bfff] hover:to-[#a5acff] transform hover:scale-105 transition-all duration-300
                                          aspect-square flex flex-col items-center justify-center
                                          shadow-lg hover:shadow-xl border border-white/50"
                            >
                                <div className="bg-white/30 rounded-full p-2 mb-2 group-hover:bg-white/40 transition-colors">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0l9 5 9-5" />
                                    </svg>
                                </div>
                                <span className="text-sm md:text-base font-bold">{salle.name}</span>
                                <span className="text-xs text-[#4f5796]/70">{salle.bedCount} lits</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center mb-8">
                    <div className="flex-1 border-t-2 border-[#4f5796]/20"></div>
                    <div className="mx-4 bg-[#ffd3d3] rounded-full p-2">
                        <svg className="w-5 h-5 text-[#ac5e5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="flex-1 border-t-2 border-[#4f5796]/20"></div>
                </div>

                {/* Isolation Rooms */}
                <div className="mb-4">
                    <div className="flex items-center mb-4">
                        <div className="bg-[#ac5e5e] rounded-full p-2 mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#ac5e5e]">Salles d'Isolation</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isolationSalles.map((salle) => (
                            <button
                                key={salle.id}
                                onClick={() => handleSelectRoom(salle.id)}
                                className="group bg-gradient-to-br from-[#ffd3d3] to-[#ffbcbc] text-[#ac5e5e] rounded-2xl py-6 px-6
                                          hover:from-[#ffbcbc] hover:to-[#ffa5a5] transform hover:scale-105 transition-all duration-300
                                          flex items-center justify-between shadow-lg hover:shadow-xl border border-white/50"
                            >
                                <div className="flex items-center">
                                    <div className="bg-white/30 rounded-full p-3 mr-4 group-hover:bg-white/40 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium opacity-80">{salle.name}</div>
                                        <div className="text-xl font-black">{salle.bedCount} lit</div>
                                    </div>
                                </div>
                                <div className="bg-[#ac5e5e] text-white rounded-full px-3 py-1 text-xs font-bold">
                                    STRICT
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Render bed tabs and notes for a selected room
    const renderRoomContent = () => {
        const currentTasks = getCurrentTasks();
        const selectedSalle = staticSalles.find(s => s.id === selectedRoom);
        const roomBeds = selectedSalle ? selectedSalle.beds : [];

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
                        {selectedSalle?.name || 'Salle'}
                    </h3>
                </div>

                {/* Bed tabs */}
                <div className="flex mb-4 border-b border-[#cbd1ff]">
                    {roomBeds.map((bedNumber) => (
                        <button
                            key={bedNumber}
                            onClick={() => setSelectedBed(bedNumber.toString())}
                            className={`py-2 px-6 text-lg font-semibold rounded-t-lg transition-colors
                                      ${selectedBed === bedNumber.toString()
                                    ? 'bg-[#cbd1ff] text-[#4f5796]'
                                    : 'bg-transparent text-[#4f5796]/70 hover:bg-[#cbd1ff]/50'
                                }`}
                        >
                            Lit {bedNumber}
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

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.modal-content') &&
                (showNotificationModal || showSettingsModal || showProfileModal)) {
                setShowNotificationModal(false);
                setShowSettingsModal(false);
                setShowProfileModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationModal, showSettingsModal, showProfileModal]);

    // Handle feedback submission
    const handleSubmitFeedback = () => {
        alert(`Merci pour votre feedback! Évaluation: ${rating}/5`);
        setFeedback('');
        setRating(0);
    };

    // Handle logout
    const handleLogout = async () => {
        console.log("Logging out...");
        const result = await logout();
        if (result.success) {
            console.log("Logout successful");
            navigate('/signin');
        } else {
            console.error("Logout failed:", result.error);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen font-red-hat-display bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E67AC] mx-auto mb-4"></div>
                    <p className="text-[#4f5796] font-semibold">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-red-hat-display transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Top Bar */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#5E67AC] transition-all duration-500 ease-in-out
                           ${isTopBarExpanded ? 'h-screen' : 'h-20'} rounded-b-3xl shadow-lg`}
            >
                <div className="flex items-center justify-between h-20 px-6">
                    <div className="flex items-center cursor-pointer" onClick={() => setIsTopBarExpanded(!isTopBarExpanded)}>
                        <img src={logo} alt="ActiNurse Logo" className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-105" />
                        <div className={`ml-3 text-white text-lg font-bold opacity-70 transition-opacity ${isTopBarExpanded ? 'opacity-100' : 'hidden md:block'}`}>
                            <span className="text-xs opacity-70">v0.2</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={() => {
                                setShowSettingsModal(!showSettingsModal);
                                setShowNotificationModal(false);
                                setShowProfileModal(false);
                            }}
                        >
                            <div className="relative">
                                <img
                                    src={settingsIcon}
                                    className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-md transition-transform duration-300 hover:rotate-90"
                                    alt="Settings"
                                />
                            </div>
                        </button>
                        <button
                            className="p-1.5 md:p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors relative"
                            onClick={() => {
                                setShowNotificationModal(!showNotificationModal);
                                setShowSettingsModal(false);
                                setShowProfileModal(false);
                            }}
                        >
                            <div className="relative">
                                <img
                                    src={notificationIcon}
                                    className="w-5 h-5 md:w-6 md:h-6 filter drop-shadow-md"
                                    alt="Notifications"
                                />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                    0
                                </span>
                            </div>
                        </button>
                        <div
                            className="flex items-center bg-white/20 rounded-full pl-2 md:pl-3 pr-1 gap-1 md:gap-2 cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => {
                                setShowProfileModal(!showProfileModal);
                                setShowNotificationModal(false);
                                setShowSettingsModal(false);
                            }}
                        >
                            <span className="text-white font-black text-xs md:text-sm hidden sm:inline">{currentTime}</span>
                            <img src={avatarUrl || profileSVG} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/30" alt="Profile" />
                        </div>
                    </div>
                </div>

                {/* Expanded area content */}
                {isTopBarExpanded && (
                    <div className="px-6 py-4 text-white animate-fadeIn overflow-y-auto max-h-[calc(100vh-5rem)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left column */}
                            <div className="space-y-6">
                                {/* Welcome message */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-2">Bienvenue sur ActiNurse v0.2</h2>
                                    <p className="text-sm opacity-90">
                                        ActiNurse est une application de gestion pour les infirmiers et infirmières.
                                        Cette version offre des fonctionnalités de base pour la gestion des actes médicaux,
                                        des rappels, des stocks, et le suivi des patients.
                                    </p>
                                </div>

                                {/* Changelog */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-2">Journal des modifications</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-md font-semibold">v0.2.5 (Actuel)</h3>
                                            <ul className="list-disc list-inside text-sm opacity-90 ml-2">
                                                <li>Première version de l'application</li>
                                                <li>Journal des actes médicaux</li>
                                                <li>Système de rappels</li>
                                                <li>Gestion des stocks</li>
                                                <li>Interface responsive</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-md font-semibold">Prochaines fonctionnalités</h3>
                                            <ul className="list-disc list-inside text-sm opacity-90 ml-2">
                                                <li>Synchronisation cloud</li>
                                                <li>Applications mobiles natives</li>
                                                <li>Mode hors ligne amélioré</li>
                                                <li>Rapports et statistiques</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-6">
                                {/* Date and weather */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs opacity-80">Aujourd'hui</p>
                                            <p className="text-md font-bold">{currentDate}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{weather.temp}</p>
                                            <p className="text-xs opacity-80">{weather.condition}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback form */}
                                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                    <h2 className="text-xl font-bold mb-3">Donnez votre avis</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm mb-1">Commentaire</label>
                                            <textarea
                                                className="w-full bg-white/20 rounded-xl p-2 text-sm placeholder-white/50 border border-white/20 focus:border-white/50 outline-none resize-none"
                                                placeholder="Partagez votre expérience..."
                                                rows={3}
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1">Notation</label>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        className={`text-2xl ${rating >= star ? 'text-yellow-300' : 'text-white/30'}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            className="w-full bg-white/20 hover:bg-white/30 text-white rounded-full py-2 transition-colors font-semibold"
                                            onClick={handleSubmitFeedback}
                                        >
                                            Envoyer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Modal */}
            {showNotificationModal && (
                <div className="fixed top-20 right-4 md:right-6 mt-2 z-50 animate-slideUp w-72 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-[#5E67AC] text-white p-3 flex justify-between items-center">
                            <h3 className="font-bold">Notifications</h3>
                            <button
                                className="text-white/70 hover:text-white"
                                onClick={() => setShowNotificationModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 text-center text-gray-600">
                            <div className="flex justify-center mb-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <img src={notificationIcon} alt="No notifications" className="w-6 h-6 opacity-40" />
                                </div>
                            </div>
                            <p className="text-sm">Aucune nouvelle notification</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed top-20 right-4 md:right-16 mt-2 z-50 animate-slideUp w-80 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-[#5E67AC] text-white p-3 flex justify-between items-center">
                            <h3 className="font-bold">Paramètres</h3>
                            <button
                                className="text-white/70 hover:text-white"
                                onClick={() => setShowSettingsModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 text-gray-700 space-y-4">
                            <div>
                                <label className="flex items-center justify-between">
                                    <span className="font-medium">Mode sombre</span>
                                    <div
                                        className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${darkMode ? 'bg-[#5E67AC]' : 'bg-gray-300'}`}
                                        onClick={() => setDarkMode(!darkMode)}
                                    >
                                        <div
                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </div>
                                </label>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Taille de la police</label>
                                <select
                                    className="w-full bg-gray-100 rounded-lg p-2 border border-gray-200 focus:outline-none focus:border-[#5E67AC]"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                >
                                    <option value="small">Petite</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Langue</label>
                                <select
                                    className="w-full bg-gray-100 rounded-lg p-2 border border-gray-200 focus:outline-none focus:border-[#5E67AC]"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">Anglais</option>
                                </select>
                            </div>
                            <button
                                className="w-full bg-[#5E67AC] hover:bg-[#4F5796] text-white rounded-lg py-2 transition-colors"
                                onClick={() => setShowSettingsModal(false)}
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed top-20 right-4 mt-2 z-50 animate-slideUp w-72 modal-content">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-b from-[#5E67AC] to-[#4F5796] text-white p-6 text-center">
                            <div className="mb-3 mx-auto w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden">
                                <img
                                    src={avatarUrl || profileSVG}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-lg">{user ? user.name : 'Guest User'}</h3>
                            <p className="text-sm opacity-80">Infirmier en chef</p>
                        </div>
                        <div className="p-4 space-y-2">
                            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition-colors text-sm font-medium flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mon Profil
                            </button>
                            <button
                                className="w-full bg-[#ffd3d3] hover:bg-[#ffbcbc] text-[#ac5e5e] rounded-lg py-2 transition-colors text-sm font-medium flex items-center justify-center"
                                onClick={handleLogout}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`pt-28 md:pt-32 px-4 md:px-6 pb-8 transition-all duration-300 ${isTopBarExpanded ? 'opacity-20 pointer-events-none' : 'opacity-100'} max-w-7xl mx-auto`}>
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

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Link
                            to="/archive"
                            className="bg-[#5e8cac] text-[#e1f0ff] rounded-full py-2 px-6 
                                     hover:bg-[#4f7690] transition-colors text-sm md:text-base"
                        >
                            Voir les Archives
                        </Link>

                        <Link
                            to="/home"
                            className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 
                                     hover:bg-[#3a4170] transition-colors text-sm md:text-base"
                        >
                            Retour à l'accueil
                        </Link>


                    </div>
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
                                ? `Salle d'Isolation ${selectedRoom} - Lit ${selectedBed}`
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
                                <h3 className="text-lg font-semibold text-[#4f5796] mb-2">Equipe de garde</h3>

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
                                <>
                                    <button
                                        onClick={handleArchiveTask}
                                        className="bg-[#5e8cac] text-[#e1f0ff] rounded-full py-2 px-4 hover:bg-[#4f7690] transition-colors"
                                    >
                                        Archiver
                                    </button>
                                    <button
                                        onClick={handleDeleteTask}
                                        className="bg-[#d55e5e] text-[#ffe1e1] rounded-full py-2 px-4 hover:bg-[#b84f4f] transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </>
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