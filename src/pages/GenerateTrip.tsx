import { useState, useEffect } from 'react';
import {
    Plus, Edit, Archive, Trash2, Calendar, MapPin, Users,
    Loader2, AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import TripForm, { type TripFormData } from '../components/TripForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface RoomCategory {
    id: string;
    name: string;
    price: number;
    capacity: number;
    rooms: { status: string }[];
}

interface Staff {
    id: string;
    name: string;
    role: string;
    designation: string;
    salary: number;
}

interface Activity {
    id: string;
    name: string;
    type: string;
    cost: number;
}

interface Cruise {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    boardingLocation: string;
    destination: string;
    status: string;
    totalPassengers: number;
    roomsBookedDeluxe: number;
    roomsBookedPremiumGold: number;
    roomsBookedPremiumSilver: number;
    roomsBookedNormal: number;
    staff: { id: string }[];
    activities: { activityId: string; id?: string }[];
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const GenerateTrip = () => {
    const [loading, setLoading] = useState(true);
    const [trips, setTrips] = useState<Cruise[]>([]);
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [activitiesList, setActivitiesList] = useState<Activity[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Cruise | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState<Cruise | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tripsRes, catsRes, staffRes, actsRes] = await Promise.all([
                api.get('/cruises?isArchived=false'),
                api.get('/room-categories'),
                api.get('/staff'),
                api.get('/activities')
            ]);
            setTrips(tripsRes.data);
            setCategories(catsRes.data);
            setStaffList(staffRes.data);
            setActivitiesList(actsRes.data);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateTrip = async (formData: TripFormData) => {
        setIsSubmitting(true);
        try {
            await api.post('/cruises/history', formData);
            alert('Trip created successfully!');
            await loadData();
            setIsFormOpen(false);
        } catch (err: unknown) {
            console.error('Failed to create trip', err);
            const msg = (err as ApiError).response?.data?.message || 'Failed to create trip. Please try again.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTrip = async (formData: TripFormData) => {
        if (!editingTrip) return;
        setIsSubmitting(true);
        try {
            await api.put(`/cruises/${editingTrip.id}/history`, formData);
            alert('Trip updated successfully!');
            await loadData();
            setIsFormOpen(false);
            setEditingTrip(null);
        } catch (err: unknown) {
            console.error('Failed to update trip', err);
            const msg = (err as ApiError).response?.data?.message || 'Failed to update trip. Please try again.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchiveTrip = async (id: string) => {
        if (!window.confirm('Are you sure you want to archive this trip? It will be moved to Trip History and become read-only.')) return;
        try {
            await api.put(`/cruises/${id}/archive`);
            alert('Trip successfully moved to history!');
            await loadData();
        } catch (err: unknown) {
            console.error('Failed to archive trip', err);
            const msg = (err as ApiError).response?.data?.message || 'Failed to archive trip. Ensure the trip is completed.';
            alert(msg);
        }
    };

    const handleDeleteTrip = async () => {
        if (!tripToDelete) return;
        try {
            await api.delete(`/cruises/${tripToDelete.id}`);
            await loadData();
            setDeleteModalOpen(false);
            setTripToDelete(null);
        } catch (err: unknown) {
            console.error('Failed to delete trip', err);
            const msg = (err as ApiError).response?.data?.message || 'Failed to delete trip.';
            alert(msg);
        }
    };

    const openCreateModal = () => {
        setEditingTrip(null);
        setIsFormOpen(true);
    };

    const openEditModal = (trip: Cruise) => {
        setEditingTrip(trip);
        setIsFormOpen(true);
    };

    const confirmDelete = (trip: Cruise) => {
        setTripToDelete(trip);
        setDeleteModalOpen(true);
    };

    const getInitialFormData = (trip: Cruise): TripFormData => ({
        name: trip.name,
        boardingLocation: trip.boardingLocation,
        destination: trip.destination,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
        roomsBookedDeluxe: trip.roomsBookedDeluxe,
        roomsBookedPremiumGold: trip.roomsBookedPremiumGold,
        roomsBookedPremiumSilver: trip.roomsBookedPremiumSilver,
        roomsBookedNormal: trip.roomsBookedNormal,
        selectedStaffIds: trip.staff ? trip.staff.map(s => s.id) : [],
        selectedActivityIds: trip.activities ? trip.activities.map((a) => a.activityId || a.id || '') : []
    });

    if (loading && !isFormOpen) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5] dark:text-white" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#e5e5e5] dark:text-white tracking-tight mb-2 uppercase">Trip Management</h1>
                    <p className="text-gray-500 dark:text-[#a0a0a0] font-medium text-lg">Manage active trips, create new schedules, and archive completed voyages.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-[#b8935e] text-[#1a1a1a] px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2 shadow-lg hover:bg-[#a07d4d]"
                >
                    <Plus className="w-4 h-4" /> New Trip
                </button>
            </div>


            <div className="grid grid-cols-1 gap-6">
                {trips.length === 0 ? (
                    <div className="text-center py-20 bg-[#333333] dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-[#a0a0a0] font-bold uppercase tracking-widest">No Active Trips Found</p>
                        <button onClick={openCreateModal} className="mt-4 text-blue-500 hover:underline font-bold text-sm uppercase">Create your first trip</button>
                    </div>
                ) : (
                    trips.map(trip => {
                        const isCompleted = new Date(trip.endDate) < new Date();
                        return (
                            <div key={trip.id} className="bg-[#2a2a2a] dark:bg-gray-800 rounded-[24px] p-6 border border-[#3a3a3a] dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        trip.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {trip.status}
                                                    </span>
                                                    {isCompleted && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                                            <AlertTriangle className="w-3 h-3" /> Ready to Archive
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-black text-[#e5e5e5] dark:text-white uppercase">{trip.name}</h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3 text-gray-500 dark:text-[#a0a0a0]">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Dates</p>
                                                    <p className="text-sm font-bold text-[#e5e5e5] dark:text-white">
                                                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500 dark:text-[#a0a0a0]">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Route</p>
                                                    <p className="text-sm font-bold text-[#e5e5e5] dark:text-white">
                                                        {trip.boardingLocation} → {trip.destination}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500 dark:text-[#a0a0a0]">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Manifest</p>
                                                    <p className="text-sm font-bold text-[#e5e5e5] dark:text-white">
                                                        {trip.totalPassengers} Passengers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 lg:border-l border-[#3a3a3a] dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => openEditModal(trip)}
                                                className="flex-1 bg-[#333333] hover:bg-[#3a3a3a] text-[#e5e5e5] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                                title="Edit Trip"
                                            >
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(trip)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                                                title="Delete Trip"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {isCompleted && (
                                            <button
                                                onClick={() => handleArchiveTrip(trip.id)}
                                                className="w-full bg-[#b8935e] hover:bg-[#a07d4d] text-[#1a1a1a] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md"
                                            >
                                                <Archive className="w-4 h-4" /> Move to History
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>


            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#b8935e]/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#2a2a2a] dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <TripForm
                                initialData={editingTrip ? getInitialFormData(editingTrip) : undefined}
                                categories={categories}
                                staffList={staffList}
                                activitiesList={activitiesList}
                                onSubmit={editingTrip ? handleUpdateTrip : handleCreateTrip}
                                isSubmitting={isSubmitting}
                                buttonText={editingTrip ? "Update Trip" : "Generate Trip"}
                                onCancel={() => setIsFormOpen(false)}
                                title={editingTrip ? "Edit Trip Details" : "Generate New Trip"}
                            />
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteTrip}
                title="Delete Trip"
                message={`Are you sure you want to delete "${tripToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default GenerateTrip;
