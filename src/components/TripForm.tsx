import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Users, Hotel, Music, Check, Calculator, Loader2, X, AlertTriangle } from 'lucide-react';

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

export interface TripFormData {
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

export interface TripSubmitData extends TripFormData {
    totalPassengers: number;
    passengersDeluxe: number;
    passengersPremiumGold: number;
    passengersPremiumSilver: number;
    passengersNormal: number;
}

interface TripFormProps {
    initialData?: TripFormData;
    categories: RoomCategory[];
    staffList: Staff[];
    activitiesList: Activity[];
    onSubmit: (data: TripSubmitData) => Promise<void>;
    isSubmitting: boolean;
    buttonText?: string;
    onCancel?: () => void;
    title?: string;
}

const TripForm: React.FC<TripFormProps> = ({
    initialData,
    categories,
    staffList,
    activitiesList,
    onSubmit,
    isSubmitting,
    buttonText = "Generate Trip",
    onCancel,
    title = "Generate New Trip"
}) => {
    const [formData, setFormData] = useState<TripFormData>({
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
        if (initialData) {
            // eslint-disable-next-line
            setFormData(initialData);
        }
    }, [initialData]);

    const today = new Date().toISOString().split('T')[0];

    const getCategoryDetails = React.useCallback((name: string) => {
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
        const staffCostVal = selectedStaff.reduce((acc, s) => {
            const salary = Number(s.salary) || 0;
            return acc + salary;
        }, 0);
        const totalStaffCost = staffCostVal;

        const selectedActivities = activitiesList.filter(a => formData.selectedActivityIds.includes(a.id));
        const totalActivityCost = selectedActivities.reduce((acc, a) => acc + a.cost, 0);

        const totalExpenses = totalStaffCost + totalActivityCost;
        const netProfit = totalTicketRevenue - totalExpenses;

        return {
            durationDays,
            totalPassengers,
            breakdown: { paxDeluxe, paxGold, paxSilver, paxNormal },
            financials: { ticketRevenue: totalTicketRevenue, staffCost: totalStaffCost, activityCost: totalActivityCost, totalExpenses, netProfit }
        };

    }, [formData, staffList, activitiesList, getCategoryDetails]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const isCapacityExceeded = useMemo(() => {
        const deluxe = getCategoryDetails('Deluxe');
        const gold = getCategoryDetails('Premium Gold');
        const silver = getCategoryDetails('Premium Silver');
        const normal = getCategoryDetails('Normal');

        return (
            formData.roomsBookedDeluxe > deluxe.available ||
            formData.roomsBookedPremiumGold > gold.available ||
            formData.roomsBookedPremiumSilver > silver.available ||
            formData.roomsBookedNormal > normal.available
        );
    }, [formData, getCategoryDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isCapacityExceeded) {
            alert('Cannot proceed: Room counts exceed available capacity in one or more categories.');
            return;
        }

        await onSubmit({
            ...formData,
            totalPassengers: calculations.totalPassengers,
            passengersDeluxe: calculations.breakdown.paxDeluxe,
            passengersPremiumGold: calculations.breakdown.paxGold,
            passengersPremiumSilver: calculations.breakdown.paxSilver,
            passengersNormal: calculations.breakdown.paxNormal,
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#e5e5e5] text-[#e5e5e5] tracking-tight uppercase">{title}</h1>
                    <p className="text-[#a0a0a0] text-[#a0a0a0] font-medium text-sm">Configure details, assign resources, and calculate profitability.</p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 hover:bg-[#333333] hover:bg-[#333333] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[#a0a0a0]" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                <section className="bg-[#2a2a2a] bg-[#333333] p-6 rounded-[24px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] text-[#e5e5e5]">
                        <MapPin className="w-5 h-5" /> Trip Logistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#a0a0a0] text-[#a0a0a0]">Cruise Name</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-[#e5e5e5] text-sm" placeholder="e.g. Mediterranean Escape" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#a0a0a0] text-[#a0a0a0]">Boarding</label>
                                <input required name="boardingLocation" value={formData.boardingLocation} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-[#e5e5e5] text-sm" placeholder="e.g. Miami" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#a0a0a0] text-[#a0a0a0]">Destination</label>
                                <input required name="destination" value={formData.destination} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-[#e5e5e5] text-sm" placeholder="e.g. Bahamas" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#a0a0a0] text-[#a0a0a0]">Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate.split('T')[0]} onChange={handleInputChange} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-[#e5e5e5] text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#a0a0a0] text-[#a0a0a0]">End Date</label>
                            <input required type="date" name="endDate" value={formData.endDate.split('T')[0]} onChange={handleInputChange} min={formData.startDate || today} className="w-full bg-[#333333] dark:bg-gray-700 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-[#e5e5e5] text-sm" />
                        </div>
                    </div>
                </section>


                <section className="bg-[#2a2a2a] bg-[#333333] p-6 rounded-[24px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] text-[#e5e5e5]">
                        <Hotel className="w-5 h-5" /> Cabin Booking
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Deluxe', 'Premium Gold', 'Premium Silver', 'Normal'].map(catName => {
                            const details = getCategoryDetails(catName);

                            const key = `roomsBooked${catName.replace(/\s+/g, '')}` as keyof TripFormData;
                            return (
                                <div key={catName} className="p-3 rounded-xl bg-[#333333] dark:bg-gray-700/50 border border-[#3a3a3a] dark:border-gray-700 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-xs text-[#e5e5e5]">{catName}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${details.available < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {details.available} Left
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            min="0"
                                            name={key}
                                            value={formData[key] as number}
                                            onChange={handleInputChange}
                                            className={`w-full bg-[#2a2a2a] bg-[#333333] rounded-lg px-2 py-1 text-sm font-black focus:ring-2 outline-none text-[#e5e5e5] transition-all ${(formData[key] as number) > details.available
                                                ? 'ring-2 ring-red-500 text-red-600'
                                                : 'focus:ring-black dark:focus:ring-white'
                                                }`}
                                        />
                                        {(formData[key] as number) > details.available && (
                                            <p className="text-[8px] text-red-500 font-bold uppercase animate-pulse">Exceeds Available!</p>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        Cap: {details.capacity}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>


                <section className="bg-[#2a2a2a] bg-[#333333] p-6 rounded-[24px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] text-[#e5e5e5]">
                            <Music className="w-5 h-5" /> Entertainment
                        </h2>
                        <span className="text-[10px] font-bold bg-[#b8935e] text-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5] px-2 py-0.5 rounded-full">
                            {formData.selectedActivityIds.length} Selected
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {activitiesList.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => toggleActivity(activity.id)}
                                className={`cursor-pointer group relative overflow-hidden p-3 rounded-xl border transition-all duration-300 ${formData.selectedActivityIds.includes(activity.id)
                                    ? 'border-[#b8935e] bg-[#b8935e] text-white dark:border-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5]'
                                    : 'border-[#3a3a3a] bg-[#2a2a2a] hover:border-[#b8935e]/20 dark:bg-gray-700 dark:border-gray-600 text-[#e5e5e5]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-xs line-clamp-1">{activity.name}</h3>
                                    {formData.selectedActivityIds.includes(activity.id) && <Check className="w-3 h-3 shrink-0" />}
                                </div>
                                <div className="flex justify-between items-end text-[10px] font-medium opacity-70">
                                    <span>{activity.type}</span>
                                    <span>${activity.cost.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                <section className="bg-[#2a2a2a] bg-[#333333] p-6 rounded-[24px] border border-[#3a3a3a] dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-[#e5e5e5] text-[#e5e5e5]">
                            <Users className="w-5 h-5" /> Crew
                        </h2>
                        <span className="text-[10px] font-bold bg-[#b8935e] text-white dark:bg-[#2a2a2a] dark:text-[#e5e5e5] px-2 py-0.5 rounded-full">
                            {formData.selectedStaffIds.length} Assigned
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['FOOD', 'CLEANING', 'EVENT'].map(role => (
                            <div key={role}>
                                <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${role === 'FOOD' ? 'text-orange-500' : role === 'CLEANING' ? 'text-blue-500' : 'text-purple-500'}`}>
                                    {role === 'FOOD' ? 'Food Service' : role === 'CLEANING' ? 'Housekeeping' : 'Event Planning'}
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {staffList.filter(s => s.role === role).map(staff => (
                                        <div
                                            key={staff.id}
                                            onClick={() => toggleStaff(staff.id)}
                                            className={`cursor-pointer p-2 rounded-lg border transition-all ${formData.selectedStaffIds.includes(staff.id)
                                                ? (role === 'FOOD' ? 'bg-orange-50 border-orange-500 text-orange-900 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-100' :
                                                    role === 'CLEANING' ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-100' :
                                                        'bg-purple-50 border-purple-500 text-purple-900 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-100')
                                                : 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#b8935e]/10 dark:bg-gray-700/50 dark:border-gray-600 text-[#e5e5e5]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${role === 'FOOD' ? 'bg-gradient-to-br from-orange-400 to-red-500' : role === 'CLEANING' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500'}`}>
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-[10px] truncate">{staff.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="sticky bottom-6 z-10">
                    <div className="bg-[#b8935e]/90 dark:bg-[#2a2a2a]/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-white dark:text-[#e5e5e5] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="grid grid-cols-3 gap-6 w-full md:w-auto text-center md:text-left">
                            <div>
                                <p className="text-[8px] uppercase font-bold opacity-60">Revenue</p>
                                <p className="text-sm font-black">${calculations.financials.ticketRevenue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase font-bold opacity-60">Expenses</p>
                                <p className="text-sm font-black text-red-400 text-red-500">${Math.round(calculations.financials.totalExpenses).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase font-bold opacity-60">Profit</p>
                                <p className={`text-sm font-black ${calculations.financials.netProfit >= 0 ? 'text-green-400 dark:text-green-500' : 'text-red-400 text-red-500'}`}>
                                    ${Math.round(calculations.financials.netProfit).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || isCapacityExceeded}
                            className={`w-full md:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all text-xs flex items-center justify-center gap-2 ${isCapacityExceeded
                                ? 'bg-red-500 text-white cursor-not-allowed opacity-80'
                                : 'bg-[#2a2a2a] text-[#e5e5e5] dark:bg-[#b8935e] text-[#e5e5e5] hover:scale-105 active:scale-95 disabled:opacity-50'
                                }`}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                isCapacityExceeded ? <AlertTriangle className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                            {isCapacityExceeded ? "Capacity Exceeded" : buttonText}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TripForm;
