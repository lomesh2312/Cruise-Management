import { useEffect, useState } from 'react';
import {
    Search, Loader2, Image as ImageIcon, Check, X, Trash2, Edit2
} from 'lucide-react';
import api from '../services/api';

interface Room {
    id: string;
    number: string;
    status: string;
    price: number;
    capacity: number;
    description: string;
}

interface Category {
    id: string;
    name: string;
    images: string[];
    features: string[];
    rooms: Room[];
    price: number;
    capacity: number;
}

const RoomsManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    const [isEditingImages, setIsEditingImages] = useState(false);
    const [isEditingFeatures, setIsEditingFeatures] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false); 

    const [tempImages, setTempImages] = useState<string[]>([]);
    const [tempFeatures, setTempFeatures] = useState<string[]>([]);


    const [tempPrice, setTempPrice] = useState<number>(0);
    const [tempCapacity, setTempCapacity] = useState<number>(0);

    const [newImageInput, setNewImageInput] = useState('');
    const [newFeatureInput, setNewFeatureInput] = useState('');


    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [maintenanceReason, setMaintenanceReason] = useState('');
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
    const [bulkAddData, setBulkAddData] = useState({
        startNumber: 101,
        count: 1,
        prefix: ''
    });
    const [isAddingBulk, setIsAddingBulk] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/room-categories');
                setCategories(res.data);
                if (res.data.length > 0 && !activeTab) {
                    const preferredOrder = ['Deluxe', 'Premium Gold', 'Premium Silver', 'Normal'];
                    const sorted = res.data.sort((a: Category, b: Category) => preferredOrder.indexOf(a.name) - preferredOrder.indexOf(b.name));
                    setActiveTab(sorted[0].id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();

    }, [activeTab]);

    const activeCategory = categories.find(c => c.id === activeTab);


    useEffect(() => {
        if (activeCategory) {
            setTempPrice(activeCategory.price);
            setTempCapacity(activeCategory.capacity);
            setIsEditingSettings(false);
            setIsEditingImages(false);
            setIsEditingFeatures(false);
        }
    }, [activeCategory]);



    const saveSettings = async () => {
        if (!activeCategory) return;
        try {
            await api.put(`/room-categories/${activeCategory.id}`, {
                price: tempPrice,
                capacity: tempCapacity
            });
            const updated = categories.map(c => c.id === activeCategory.id ? { ...c, price: tempPrice, capacity: tempCapacity } : c);
            setCategories(updated);
            setIsEditingSettings(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save settings');
        }
    };


    const startEditingImages = () => {
        if (!activeCategory) return;
        setTempImages([...activeCategory.images]);
        setIsEditingImages(true);
    };

    const saveImages = async () => {
        if (!activeCategory) return;
        try {
            await api.put(`/room-categories/${activeCategory.id}`, {
                images: tempImages
            });
            const updated = categories.map(c => c.id === activeCategory.id ? { ...c, images: tempImages } : c);
            setCategories(updated);
            setIsEditingImages(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save images');
        }
    };

    const addImage = () => {
        if (newImageInput && tempImages.length < 6) {
            setTempImages([...tempImages, newImageInput]);
            setNewImageInput('');
        }
    };

    const removeImage = (index: number) => {
        setTempImages(tempImages.filter((_, i) => i !== index));
    };


    const startEditingFeatures = () => {
        if (!activeCategory) return;
        setTempFeatures([...activeCategory.features]);
        setIsEditingFeatures(true);
    };

    const saveFeatures = async () => {
        if (!activeCategory) return;
        try {
            await api.put(`/room-categories/${activeCategory.id}`, {
                features: tempFeatures
            });
            const updated = categories.map(c => c.id === activeCategory.id ? { ...c, features: tempFeatures } : c);
            setCategories(updated);
            setIsEditingFeatures(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save features');
        }
    };

    const addFeature = () => {
        if (newFeatureInput) {
            setTempFeatures([...tempFeatures, newFeatureInput]);
            setNewFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setTempFeatures(tempFeatures.filter((_, i) => i !== index));
    };


    const openRoomModal = (room: Room) => {
        setSelectedRoom(room);
        setMaintenanceReason('');
        setIsMaintenanceModalOpen(true);
    };

    const updateRoomDetails = async (status: string, overrideNumber?: string) => {
        if (!selectedRoom) return;
        try {
            const newNumber = overrideNumber || selectedRoom.number;

            await api.put(`/rooms/${selectedRoom.id}`, {
                status,
                number: newNumber,
                description: status === 'MAINTENANCE' ? maintenanceReason : undefined
            });


            const updatedCategories = categories.map(cat => {
                if (cat.rooms.some(r => r.id === selectedRoom.id)) {
                    return {
                        ...cat,
                        rooms: cat.rooms.map(r => r.id === selectedRoom.id ? { ...r, status, number: newNumber } : r)
                    };
                }
                return cat;
            });
            setCategories(updatedCategories);
            setIsMaintenanceModalOpen(false);
            setSelectedRoom(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update room');
        }
    };


    const addBulkRooms = async () => {
        if (!activeCategory) return;
        setIsAddingBulk(true);
        try {
            const newRooms: Room[] = [];
            for (let i = 0; i < bulkAddData.count; i++) {
                const num = bulkAddData.prefix + (bulkAddData.startNumber + i);
                const res = await api.post('/rooms', {
                    categoryId: activeCategory.id,
                    number: num,
                    status: 'AVAILABLE'
                });
                newRooms.push(res.data);
            }

            const updatedCategories = categories.map(cat => {
                if (cat.id === activeCategory.id) {
                    return {
                        ...cat,
                        rooms: [...cat.rooms, ...newRooms].sort((a, b) => {
                            const numA = parseInt(a.number.replace(/\D/g, '')) || 0;
                            const numB = parseInt(b.number.replace(/\D/g, '')) || 0;
                            return numA - numB;
                        })
                    };
                }
                return cat;
            });
            setCategories(updatedCategories);
            setIsAddRoomModalOpen(false);
            setBulkAddData({ startNumber: bulkAddData.startNumber + bulkAddData.count, count: 1, prefix: bulkAddData.prefix });
        } catch (err) {
            console.error(err);
            alert('Failed to add rooms. Some rooms may have been created.');
        } finally {
            setIsAddingBulk(false);
        }
    };

    const deleteRoom = async (e: React.MouseEvent, roomId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this room?')) return;
        try {
            await api.delete(`/rooms/${roomId}`);
            const updatedCategories = categories.map(cat => ({
                ...cat,
                rooms: cat.rooms.filter(r => r.id !== roomId)
            }));
            setCategories(updatedCategories);
        } catch (err) {
            console.error(err);
            alert('Failed to delete room');
        }
    };


    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5]" />
        </div>
    );

    if (!activeCategory) return <div>No categories found.</div>;

    const filteredRooms = activeCategory.rooms.filter(room =>
        (room.number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            <div>
                <h1 className="text-3xl font-black tracking-tight text-[#e5e5e5]">Room Management</h1>
                <p className="text-[#a0a0a0] font-medium text-sm mt-1">Manage room categories, images, features, pricing, and inventory.</p>
            </div>

            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat.id
                            ? 'bg-[#b8935e] text-white shadow-lg scale-105'
                            : 'bg-[#2a2a2a] text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#333333]'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            
            <div className="space-y-8">

                
                <div className="bg-[#2a2a2a] p-6 rounded-[32px] border border-[#3a3a3a] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-[#e5e5e5]">Category Settings</h2>
                        </div>
                        {isEditingSettings ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingSettings(false)} className="p-2 text-[#a0a0a0] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
                                <button onClick={saveSettings} className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors"><Check className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditingSettings(true)} className="text-xs font-bold text-[#a0a0a0] hover:text-[#e5e5e5] flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Edit Settings
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price per Trip</label>
                            {isEditingSettings ? (
                                <input
                                    type="number"
                                    value={tempPrice}
                                    onChange={e => setTempPrice(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-[#333333] rounded-xl font-bold text-[#e5e5e5] border-none focus:ring-2 focus:ring-black/5"
                                />
                            ) : (
                                <p className="text-2xl font-black text-[#e5e5e5]">${activeCategory.price.toLocaleString()}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Occupancy (Persons)</label>
                            {isEditingSettings ? (
                                <input
                                    type="number"
                                    value={tempCapacity}
                                    onChange={e => setTempCapacity(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-[#333333] rounded-xl font-bold text-[#e5e5e5] border-none focus:ring-2 focus:ring-black/5"
                                />
                            ) : (
                                <p className="text-2xl font-black text-[#e5e5e5]">{activeCategory.capacity} Persons</p>
                            )}
                        </div>
                    </div>
                </div>


                
                <div className="bg-[#2a2a2a] p-6 rounded-[32px] border border-[#3a3a3a] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-[#e5e5e5]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#e5e5e5]">Room Images</h2>
                        </div>
                        {isEditingImages ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingImages(false)} className="p-2 text-[#a0a0a0] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
                                <button onClick={saveImages} className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors"><Check className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <button onClick={startEditingImages} className="text-xs font-bold text-[#a0a0a0] hover:text-[#e5e5e5] flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Edit Images
                            </button>
                        )}
                    </div>

                    {isEditingImages ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Paste image URL here..."
                                    value={newImageInput}
                                    onChange={(e) => setNewImageInput(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-[#333333] rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
                                    disabled={tempImages.length >= 6}
                                />
                                <button
                                    onClick={addImage}
                                    disabled={tempImages.length >= 6 || !newImageInput}
                                    className="px-4 py-2 bg-[#b8935e] text-white rounded-xl text-sm font-bold disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                            <p className="text-xs text-[#a0a0a0] font-medium">{tempImages.length}/6 images used</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tempImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video group">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-2xl shadow-sm" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCategory.images.length > 0 ? activeCategory.images.map((img, idx) => (
                                <div key={idx} className="aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-[#3a3a3a]">
                                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                </div>
                            )) : (
                                <p className="col-span-3 text-center py-12 text-[#a0a0a0] text-sm">No images added yet.</p>
                            )}
                        </div>
                    )}
                </div>

                
                <div className="bg-[#2a2a2a] p-6 rounded-[32px] border border-[#3a3a3a] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center">
                                <Check className="w-5 h-5 text-[#e5e5e5]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#e5e5e5]">Room Features</h2>
                        </div>
                        {isEditingFeatures ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingFeatures(false)} className="p-2 text-[#a0a0a0] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"><X className="w-5 h-5" /></button>
                                <button onClick={saveFeatures} className="p-2 text-green-500 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors"><Check className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <button onClick={startEditingFeatures} className="text-xs font-bold text-[#a0a0a0] hover:text-[#e5e5e5] flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Edit Features
                            </button>
                        )}
                    </div>

                    {isEditingFeatures ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a new feature..."
                                    value={newFeatureInput}
                                    onChange={(e) => setNewFeatureInput(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-[#333333] rounded-xl text-sm border-none focus:ring-2 focus:ring-black/5"
                                    onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                />
                                <button onClick={addFeature} className="px-4 py-2 bg-[#b8935e] text-white rounded-xl text-sm font-bold">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tempFeatures.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-sm font-medium text-gray-700">
                                        {feat}
                                        <button onClick={() => removeFeature(idx)} className="text-[#a0a0a0] hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {activeCategory.features.length > 0 ? activeCategory.features.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-[#333333] rounded-2xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                    <span className="text-sm font-bold text-gray-700">{feat}</span>
                                </div>
                            )) : (
                                <p className="col-span-4 text-center py-4 text-[#a0a0a0] text-sm">No features listed.</p>
                            )}
                        </div>
                    )}
                </div>

                
                <div className="bg-[#2a2a2a] p-6 rounded-[32px] border border-[#3a3a3a] shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold text-[#e5e5e5]">Room List ({filteredRooms.length})</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-[#a0a0a0] uppercase tracking-widest">Inventory Status</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#333333] rounded-full">
                                    <div className="w-1 h-1 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold text-gray-600">
                                        {activeCategory.rooms.filter(r => r.status === 'AVAILABLE').length}/{activeCategory.rooms.length} Available
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                                <input
                                    type="text"
                                    placeholder="Search room #..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-[#333333] rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddRoomModalOpen(true)}
                                className="px-5 py-2 bg-[#b8935e] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                            >
                                + Add Rooms
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {filteredRooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => openRoomModal(room)}
                                className={`p-4 rounded-2xl border transition-all group cursor-pointer text-center relative ${room.status === 'MAINTENANCE'
                                    ? 'bg-red-50 border-red-100 hover:border-red-300'
                                    : 'bg-[#333333] border-transparent hover:border-gray-200 hover:bg-[#2a2a2a] hover:shadow-lg'
                                    }`}
                            >
                                <button
                                    onClick={(e) => deleteRoom(e, room.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                <span className={`block text-xl font-black group-hover:scale-110 transition-transform ${room.status === 'MAINTENANCE' ? 'text-red-900' : 'text-[#e5e5e5]'
                                    }`}>{room.number}</span>

                                <div className="mt-2 flex flex-col items-center gap-1">
                                    <span className={`inline-block px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${room.status === 'MAINTENANCE' ? 'bg-red-100 text-red-700' : 'bg-[#e5e5e5]/10 text-[#e5e5e5]'
                                        }`}>
                                        {room.status === 'MAINTENANCE' ? 'Maintenance' : 'Available'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredRooms.length === 0 && (
                        <div className="text-center py-10 text-[#a0a0a0] font-medium">No rooms found.</div>
                    )}
                </div>

            </div>

            
            {isMaintenanceModalOpen && selectedRoom && (
                <div className="fixed inset-0 bg-[#b8935e]/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#2a2a2a] rounded-[32px] p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-[#e5e5e5]">Manage Room {selectedRoom.number}</h3>
                            <button onClick={() => setIsMaintenanceModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Room Number (Rename)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-[#333333] rounded-xl font-bold text-[#e5e5e5] border-none focus:ring-2 focus:ring-black"
                                    defaultValue={selectedRoom.number}
                                    id="roomNumberInput"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Room Status</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            const val = (document.getElementById('roomNumberInput') as HTMLInputElement).value;
                                            updateRoomDetails('AVAILABLE', val);
                                        }}
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${selectedRoom.status === 'AVAILABLE'
                                            ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                            : 'bg-[#333333] text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Available
                                    </button>
                                    <button
                                        disabled
                                        className={`py-3 px-4 rounded-xl font-bold text-sm transition-all opacity-50 ${selectedRoom.status === 'MAINTENANCE'
                                            ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                                            : 'bg-[#333333] text-gray-600'
                                            }`}
                                    >
                                        Maintenance
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Maintenance Reason</label>
                                <textarea
                                    className="w-full p-4 bg-[#333333] rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-red-500 h-32 resize-none placeholder:text-[#a0a0a0]"
                                    placeholder="Describe the issue (e.g., HVAC repair, painting)..."
                                    value={maintenanceReason}
                                    onChange={(e) => setMaintenanceReason(e.target.value)}
                                />
                                <p className="text-xs text-[#a0a0a0] mt-2 font-medium">Required if setting to Maintenance.</p>
                            </div>

                            <button
                                onClick={() => {
                                    const val = (document.getElementById('roomNumberInput') as HTMLInputElement).value;
                                    updateRoomDetails('MAINTENANCE', val);
                                }}
                                disabled={!maintenanceReason}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Update & Set Maintenance
                            </button>

                            {selectedRoom.status !== 'MAINTENANCE' && (
                                <button
                                    onClick={() => {
                                        const val = (document.getElementById('roomNumberInput') as HTMLInputElement).value;
                                        updateRoomDetails('AVAILABLE', val);
                                    }}
                                    className="w-full py-3 text-sm font-bold text-gray-500 hover:text-[#e5e5e5] transition-colors"
                                >
                                    Just Update Number
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            
            {isAddRoomModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#2a2a2a] rounded-[40px] p-10 w-full max-w-md shadow-2xl border border-[#3a3a3a] animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-[#e5e5e5]">Add Rooms</h3>
                                <p className="text-xs text-[#a0a0a0] font-bold uppercase tracking-widest mt-1">To {activeCategory.name}</p>
                            </div>
                            <button onClick={() => setIsAddRoomModalOpen(false)} className="p-3 bg-[#333333] rounded-full hover:bg-[#444444] transition-colors">
                                <X className="w-6 h-6 text-[#e5e5e5]" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-[#a0a0a0] uppercase tracking-[0.2em] mb-3">Prefix (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A"
                                        className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-[#b8935e]/20"
                                        value={bulkAddData.prefix}
                                        onChange={e => setBulkAddData({ ...bulkAddData, prefix: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[#a0a0a0] uppercase tracking-[0.2em] mb-3">Start Number</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-[#b8935e]/20"
                                        value={bulkAddData.startNumber}
                                        onChange={e => setBulkAddData({ ...bulkAddData, startNumber: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[#a0a0a0] uppercase tracking-[0.2em] mb-3">How many rooms?</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-[#b8935e]/20"
                                    value={bulkAddData.count}
                                    onChange={e => setBulkAddData({ ...bulkAddData, count: parseInt(e.target.value) || 1 })}
                                />
                            </div>

                            <button
                                onClick={addBulkRooms}
                                disabled={isAddingBulk || bulkAddData.count < 1}
                                className="w-full py-5 bg-[#b8935e] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#b8935e]/20 hover:shadow-2xl hover:bg-[#a6824d] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isAddingBulk ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>Add Inventory</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsManagement;
