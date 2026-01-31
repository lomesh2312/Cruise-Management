import React, { useEffect, useState } from 'react';
import {
    Search, ChevronDown, Plus, Filter, Loader2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RoomsManagement = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredRooms = rooms.filter(room =>
        room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(room.roomNumber || '').includes(searchTerm)
    );

    const getStatusConfig = (status: string) => {
        if (status === 'MAINTENANCE') {
            return {
                label: 'Under Maintenance',
                className: 'bg-gray-200 text-gray-700'
            };
        }
        return {
            label: 'Normal',
            className: 'bg-gray-100 text-gray-500'
        };
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Room Management</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">Manage all rooms and categories on the cruise ship.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4" /> Add New Room
                    </button>
                    <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors">
                        Manage Categories
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100">
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                        <Filter className="w-4 h-4" />
                        All Rooms
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Room</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room, index) => {
                                    const { label, className } = getStatusConfig(room.status);
                                    // Simulated room number if not present in API data for display consistency
                                    const displayRoomNumber = room.roomNumber || `A10${index + 1}`;

                                    return (
                                        <tr
                                            key={room.id}
                                            className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-gray-900">{displayRoomNumber}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{displayRoomNumber}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <p className="font-medium text-sm text-gray-700">{room.type} Suite</p>
                                            </td>
                                            <td className="py-6 px-8">
                                                <p className="font-bold text-gray-900">${room.price.toLocaleString()}</p>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold ${className}`}>
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                                        Edit Details
                                                    </button>
                                                    <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-black transition-colors">
                                                        List
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-gray-400 font-medium">No rooms found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoomsManagement;
