import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

const Progress = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [activeFilter, setActiveFilter] = useState('Notes');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Load tasks and initialize chart
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        updateChart(activeFilter === 'Notes' ? ['Notes', 'Examens', 'Traitement', 'Soins'] : [activeFilter]);

        return () => {
            clearInterval(timer);
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [activeFilter]);

    const getTasks = () => {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    };

    const filterTasksByType = (type) => {
        const tasks = getTasks();
        if (type === 'Notes') return tasks;

        const typeMapping = {
            Examens: '1',
            Traitement: '2',
            Soins: '3',
        };

        return tasks.filter((task) => task.type === typeMapping[type]);
    };

    const getNotesByDay = (filteredTasks) => {
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const notesCount = Array(7).fill(0);

        filteredTasks.forEach((task) => {
            const dayIndex = new Date(task.date).getDay();
            notesCount[dayIndex]++;
        });

        return { days, notesCount };
    };

    const updateChart = (types) => {
        if (!chartRef.current) return;

        const datasets = types.map((type) => {
            const filteredTasks = filterTasksByType(type);
            const { notesCount } = getNotesByDay(filteredTasks);

            const colorMapping = {
                Notes: '#5e67ac',
                Examens: '#e63946',
                Traitement: '#1f9d55',
                Soins: '#f4a623',
            };

            return {
                label: type,
                data: notesCount,
                backgroundColor: `${colorMapping[type]}33`,
                borderColor: colorMapping[type],
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: colorMapping[type],
                pointRadius: 6,
                tension: 0.4,
                fill: true,
            };
        });

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: datasets.length > 1 ? '#5e67ac' : datasets[0].borderColor,
                            font: {
                                family: 'RedHatDisplay',
                                size: 14,
                            },
                        },
                        grid: {
                            color: 'rgba(94, 103, 172, 0.1)',
                        },
                    },
                    x: {
                        ticks: {
                            color: datasets.length > 1 ? '#5e67ac' : datasets[0].borderColor,
                            font: {
                                family: 'RedHatDisplay',
                                size: 14,
                            },
                        },
                        grid: {
                            color: 'rgba(94, 103, 172, 0.1)',
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: datasets.length > 1 ? '#5e67ac' : datasets[0].borderColor,
                            font: {
                                family: 'RedHatDisplay',
                                size: 16,
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: datasets.length > 1 ? '#5e67ac' : datasets[0].borderColor,
                        titleFont: {
                            family: 'RedHatDisplay',
                            size: 14,
                        },
                        bodyFont: {
                            family: 'RedHatDisplay',
                            size: 12,
                        },
                    },
                },
            },
        });
    };

    const handleFilterClick = (type) => {
        setActiveFilter(type);
        if (type === 'Notes') {
            updateChart(['Notes', 'Examens', 'Traitement', 'Soins']);
        } else {
            updateChart([type]);
        }
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
                <h1 className="text-5xl font-bold text-[#5e67ac] mb-4">Progrès</h1>

                {/* Filter Buttons */}
                <div className="w-full flex gap-4 mb-6 items-center">
                    {['Notes', 'Examens', 'Traitement', 'Soins'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleFilterClick(type)}
                            className={`rounded-full py-2 px-6 ${activeFilter === type
                                ? type === 'Notes' ? 'bg-[#cbd1ff] text-[#5e67ac]'
                                    : type === 'Examens' ? 'bg-[#ffcbd1] text-[#e63946]'
                                        : type === 'Traitement' ? 'bg-[#cbffd4] text-[#1f9d55]'
                                            : 'bg-[#ffedb2] text-[#f4a623]'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {type === 'Notes' ? 'Notes' :
                                type === 'Examens' ? 'Examens Paracliniques' :
                                    type === 'Traitement' ? 'Traitement Reçu' : 'Soins Prodigués'}
                        </button>
                    ))}

                    <Link
                        to="/"
                        className="bg-[#5e67ac] text-[#cbd1ff] rounded-full py-2 px-6 ml-auto hover:bg-[#4f5796] transition-colors"
                    >
                        Retour à l'accueil
                    </Link>
                </div>

                {/* Graph Container */}
                <div className="w-full h-[600px] bg-[#f1f3ff] rounded-3xl p-4 mt-4 shadow-[0_0_50px_0.1px_#cbd1ff]">
                    <canvas ref={chartRef} />
                </div>
            </main>
        </div>
    );
};

export default Progress;