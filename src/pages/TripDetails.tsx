import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Anchor, Calendar, Users, DollarSign, Activity, PieChart as PieIcon, Hotel, User, Info, Loader2
} from 'lucide-react';
import api from '../services/api';

const TripDetails = () => {
    const { id } = useParams();
    const [cruise, setCruise] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/cruises/${id}`).then(res => setCruise(res.data)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;
    if (!cruise) return <div className="p-20 text-center">Cruise not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in slide-in-from-bottom-10 duration-700">
            <button
                onClick={() => navigate('/trips')}
                className="flex items-center gap-2 font-bold text-gray-400 hover:text-black transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to History
            </button>

            {/* Hero Header */}
            <div className="bg-black text-white p-12 rounded-[2.5rem] flex flex-wrap justify-between items-end gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Anchor className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Voyage Details</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none">{cruise.name}</h1>
                    <div className="flex items-center gap-8 pt-4">
                        <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date(cruise.startDate).toLocaleDateString()} — {new Date(cruise.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-bold opacity-60 flex items-center gap-2">
                            <Users className="w-4 h-4" /> {cruise.registered} Passengers
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-2 font-medium">Final Revenue</p>
                    <p className="text-7xl font-black">${cruise.revenue?.totalRevenue.toLocaleString() || '0'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Breakdowns */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Rooms Section */}
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Hotel className="w-6 h-6" /> Accommodation Breakdown
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cruise.rooms.map((room: any) => (
                                <div key={room.id} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{room.type} Category</p>
                                    <h3 className="text-xl font-black mb-4">Cabin {room.id.slice(0, 4)}</h3>
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1 text-sm font-medium text-gray-500">
                                            <p>Capacity: {room.capacity}</p>
                                            <p>Rate: ${room.price}/night</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Generated</p>
                                            <p className="text-xl font-black">${(room.price * 7).toLocaleString()}</p> {/* Mock calculation */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Activities Section */}
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Activity className="w-6 h-6" /> Entertainment Schedule
                        </h2>
                        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                            {cruise.activities.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-8 p-8 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center font-black">
                                        <span className="text-[10px] uppercase opacity-40">Day</span>
                                        <span>{item.day}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black">{item.activity.name}</h4>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">Directed by {item.activity.managerName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Fee</p>
                                        <p className="text-xl font-black">${item.activity.cost.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Staff & Summary */}
                <div className="space-y-10">
                    <section>
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <User className="w-6 h-6" /> Assigned Staff
                        </h2>
                        <div className="space-y-4">
                            {cruise.staff.map((member: any) => (
                                <div key={member.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-black">{member.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.role} TEAM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800 p-10 rounded-[2rem] space-y-8">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Financial Summary</h2>
                            {(() => {
                                const totalRevenue = cruise.revenue?.totalRevenue || 0;
                                const totalExpenses = cruise.revenue?.totalExpenses || 0;
                                const netResult = totalRevenue - totalExpenses;
                                const isProfit = netResult >= 0;

                                return (
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${isProfit
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {isProfit ? 'Success' : 'Loss'}
                                    </button>
                                );
                            })()}
                        </div>

                        {(() => {
                            const totalRevenue = cruise.revenue?.totalRevenue || 0;
                            const totalExpenses = cruise.revenue?.totalExpenses || 0;
                            const netResult = totalRevenue - totalExpenses;
                            const isProfit = netResult >= 0;

                            return (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Revenue</span>
                                        <span className="font-black text-black dark:text-white text-xl">${totalRevenue.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Expenses</span>
                                        <span className="font-black text-red-500 text-xl">-${totalExpenses.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-black text-black dark:text-gray-200 uppercase tracking-widest">Net {isProfit ? 'Profit' : 'Loss'}</span>
                                        <span className={`text-3xl font-black ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isProfit ? '+' : ''}${netResult.toLocaleString()}
                                        </span>
                                    </div>

                                    {showDetails && (
                                        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-4 fade-in duration-500">
                                            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-widest mb-4">Detailed Breakdown</h3>

                                            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-500">Staff Cleaning Costs</span>
                                                    <span className="font-bold text-red-400">-${(cruise.revenue?.cleaningStaffCost || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-500">Staff Food Costs</span>
                                                    <span className="font-bold text-red-400">-${(cruise.revenue?.foodStaffCost || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-500">External Activities</span>
                                                    <span className="font-bold text-red-400">-${(cruise.revenue?.externalActivityCost || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="my-2 border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-500">Ticket Revenue</span>
                                                    <span className="font-bold text-green-500">+${(cruise.revenue?.totalRevenue || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!showDetails && (
                                        <p className="text-center text-xs font-bold text-gray-400 mt-4 cursor-pointer hover:text-black dark:hover:text-white transition-colors" onClick={() => setShowDetails(true)}>
                                            Click status badge or here to view details
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TripDetails;
