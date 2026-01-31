import React, { useEffect, useState } from 'react';
import {
    Search, ChevronDown, ChevronRight, Loader2, ArrowRight, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TripHistory = () => {
    const [cruises, setCruises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCruises();
    }, []);

    const fetchCruises = async () => {
        try {
            const res = await api.get('/cruises');
            setCruises(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'CANCELLED': return 'bg-gray-50 text-gray-400 border-gray-100 line-through';
            case 'UPCOMING': return 'bg-black text-white border-black';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Filter logic
    const filteredCruises = cruises.filter(cruise =>
        cruise.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Trips History</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">View all past cruise trips and their revenue performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors">
                        Stock Trends
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
                        All Trips
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {/* Placeholder for Dropdown (Enterprise feel often has these collapsed) */}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trips..."
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
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Cruise</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Dates</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Passengers</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-6 px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCruises.length > 0 ? (
                                filteredCruises.map((cruise) => (
                                    <tr
                                        key={cruise.id}
                                        className="border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/cruises/${cruise.id}`)}
                                    >
                                        <td className="py-6 px-8">
                                            <p className="font-bold text-gray-900">{cruise.name}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="font-medium text-sm text-gray-500">
                                                {formatDate(cruise.startDate)} - {formatDate(cruise.endDate)}
                                            </p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="font-bold text-gray-900">${cruise.revenue?.totalRevenue.toLocaleString() || '0'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-bold text-gray-900">{cruise.registered}</span>
                                                <span className="text-gray-400">/ {cruise.maxCapacity}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(cruise.status)} uppercase tracking-wide`}>
                                                {cruise.status}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
                                                View Details
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <p className="text-gray-400 font-medium">No trips found matching your search.</p>
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

export default TripHistory;
