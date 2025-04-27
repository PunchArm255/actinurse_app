import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import settingsIcon from '../assets/settings.svg';
import notificationIcon from '../assets/notification.svg';
import profileImage from '../assets/profile.png';

const Stocks = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [stockData, setStockData] = useState(null);
    const [activeTab, setActiveTab] = useState('items'); // 'items' or 'meds'
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consumeAmount, setConsumeAmount] = useState(1);
    const [stockMode, setStockMode] = useState('FIFO'); // 'FIFO' or 'LIFO'

    // Initialize stock data
    useEffect(() => {
        const savedStockData = JSON.parse(localStorage.getItem('stockData'));

        if (savedStockData) {
            setStockData(savedStockData);
        } else {
            // Initial stock data
            const initialStockData = {
                dotationInitiale: 5000,
                dotationConsommee: 0,
                dotationRestante: 5000,
                items: [
                    { id: 1, name: 'Les gants', stock: 100, price: 10, consumed: 0 },
                    { id: 2, name: 'Seringues', stock: 80, price: 15, consumed: 0 },
                    { id: 3, name: 'Intranules', stock: 50, price: 25, consumed: 0 },
                    { id: 4, name: 'Couton', stock: 120, price: 5, consumed: 0 },
                    { id: 5, name: 'Sparadraps', stock: 40, price: 20, consumed: 0 },
                    { id: 6, name: 'Les lames', stock: 60, price: 12, consumed: 0 },
                    { id: 7, name: 'Tubuleures', stock: 35, price: 30, consumed: 0 },
                    { id: 8, name: 'Transfuseurs', stock: 25, price: 45, consumed: 0 },
                    { id: 9, name: 'Lunettes', stock: 15, price: 50, consumed: 0 },
                    { id: 10, name: 'Serum salé', stock: 70, price: 18, consumed: 0 },
                    { id: 11, name: 'Seru glycose', stock: 65, price: 22, consumed: 0 },
                    { id: 12, name: 'Andol', stock: 45, price: 8, consumed: 0 },
                    { id: 13, name: 'Flacons mauves', stock: 30, price: 15, consumed: 0 },
                    { id: 14, name: 'Flacons rouges', stock: 35, price: 15, consumed: 0 },
                    { id: 15, name: 'Flacons noirs', stock: 40, price: 15, consumed: 0 },
                    { id: 16, name: 'Flacons blues', stock: 45, price: 15, consumed: 0 },
                ],
                meds: [
                    { id: 101, name: 'Aclave', stock: 40, price: 75, consumed: 0 },
                    { id: 102, name: 'Triaxon', stock: 30, price: 95, consumed: 0 },
                    { id: 103, name: 'Spasfon', stock: 60, price: 45, consumed: 0 },
                    { id: 104, name: 'Flexen', stock: 55, price: 65, consumed: 0 },
                    { id: 105, name: 'Acupan', stock: 35, price: 80, consumed: 0 },
                    { id: 106, name: 'Nph', stock: 25, price: 120, consumed: 0 },
                    { id: 107, name: 'Mixtard', stock: 20, price: 110, consumed: 0 },
                    { id: 108, name: 'Actrapid', stock: 30, price: 95, consumed: 0 },
                    { id: 109, name: 'Ventoline', stock: 45, price: 70, consumed: 0 },
                ]
            };
            setStockData(initialStockData);
            localStorage.setItem('stockData', JSON.stringify(initialStockData));
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Save stock data whenever it changes
    useEffect(() => {
        if (stockData) {
            localStorage.setItem('stockData', JSON.stringify(stockData));
        }
    }, [stockData]);

    // Filter items based on search query
    const getFilteredItems = () => {
        if (!searchQuery.trim() || !stockData) return activeTab === 'items' ? stockData?.items : stockData?.meds;

        const itemsToFilter = activeTab === 'items' ? stockData.items : stockData.meds;
        return itemsToFilter.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Handle item consumption
    const handleConsume = () => {
        if (!selectedItem || consumeAmount <= 0 || consumeAmount > selectedItem.stock) return;

        const itemList = activeTab === 'items' ? 'items' : 'meds';
        const totalCost = consumeAmount * selectedItem.price;

        // Check if there's enough dotation left
        if (totalCost > stockData.dotationRestante) {
            alert("Dotation insuffisante pour cette consommation!");
            return;
        }

        setStockData(prev => {
            const updatedItems = prev[itemList].map(item => {
                if (item.id === selectedItem.id) {
                    return {
                        ...item,
                        stock: item.stock - consumeAmount,
                        consumed: item.consumed + consumeAmount
                    };
                }
                return item;
            });

            return {
                ...prev,
                [itemList]: updatedItems,
                dotationConsommee: prev.dotationConsommee + totalCost,
                dotationRestante: prev.dotationRestante - totalCost
            };
        });

        closeModal();
    };

    // Reset stock and consumption data
    const handleReset = () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser le stock? Cette action ne peut pas être annulée.")) {
            const resetData = {
                ...stockData,
                dotationConsommee: 0,
                dotationRestante: stockData.dotationInitiale,
                items: stockData.items.map(item => ({ ...item, consumed: 0 })),
                meds: stockData.meds.map(med => ({ ...med, consumed: 0 }))
            };
            setStockData(resetData);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setConsumeAmount(1);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setConsumeAmount(1);
    };

    // Format number as currency
    const formatCurrency = (amount) => {
        return amount.toLocaleString('fr-FR') + ' DHs';
    };

    const filteredItems = getFilteredItems();

    if (!stockData) return <div className="p-8 text-center">Chargement...</div>;

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
                <h1 className="text-3xl md:text-5xl font-black text-[#4f5796] mb-4 md:mb-8">Gestion de Stock</h1>

                {/* Dotation Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#f1f3ff] rounded-2xl p-4 shadow-md text-center">
                        <h3 className="text-lg font-bold text-[#4f5796] mb-2">Dotation Initiale</h3>
                        <p className="text-2xl font-semibold text-[#4f5796]">
                            {formatCurrency(stockData.dotationInitiale)}
                        </p>
                    </div>

                    <div className="bg-[#ffd3d3] rounded-2xl p-4 shadow-md text-center">
                        <h3 className="text-lg font-bold text-[#ac5e5e] mb-2">Dotation Consommée</h3>
                        <p className="text-2xl font-semibold text-[#ac5e5e]">
                            {formatCurrency(stockData.dotationConsommee)}
                        </p>
                    </div>

                    <div className="bg-[#d3ffda] rounded-2xl p-4 shadow-md text-center">
                        <h3 className="text-lg font-bold text-[#437d4f] mb-2">Dotation Restante</h3>
                        <p className="text-2xl font-semibold text-[#437d4f]">
                            {formatCurrency(stockData.dotationRestante)}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Tabs */}
                        <div className="flex rounded-full bg-[#f1f3ff] p-1">
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${activeTab === 'items'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setActiveTab('items')}
                            >
                                Matériels
                            </button>
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${activeTab === 'meds'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setActiveTab('meds')}
                            >
                                Médicaments
                            </button>
                        </div>

                        {/* FIFO/LIFO toggle */}
                        <div className="flex rounded-full bg-[#f1f3ff] p-1">
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${stockMode === 'FIFO'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setStockMode('FIFO')}
                            >
                                FIFO
                            </button>
                            <button
                                className={`py-2 px-4 rounded-full transition-colors ${stockMode === 'LIFO'
                                    ? 'bg-[#4f5796] text-white'
                                    : 'text-[#4f5796] hover:bg-[#cbd1ff]'
                                    }`}
                                onClick={() => setStockMode('LIFO')}
                            >
                                LIFO
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Search */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-6 
                                   border border-[#cbd1ff] focus:border-[#4f5796] outline-none"
                        />

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="bg-[#ffd3d3] text-[#ac5e5e] rounded-full py-2 px-6 
                                     hover:bg-[#ffbcbc] transition-colors"
                        >
                            Réinitialiser
                        </button>

                        <Link
                            to="/"
                            className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 
                                     hover:bg-[#3a4170] transition-colors"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>

                {/* Stock Item List */}
                <div className="bg-[#f1f3ff] rounded-3xl p-4 shadow-[0_0_50px_0.1px_#cbd1ff]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <h3 className="font-bold text-[#4f5796]">{item.name}</h3>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Stock disponible:</p>
                                        <p className={`font-semibold ${item.stock < 10 ? 'text-red-500' :
                                            item.stock < 20 ? 'text-yellow-500' : 'text-green-600'
                                            }`}>
                                            {item.stock} unités
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Prix unitaire:</p>
                                        <p className="font-semibold text-[#4f5796]">{item.price} DHs</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 text-center">
                                    <span className="text-sm text-gray-500">
                                        Consommé: <span className="font-medium text-[#ac5e5e]">{item.consumed}</span> unités
                                    </span>
                                </div>
                            </div>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                Aucun article trouvé pour cette recherche.
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Consumption Modal */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn px-4">
                    <div className="bg-[#cbd1ff] p-4 md:p-6 rounded-3xl shadow-lg w-full max-w-md animate-slideUp">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#4f5796]">
                            Consommer: {selectedItem.name}
                        </h2>

                        <div className="bg-white rounded-xl p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Mode de stock:</span>
                                <span className="font-semibold text-[#4f5796]">{stockMode}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Stock disponible:</span>
                                <span className="font-semibold text-[#4f5796]">{selectedItem.stock} unités</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Prix unitaire:</span>
                                <span className="font-semibold text-[#4f5796]">{selectedItem.price} DHs</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-[#4f5796] font-semibold mb-2">
                                Quantité à consommer:
                            </label>
                            <div className="flex items-center">
                                <button
                                    className="bg-[#f1f3ff] text-[#4f5796] p-2 rounded-l-lg border border-[#cbd1ff]"
                                    onClick={() => setConsumeAmount(prev => Math.max(1, prev - 1))}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.stock}
                                    value={consumeAmount}
                                    onChange={(e) => setConsumeAmount(Math.min(selectedItem.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="text-center p-2 w-20 border-t border-b border-[#cbd1ff] bg-[#f1f3ff] text-[#4f5796]"
                                />
                                <button
                                    className="bg-[#f1f3ff] text-[#4f5796] p-2 rounded-r-lg border border-[#cbd1ff]"
                                    onClick={() => setConsumeAmount(prev => Math.min(selectedItem.stock, prev + 1))}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 mb-6">
                            <div className="flex justify-between font-semibold">
                                <span>Coût total:</span>
                                <span className="text-[#ac5e5e]">{formatCurrency(selectedItem.price * consumeAmount)}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <button
                                onClick={handleConsume}
                                className="bg-[#4f5796] text-[#cbd1ff] rounded-full py-2 px-6 hover:bg-[#3a4170] transition-colors"
                                disabled={consumeAmount <= 0 || consumeAmount > selectedItem.stock}
                            >
                                Consommer
                            </button>
                            <button
                                onClick={closeModal}
                                className="bg-[#f1f3ff] text-[#4f5796] rounded-full py-2 px-6 hover:bg-[#e0e2ff] transition-colors"
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

export default Stocks;