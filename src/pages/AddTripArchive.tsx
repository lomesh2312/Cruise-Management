import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin, Users, Hotel, Music,
    Check, Loader2, Archive
} from 'lucide-react';
import api from '../services/api';

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

interface ArchiveFormData {
    name: string;
    boardingLocation: string;
    destination: string;
    startDate: string;
    endDate: string;
    roomsBookedDeluxe: number;
    roomsBookedPremiumGold: number;
    roomsBookedPremiumSilver: number;
    roomsBookedNormal: number;
    selectedStaffIds: string[];
    selectedActivityIds: string[];
}

const AddTripArchive = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [activitiesList, setActivitiesList] = useState<Activity[]>([]);

    const [formData, setFormData] = useState<ArchiveFormData>({
        name: '',
        boardingLocation: '',
        destination: '',
        startDate: '',
        endDate: '',
        roomsBookedDeluxe: 0,
        roomsBookedPremiumGold: 0,
        roomsBookedPremiumSilver: 0,
        roomsBookedNormal: 0,
        selectedStaffIds: [],
        selectedActivityIds: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catsRes, staffRes, actsRes] = await Promise.all([
                    api.get('/room-categories'),
                    api.get('/staff'),
                    api.get('/activities')
                ]);
                setCategories(catsRes.data);
                setStaffList(staffRes.data);
                setActivitiesList(actsRes.data);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);


    const getYesterday = () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    };
    const maxDate = getYesterday();


    const getCategoryDetails = useMemo(() => (name: string) => {
        const cat = categories.find(c => c.name === name);
        return {
            price: cat?.price || 0,
            capacity: cat?.capacity || 0,
            available: cat?.rooms.filter(r => r.status === 'AVAILABLE').length || 0,
            total: cat?.rooms.length || 0
        };
    }, [categories]);


    const calculations = useMemo(() => {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const durationDays = (!formData.startDate || !formData.endDate) ? 0 :
            Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));


        const deluxe = getCategoryDetails('Deluxe');
        const gold = getCategoryDetails('Premium Gold');
        const silver = getCategoryDetails('Premium Silver');
        const normal = getCategoryDetails('Normal');

        const paxDeluxe = Number(formData.roomsBookedDeluxe) * deluxe.capacity;
        const paxGold = Number(formData.roomsBookedPremiumGold) * gold.capacity;
        const paxSilver = Number(formData.roomsBookedPremiumSilver) * silver.capacity;
        const paxNormal = Number(formData.roomsBookedNormal) * normal.capacity;

        const revDeluxe = Number(formData.roomsBookedDeluxe) * deluxe.price;
        const revGold = Number(formData.roomsBookedPremiumGold) * gold.price;
        const revSilver = Number(formData.roomsBookedPremiumSilver) * silver.price;
        const revNormal = Number(formData.roomsBookedNormal) * normal.price;

        const totalPassengers = paxDeluxe + paxGold + paxSilver + paxNormal;
        const totalTicketRevenue = revDeluxe + revGold + revSilver + revNormal;


        const selectedStaff = staffList.filter(s => formData.selectedStaffIds.includes(s.id));
        const staffCostPerDay = selectedStaff.reduce((acc, s) => acc + (s.salary / 30), 0);
        const totalStaffCost = staffCostPerDay * durationDays;


        const selectedActivities = activitiesList.filter(a => formData.selectedActivityIds.includes(a.id));
        const totalActivityCost = selectedActivities.reduce((acc, a) => acc + a.cost, 0);


        const totalExpenses = totalStaffCost + totalActivityCost;
        const netProfit = totalTicketRevenue - totalExpenses;

        return {
            durationDays,
            totalPassengers,
            breakdown: {
                paxDeluxe, paxGold, paxSilver, paxNormal
            },
            financials: {
                ticketRevenue: totalTicketRevenue,
                staffCost: totalStaffCost,
                activityCost: totalActivityCost,
                totalExpenses,
                netProfit
            }
        };


    }, [formData, staffList, activitiesList, getCategoryDetails]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleStaff = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedStaffIds: prev.selectedStaffIds.includes(id)
                ? prev.selectedStaffIds.filter(s => s !== id)
                : [...prev.selectedStaffIds, id]
        }));
    };

    const toggleActivity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedActivityIds: prev.selectedActivityIds.includes(id)
                ? prev.selectedActivityIds.filter(a => a !== id)
                : [...prev.selectedActivityIds, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/cruises/history', {
                ...formData,
                totalPassengers: calculations.totalPassengers,
                passengersDeluxe: calculations.breakdown.paxDeluxe,
                passengersPremiumGold: calculations.breakdown.paxGold,
                passengersPremiumSilver: calculations.breakdown.paxSilver,
                passengersNormal: calculations.breakdown.paxNormal,
            });
            navigate('/trips');
        } catch (err) {
            console.error('Failed to archive trip', err);
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5] dark:text-white" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-[#e5e5e5] dark:text-white tracking-tight mb-2 uppercase">Archive Past Trip</h1>
                <p className="text-gray-500 dark:text-[#a0a0a0] font-medium text-lg">Record details of a completed trip for historical tracking.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <section className="bg-[#2a2a2a] dark:bg-gray-800 p-8 rounded-[32px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                        <MapPin className="w-5 h-5" /> Trip Logistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#a0a0a0]">Cruise Name</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-3 px-5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold dark:text-white" placeholder="e.g. Mediterranean Escape 2023" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#a0a0a0]">Boarding</label>
                                <input required name="boardingLocation" value={formData.boardingLocation} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-3 px-5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold dark:text-white" placeholder="e.g. Miami" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#a0a0a0]">Destination</label>
                                <input required name="destination" value={formData.destination} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-3 px-5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold dark:text-white" placeholder="e.g. Bahamas" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#a0a0a0]">Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} max={maxDate} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-3 px-5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold dark:text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#a0a0a0]">End Date</label>
                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} min={formData.startDate} max={maxDate} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-3 px-5 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold dark:text-white" />
                        </div>
                    </div>
                </section>


                <section className="bg-[#2a2a2a] dark:bg-gray-800 p-8 rounded-[32px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                        <Hotel className="w-5 h-5" /> Cabin Booking (Historical)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {['Deluxe', 'Premium Gold', 'Premium Silver', 'Normal'].map(catName => {
                            const details = getCategoryDetails(catName);

                            const key = `roomsBooked${catName.replace(/\s+/g, '')}` as keyof typeof formData;

                            return (
                                <div key={catName} className="p-4 rounded-2xl bg-[#333333] dark:bg-gray-700/50 border border-[#3a3a3a] dark:border-gray-700 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm dark:text-white">{catName}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${details.available < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            Capacity: {details.total}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-[#a0a0a0]">Booked Count</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={details.total} 
                                            name={key}
                                            value={formData[key] as number}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#2a2a2a] dark:bg-gray-800 rounded-lg px-3 py-2 text-lg font-black focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white"
                                        />
                                    </div>
                                    <div className="text-xs text-[#a0a0a0] font-medium">
                                        Occupancy: {details.capacity} pax
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>


                <section className="bg-[#2a2a2a] dark:bg-gray-800 p-8 rounded-[32px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                            <Music className="w-5 h-5" /> Entertainment
                        </h2>
                        <span className="text-xs font-bold bg-[#b8935e] text-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5] px-3 py-1 rounded-full">
                            {formData.selectedActivityIds.length} Selected
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activitiesList.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => toggleActivity(activity.id)}
                                className={`cursor-pointer group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${formData.selectedActivityIds.includes(activity.id)
                                    ? 'border-[#b8935e] bg-[#b8935e] text-white dark:border-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5]'
                                    : 'border-[#3a3a3a] bg-[#2a2a2a] hover:border-[#b8935e]/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-sm line-clamp-1">{activity.name}</h3>
                                    {formData.selectedActivityIds.includes(activity.id) && <Check className="w-4 h-4 shrink-0" />}
                                </div>
                                <div className="flex justify-between items-end text-xs font-medium opacity-70">
                                    <span>{activity.type}</span>
                                    <span>${activity.cost.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                <section className="bg-[#2a2a2a] dark:bg-gray-800 p-8 rounded-[32px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                            <Users className="w-5 h-5" /> Crew Assignment
                        </h2>
                        <span className="text-xs font-bold bg-[#b8935e] text-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5] px-3 py-1 rounded-full">
                            {formData.selectedStaffIds.length} Assigned
                        </span>
                    </div>

                    <div className="space-y-6">
                        
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500 mb-3">Food Department</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {staffList.filter(s => s.role === 'FOOD').map(staff => (
                                    <div
                                        key={staff.id}
                                        onClick={() => toggleStaff(staff.id)}
                                        className={`cursor-pointer p-3 rounded-xl border transition-all ${formData.selectedStaffIds.includes(staff.id)
                                            ? 'bg-orange-50 border-orange-500 text-orange-900 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-100'
                                            : 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-orange-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xs">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-xs truncate">{staff.name}</p>
                                                <p className="text-[10px] opacity-70 truncate">{staff.designation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-3">Cleaning Department</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {staffList.filter(s => s.role === 'CLEANING').map(staff => (
                                    <div
                                        key={staff.id}
                                        onClick={() => toggleStaff(staff.id)}
                                        className={`cursor-pointer p-3 rounded-xl border transition-all ${formData.selectedStaffIds.includes(staff.id)
                                            ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-100'
                                            : 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-blue-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-xs truncate">{staff.name}</p>
                                                <p className="text-[10px] opacity-70 truncate">{staff.designation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

            </form >

            <div className="sticky bottom-6 z-10 max-w-5xl mx-auto">
                <div className="bg-[#b8935e]/90 dark:bg-[#2a2a2a]/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl text-white dark:text-[#e5e5e5] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="grid grid-cols-3 gap-8 md:gap-12 w-full md:w-auto text-center md:text-left">
                        <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">Hist. Revenue</p>
                            <p className="text-xl font-black">${calculations.financials.ticketRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">Total Expenses</p>
                            <p className="text-xl font-black text-red-400 dark:text-red-500">${Math.round(calculations.financials.totalExpenses).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">Net Profit</p>
                            <p className={`text-xl font-black ${calculations.financials.netProfit >= 0 ? 'text-green-400 dark:text-green-500' : 'text-red-400 dark:text-red-500'}`}>
                                ${Math.round(calculations.financials.netProfit).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full md:w-auto bg-[#2a2a2a] text-[#e5e5e5] dark:bg-[#b8935e] dark:text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-3"
                    >
                        <Archive className="w-4 h-4" /> Archive Trip
                    </button>
                </div>
            </div>
        </div >
    );
};

export default AddTripArchive;
