import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

const Journal = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [taskType, setTaskType] = useState('1');

    // Load tasks on component mount
    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(savedTasks);

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

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
        if (!taskName.trim()) return;

        const newTask = {
            id: editingTask?.id || Date.now().toString(),
            name: taskName,
            type: taskType,
            date: new Date().toLocaleString()
        };

        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
        } else {
            setTasks([...tasks, newTask]);
        }

        handleCloseModal();
    };

    const handleDeleteTask = () => {
        setTasks(tasks.filter(t => t.id !== editingTask.id));
        updateDailyNotes(false);
        handleCloseModal();
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskName(task.name);
        setTaskType(task.type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTask(null);
        setTaskName('');
        setTaskType('1');
    };

    const updateDailyNotes = (isAdd = true) => {
        const dateKey = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const dailyNotes = JSON.parse(localStorage.getItem('dailyNotes')) || {};
        dailyNotes[dateKey] = Math.max(0, (dailyNotes[dateKey] || 0) + (isAdd ? 1 : -1));
        localStorage.setItem('dailyNotes', JSON.stringify(dailyNotes));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-red-hat-display">
            {/* Top Bar - Same as Home */}
            <div
                className={`fixed top-0 w-full z-50 bg-[#4f5796] transition-all duration-300 ${isExpanded ? 'h-screen' : 'h-20'
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
            </div>

            {/* Main Content */}
            <main className="pt-32 px-6 pb-8">
                <h1 className="text-5xl font-black text-[#4f5796] mb-8">Journal</h1>

                <div className="w-full flex justify-between mb-8">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#cbd1ff] text-[#4f5796] rounded-full py-2 px-6 hover:bg-[#b8bfff] transition-colors"
                    >
                        Ajouter une note
                    </button>
                    <Link
                        to="/"
                        className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 hover:bg-[#4f5796] transition-colors"
                    >
                        Retour à l'accueil
                    </Link>
                </div>

                <div className="w-full h-[600px] bg-[#f1f3ff] rounded-3xl p-4 overflow-y-auto shadow-[0_0_50px_0.1px_#cbd1ff]">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleEditTask(task)}
                            className={`p-2 mb-2 rounded-3xl h-[45px] text-xl px-4 flex justify-between items-center cursor-pointer transition-colors ${getTaskColor(task.type)} ${getTaskTextColor(task.type)}`}
                        >
                            <span className="task-name">• {task.name}</span>
                            <span className="task-date text-lg">{task.date}</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
                    <div className="bg-[#cbd1ff] p-6 rounded-3xl shadow-lg w-[500px] animate-slideUp">
                        <h2 className="text-2xl font-bold mb-2 ml-1 text-[#4f5796]">
                            {editingTask ? 'Modifier la note' : 'Ajouter une note'}
                        </h2>

                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="w-full bg-[#f1f3ff] text-[#4f5796] rounded-lg p-2 mb-4 placeholder:text-primary/50"
                            placeholder="Nom du note"
                        />

                        <div className="mb-4">
                            <label className="mr-4 text-primary text-xl ml-1">Catégorie:</label>
                            <select
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                                className={`border bg-[#f1f3ff] rounded-lg p-2 ${taskType === '1' ? 'text-red-400' :
                                    taskType === '2' ? 'text-green-300' : 'text-yellow-400'
                                    }`}
                            >
                                <option value="1" className="text-red-400">Examens Paracliniques</option>
                                <option value="2" className="text-green-300">Traitement Reçu</option>
                                <option value="3" className="text-yellow-400">Soins Prodigués</option>
                            </select>
                        </div>

                        <div className="flex space-x-2 justify-end">
                            <button
                                onClick={handleSaveTask}
                                className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-4 hover:bg-[#4f5796] transition-colors"
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