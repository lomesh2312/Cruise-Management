import { useEffect, useState } from 'react';
import {
    Search, ChevronDown, ChevronRight, Loader2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Pagination from '../components/Pagination';

interface Cruise {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    revenue?: {
        totalRevenue: number;
        totalExpenses: number;
    };
}

const TripHistory = () => {
    const [cruises, setCruises] = useState<Cruise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();



    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchCruises()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchCruises = async () => {
        try {
            const res = await api.get('/cruises?isArchived=true');
            setCruises(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusStyle = (cruise: Cruise) => {
        const revenue = cruise.revenue?.totalRevenue || 0;
        const expenses = cruise.revenue?.totalExpenses || 0;
        const isProfit = revenue > expenses;

        if (isProfit) {
            return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
        }
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };



    const handleDeleteClick = (id: string) => {
        setTripToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!tripToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/cruises/${tripToDelete}`);
            fetchCruises();
        } catch (err) {
            console.error(err);
            alert('Failed to delete trip');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setTripToDelete(null);
        }
    };

    const filteredCruises = cruises.filter(cruise => {
        const date = new Date(cruise.startDate);
        const endDate = new Date(cruise.endDate);
        const now = new Date();
        const isCompleted = endDate < now;

        const matchesSearch = cruise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = filterMonth === '' || date.getMonth().toString() === filterMonth;
        const matchesYear = filterYear === '' || date.getFullYear().toString() === filterYear;

        return isCompleted && matchesSearch && matchesMonth && matchesYear;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTrips = filteredCruises.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCruises.length / itemsPerPage);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5] dark:text-white" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#e5e5e5] dark:text-white uppercase tracking-tighter">Trip History</h1>
                    <p className="text-gray-500 dark:text-[#a0a0a0] font-bold text-xs mt-1 uppercase tracking-widest">Performance Archive</p>
                </div>
            </div>

            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#2a2a2a] dark:bg-gray-800 p-2 rounded-2xl border border-[#3a3a3a] dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="relative group z-10">
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2 bg-[#333333] dark:bg-gray-700 rounded-xl text-sm font-black text-[#e5e5e5] dark:text-white hover:bg-[#b8935e] hover:text-white dark:hover:bg-[#2a2a2a] dark:hover:text-[#e5e5e5] transition-all pr-8 cursor-pointer outline-none border border-[#3a3a3a] dark:border-gray-600"
                        >
                            <option value="">All Months</option>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <option key={m} value={i}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0] pointer-events-none" />
                    </div>

                    <div className="relative group z-10">
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="appearance-none flex items-center gap-2 px-4 py-2 bg-[#333333] dark:bg-gray-700 rounded-xl text-sm font-black text-[#e5e5e5] dark:text-white hover:bg-[#b8935e] hover:text-white dark:hover:bg-[#2a2a2a] dark:hover:text-[#e5e5e5] transition-all pr-8 cursor-pointer outline-none border border-[#3a3a3a] dark:border-gray-600"
                        >
                            <option value="">All Years</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0] pointer-events-none" />
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#333333] dark:bg-gray-700 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 outline-none transition-all placeholder:text-[#a0a0a0] dark:text-gray-200"
                    />
                </div>
            </div>

            
            <div className="bg-[#2a2a2a] dark:bg-gray-800 rounded-[32px] border border-[#3a3a3a] dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-gray-700">
                                <th className="text-left py-6 px-8 text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">Cruise</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">Dates</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">Revenue</th>
                                <th className="text-left py-6 px-8 text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="text-right py-6 px-8 text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTrips.length > 0 ? (
                                currentTrips.map((cruise) => (
                                    <tr
                                        key={cruise.id}
                                        onClick={() => navigate(`/cruises/${cruise.id}`)}
                                        className="border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-[#333333]/50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-6 px-8">
                                            <p className="font-bold text-[#e5e5e5] dark:text-white">{cruise.name}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="font-medium text-sm text-gray-500 dark:text-[#a0a0a0]">
                                                {formatDate(cruise.startDate)} - {formatDate(cruise.endDate)}
                                            </p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="font-bold text-[#e5e5e5] dark:text-white">${cruise.revenue?.totalRevenue.toLocaleString() || '0'}</p>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(cruise)} uppercase tracking-widest`}>
                                                {(cruise.revenue?.totalRevenue || 0) > (cruise.revenue?.totalExpenses || 0) ? 'Success' : 'Loss'}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/cruises/${cruise.id}`)}
                                                    className="flex items-center gap-2 font-black text-[#e5e5e5] dark:text-white uppercase tracking-widest text-xs hover:gap-4 transition-all group"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(cruise.id);
                                                    }}
                                                    className="p-2 text-[#a0a0a0] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-[#a0a0a0] dark:text-gray-500 font-medium">No trips found matching your search.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                
                {filteredCruises.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredCruises.length}
                    />
                )}
            </div>

            
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Trip Archive"
                message="Are you sure you want to delete this trip history? This action cannot be undone and will remove all associated revenue data."
                isDeleting={isDeleting}
            />
        </div>
    );
};


export default TripHistory;
