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
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        totalPassengers: 0,
        passengersDeluxe: 0,
        roomsBookedDeluxe: 0,
        passengersPremiumGold: 0,
        roomsBookedPremiumGold: 0,
        passengersPremiumSilver: 0,
        roomsBookedPremiumSilver: 0,
        passengersNormal: 0,
        roomsBookedNormal: 0,
        cleaningStaffCost: 0,
        foodStaffCost: 0,
        externalActivityCost: 0
    });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const sumPassengers =
            Number(formData.passengersDeluxe) +
            Number(formData.passengersPremiumGold) +
            Number(formData.passengersPremiumSilver) +
            Number(formData.passengersNormal);

        if (Number(sumPassengers) !== Number(formData.totalPassengers)) {
            alert(`Passenger count mismatch! Total: ${formData.totalPassengers}, Breakdown Sum: ${sumPassengers}. Please correct the counts.`);
            return;
        }

        try {
            await api.post('/cruises/history', formData);
            setIsModalOpen(false);
            fetchCruises();
            alert('Trip history added successfully!');
            setFormData({
                name: '', startDate: '', endDate: '', totalPassengers: 0,
                passengersDeluxe: 0, roomsBookedDeluxe: 0,
                passengersPremiumGold: 0, roomsBookedPremiumGold: 0,
                passengersPremiumSilver: 0, roomsBookedPremiumSilver: 0,
                passengersNormal: 0, roomsBookedNormal: 0,
                cleaningStaffCost: 0, foodStaffCost: 0, externalActivityCost: 0
            });
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add trip history');
        }
    };

    // Filter logic
    const filteredCruises = cruises.filter(cruise => {
        const date = new Date(cruise.startDate);
        const matchesSearch = cruise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = filterMonth === '' || date.getMonth().toString() === filterMonth;
        const matchesYear = filterYear === '' || date.getFullYear().toString() === filterYear;
        return matchesSearch && matchesMonth && matchesYear;
    });

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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trips History</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">View all past cruise trips and their revenue performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-80 transition-opacity"
                    >
                        + Add Trip History
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="relative group z-10">
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors pr-8 cursor-pointer outline-none"
                        >
                            <option value="">All Months</option>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <option key={m} value={i}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative group z-10">
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors pr-8 cursor-pointer outline-none"
                        >
                            <option value="">All Years</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all placeholder:text-gray-400 dark:text-gray-200"
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

            {/* Add Trip Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Trip History</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Enter complete post-trip data</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white text-2xl font-bold">&times;</button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Trip Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cruise Name</label>
                                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" placeholder="e.g. Caribbean Bliss" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Start Date</label>
                                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">End Date</label>
                                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Passengers</label>
                                        <input required type="number" name="totalPassengers" value={formData.totalPassengers} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                    </div>
                                </div>

                                {/* Passenger Breakdown */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Room & Passenger Breakdown</h3>

                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white mb-2">Deluxe (Revenue: 35k/room)</div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Booked Rooms</label><input type="number" name="roomsBookedDeluxe" value={formData.roomsBookedDeluxe} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Passengers</label><input type="number" name="passengersDeluxe" value={formData.passengersDeluxe} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white mb-2">Premium Gold (Revenue: 30k/room)</div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Booked Rooms</label><input type="number" name="roomsBookedPremiumGold" value={formData.roomsBookedPremiumGold} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Passengers</label><input type="number" name="passengersPremiumGold" value={formData.passengersPremiumGold} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white mb-2">Premium Silver (Revenue: 27k/room)</div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Booked Rooms</label><input type="number" name="roomsBookedPremiumSilver" value={formData.roomsBookedPremiumSilver} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Passengers</label><input type="number" name="passengersPremiumSilver" value={formData.passengersPremiumSilver} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 items-end">
                                        <div className="col-span-2 text-sm font-bold text-gray-900 dark:text-white mb-2">Normal (Revenue: 23k/room)</div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Booked Rooms</label><input type="number" name="roomsBookedNormal" value={formData.roomsBookedNormal} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                        <div className="space-y-1"><label className="text-xs text-gray-500">Passengers</label><input type="number" name="passengersNormal" value={formData.passengersNormal} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg dark:text-white" /></div>
                                    </div>
                                </div>

                                {/* Expenses */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Expenses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cleaning Staff</label>
                                            <input type="number" name="cleaningStaffCost" value={formData.cleaningStaffCost} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Food Staff</label>
                                            <input type="number" name="foodStaffCost" value={formData.foodStaffCost} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">External Activities</label>
                                            <input type="number" name="externalActivityCost" value={formData.externalActivityCost} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:opacity-80 transition-opacity">Add History</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripHistory;
