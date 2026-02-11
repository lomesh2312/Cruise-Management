import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Anchor, Calendar, Users, Activity, Hotel, User, Loader2
} from 'lucide-react';
import api from '../services/api';

interface CruiseDetails {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    totalPassengers?: number;
    registered?: number;
    roomsBookedDeluxe?: number;
    roomsBookedPremiumGold?: number;
    roomsBookedPremiumSilver?: number;
    roomsBookedNormal?: number;
    passengersDeluxe?: number;
    passengersPremiumGold?: number;
    passengersPremiumSilver?: number;
    passengersNormal?: number;
    cleaningStaffCount?: number;
    foodStaffCount?: number;
    eventStaffCount?: number;
    revenue?: {
        totalRevenue: number;
        totalExpenses: number;
        cleaningStaffCost: number;
        foodStaffCost: number;
        eventStaffCost: number;
        externalActivityCost: number;
    };
    activities?: {
        day: number;
        activity: {
            name: string;
            managerName: string;
            cost: number;
        };
    }[];
    staff?: {
        id: string;
        name: string;
        role: string;
    }[];
}

const TripDetails = () => {
    const { id } = useParams();
    const [cruise, setCruise] = useState<CruiseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [showNetProfit, setShowNetProfit] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/cruises/${id}`).then(res => setCruise(res.data)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5] dark:text-white" /></div>;
    if (!cruise) return <div className="p-20 text-center text-[#e5e5e5] dark:text-white">Cruise not found</div>;

    const roomBreakdown = {
        DELUXE: { count: cruise.roomsBookedDeluxe || 0, passengers: cruise.passengersDeluxe || 0 },
        PREMIUM_GOLD: { count: cruise.roomsBookedPremiumGold || 0, passengers: cruise.passengersPremiumGold || 0 },
        PREMIUM_SILVER: { count: cruise.roomsBookedPremiumSilver || 0, passengers: cruise.passengersPremiumSilver || 0 },
        NORMAL: { count: cruise.roomsBookedNormal || 0, passengers: cruise.passengersNormal || 0 }
    };

    const totalRevenue = cruise.revenue?.totalRevenue || 0;
    const totalExpenses = cruise.revenue?.totalExpenses || 0;
    const netResult = totalRevenue - totalExpenses;
    const isProfit = netResult > 0;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in slide-in-from-bottom-10 duration-700">
            <button
                onClick={() => navigate('/trips')}
                className="flex items-center gap-2 font-black text-[#e5e5e5] dark:text-white uppercase tracking-widest text-xs hover:gap-4 transition-all group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to History
            </button>

            <div className="bg-[#b8935e] dark:bg-[#2a2a2a] text-white dark:text-[#e5e5e5] p-12 rounded-[2.5rem] flex flex-wrap justify-between items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2a2a2a]/10 dark:bg-[#b8935e]/10 rounded-xl flex items-center justify-center">
                            <Anchor className="w-5 h-5 text-white dark:text-[#e5e5e5]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Voyage Details</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none">{cruise.name}</h1>
                    <div className="flex items-center gap-8 pt-4">
                        <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date(cruise.startDate).toLocaleDateString()} — {new Date(cruise.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                            <Users className="w-4 h-4" /> {cruise.totalPassengers || cruise.registered} Passengers
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2 font-medium">Final Revenue</p>
                    <p className="text-7xl font-black">${totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                            <Hotel className="w-6 h-6" /> Room Category Breakdown
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(roomBreakdown).map(([category, data]) => {
                                if (data.count === 0) return null;

                                const categoryNames: Record<string, string> = {
                                    DELUXE: 'Deluxe',
                                    PREMIUM_GOLD: 'Premium Gold',
                                    PREMIUM_SILVER: 'Premium Silver',
                                    NORMAL: 'Normal'
                                };

                                return (
                                    <div key={category} className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 p-8 rounded-3xl shadow-sm">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] dark:text-gray-500 mb-1">{categoryNames[category]} Category</p>
                                        <h3 className="text-xl font-black mb-4 text-[#e5e5e5] dark:text-white">{data.count} Room{data.count > 1 ? 's' : ''} Booked</h3>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1 text-sm font-medium text-gray-500 dark:text-[#a0a0a0]">
                                                <p>Total Passengers: {data.passengers}</p>
                                                <p>Avg per Room: {(data.passengers / data.count).toFixed(1)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {cruise.activities && cruise.activities.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                                <Activity className="w-6 h-6" /> Entertainment Schedule
                            </h2>
                            <div className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                                {cruise.activities?.map((item, i: number) => (
                                    <div key={i} className="flex items-center gap-8 p-8 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-[#333333]/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="w-14 h-14 bg-[#333333] dark:bg-gray-700 rounded-2xl flex flex-col items-center justify-center font-black text-[#e5e5e5] dark:text-white">
                                            <span className="text-[10px] uppercase opacity-40">Day</span>
                                            <span>{item.day}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black text-[#e5e5e5] dark:text-white">{item.activity.name}</h4>
                                            <p className="text-sm font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest leading-loose">Directed by {item.activity.managerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] dark:text-gray-500 mb-1">Fee</p>
                                            <p className="text-xl font-black text-[#e5e5e5] dark:text-white">${item.activity.cost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-[#e5e5e5] dark:text-white">
                            <User className="w-6 h-6" /> Staff Information
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] dark:text-gray-500">Cleaning Staff</p>
                                </div>
                                <p className="font-bold text-[#e5e5e5] dark:text-white text-lg">{cruise.cleaningStaffCount || 0} People</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a0a0a0]">Total Cost: ${(cruise.revenue?.cleaningStaffCost || 0).toLocaleString()}</p>
                            </div>

                            <div className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] dark:text-gray-500">Food Staff</p>
                                </div>
                                <p className="font-bold text-[#e5e5e5] dark:text-white text-lg">{cruise.foodStaffCount || 0} People</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a0a0a0]">Total Cost: ${(cruise.revenue?.foodStaffCost || 0).toLocaleString()}</p>
                            </div>

                            <div className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 p-6 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] dark:text-gray-500">Event Staff</p>
                                </div>
                                <p className="font-bold text-[#e5e5e5] dark:text-white text-lg">{cruise.eventStaffCount || 0} People</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-[#a0a0a0]">Total Cost: ${(cruise.revenue?.eventStaffCost || 0).toLocaleString()}</p>
                            </div>

                            {cruise.staff && cruise.staff.length > 0 && (
                                <>
                                    <div className="pt-4">
                                        <p className="text-xs font-bold text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest mb-3">Assigned Crew</p>
                                    </div>
                                    {cruise.staff?.slice(0, 3).map((member) => (
                                        <div key={member.id} className="bg-[#2a2a2a] dark:bg-gray-800 border border-[#3a3a3a] dark:border-gray-700 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                            <div className="w-10 h-10 bg-[#b8935e] dark:bg-[#2a2a2a] text-white dark:text-[#e5e5e5] rounded-xl flex items-center justify-center font-bold text-sm">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#e5e5e5] dark:text-white text-sm">{member.name}</p>
                                                <p className="text-[10px] font-black text-[#a0a0a0] dark:text-gray-500 uppercase tracking-widest">{member.role} TEAM</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </section>

                    <section className="bg-[#333333] dark:bg-gray-800 p-10 rounded-[2rem] space-y-8">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#e5e5e5] dark:text-white">Financial Summary</h2>
                            <button
                                onClick={() => setShowNetProfit(!showNetProfit)}
                                className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 ${isProfit ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                                {isProfit ? 'Success' : 'Loss'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-[#b8935e]/10 dark:border-white/10">
                                <span className="text-sm font-bold text-gray-500 dark:text-[#a0a0a0] uppercase tracking-widest">Total Revenue</span>
                                <span className="font-black text-[#e5e5e5] dark:text-white text-xl">${totalRevenue.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-[#b8935e]/10 dark:border-white/10">
                                <span className="text-sm font-bold text-gray-500 dark:text-[#a0a0a0] uppercase tracking-widest">Total Expenses</span>
                                <span className="font-black text-[#e5e5e5] dark:text-white text-xl">-${totalExpenses.toLocaleString()}</span>
                            </div>

                            {showNetProfit && (
                                <div className="flex justify-between items-center pt-2 animate-in slide-in-from-top-4 fade-in duration-500">
                                    <span className="text-sm font-black text-[#e5e5e5] dark:text-gray-100 uppercase tracking-widest">Net {isProfit ? 'Profit' : 'Loss'}</span>
                                    <span className="text-4xl font-black text-[#e5e5e5] dark:text-white">
                                        {isProfit ? '+' : '-'}${Math.abs(netResult).toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {showDetails && (
                                <div className="pt-6 mt-6 border-t border-[#b8935e]/10 dark:border-white/10 animate-in slide-in-from-top-4 fade-in duration-500">
                                    <h3 className="text-sm font-black text-[#e5e5e5] dark:text-white uppercase tracking-widest mb-4">Detailed Breakdown</h3>

                                    <div className="space-y-3 pl-4 border-l-2 border-[#b8935e] dark:border-white">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-500 dark:text-[#a0a0a0]">Cleaning Staff ({cruise.cleaningStaffCount || 0} people)</span>
                                            <span className="font-bold text-[#e5e5e5] dark:text-white">-${(cruise.revenue?.cleaningStaffCost || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-500 dark:text-[#a0a0a0]">Food Staff ({cruise.foodStaffCount || 0} people)</span>
                                            <span className="font-bold text-[#e5e5e5] dark:text-white">-${(cruise.revenue?.foodStaffCost || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-500 dark:text-[#a0a0a0]">Event Staff ({cruise.eventStaffCount || 0} people)</span>
                                            <span className="font-bold text-[#e5e5e5] dark:text-white">-${(cruise.revenue?.eventStaffCost || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-500 dark:text-[#a0a0a0]">External Activities</span>
                                            <span className="font-bold text-[#e5e5e5] dark:text-white">-${(cruise.revenue?.externalActivityCost || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="my-2 border-t border-dashed border-[#b8935e]/10 dark:border-white/10"></div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-[#e5e5e5] dark:text-white uppercase tracking-tighter">Ticket Revenue</span>
                                            <span className="font-black text-[#e5e5e5] dark:text-white">+${totalRevenue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!showDetails && (
                                <p className="text-center text-xs font-black text-[#e5e5e5] dark:text-white mt-4 cursor-pointer hover:tracking-widest transition-all uppercase underline decoration-2 underline-offset-4" onClick={() => setShowDetails(true)}>
                                    View detailed financial breakdown
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TripDetails;
