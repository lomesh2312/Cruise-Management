import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
    Loader2, BookOpen, ArrowUpRight, ArrowDownRight,
    Calendar, UserCheck, Activity, Hotel, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface DashboardStats {
    totalActivities: number;
    foodStaffCount: number;
    cleaningStaffCount: number;
    eventStaffCount: number;
    tripsCompleted: number;
    upcomingTrips: number;
    activeCruises: number;
    totalProfit: number;
    totalLoss: number;
    alerts: {
        maintenanceRooms: Array<{ id: string; number: string; description: string }>;
        lossMakingTrips: Array<{ id: string; name: string; loss: number }>;
    };
    tripsPerMonth: Array<{ month: string; trips: number }>;
    revenuePerTrip: Array<{ name: string; revenue: number; profit: number }>;
}

const DashboardOverview = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5]" />
        </div>
    );

    const cards = [
        {
            title: 'Trips Completed',
            value: stats?.tripsCompleted || 0,
            icon: BookOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Upcoming Trips',
            value: stats?.upcomingTrips || 0,
            icon: Calendar,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            link: '/generate-trip'
        },
        {
            title: 'Total Activities',
            value: stats?.totalActivities || 0,
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            link: '/activities'
        },
        {
            title: 'Food Staff',
            value: stats?.foodStaffCount || 0,
            icon: UserCheck,
            color: 'text-green-600',
            bg: 'bg-green-50',
            link: '/staff'
        },
        {
            title: 'Cleaning Staff',
            value: stats?.cleaningStaffCount || 0,
            icon: UserCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/staff'
        },
        {
            title: 'Event Staff',
            value: stats?.eventStaffCount || 0,
            icon: UserCheck,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            link: '/staff'
        },
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#e5e5e5] tracking-tighter">Dashboard Overview</h1>
                    <p className="text-[#a0a0a0] font-medium text-sm mt-1">Operational performance and critical alerts.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] px-6 py-3 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-wider mb-1">Total Profit</p>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-green-50 rounded-lg">
                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-xl font-black text-[#e5e5e5]tracking-tight">${stats?.totalProfit?.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] px-6 py-3 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-wider mb-1">Total Loss</p>
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-red-50 rounded-lg">
                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-xl font-black text-[#e5e5e5] tracking-tight">${stats?.totalLoss?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {cards.map((card, i) => {
                    const Content = (
                        <div key={i} className="bg-[#2a2a2a] p-6 rounded-[24px] shadow-sm border border-[#3a3a3a] flex flex-col justify-between hover:shadow-md transition-all duration-300 h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-[#333333] rounded-xl flex items-center justify-center shrink-0">
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-[#a0a0a0] leading-tight mb-1">{card.title}</p>
                                <p className="text-2xl font-black text-[#e5e5e5] tracking-tight">{card.value}</p>
                            </div>
                        </div>
                    );

                    return 'link' in card ? (
                        <Link key={i} to={(card as { link: string }).link}>
                            {Content}
                        </Link>
                    ) : (
                        <div key={i}>{Content}</div>
                    );
                })}
            </div>

            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="bg-[#2a2a2a] p-8 rounded-[32px] shadow-sm border border-[#3a3a3a]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-[#e5e5e5]">Revenue per Trip</h2>
                            <p className="text-xs text-[#a0a0a0]">Total revenue generated from historical trips</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="99%" height="100%">
                            <LineChart data={stats?.revenuePerTrip || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3a3a3a" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a0a0a0' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a0a0a0' }}
                                    tickFormatter={(val) => `$${val / 1000}K`}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, fill: '#ffffff' }} activeDot={{ r: 6, fill: '#b8935e' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                
                <div className="bg-[#2a2a2a] p-8 rounded-[32px] shadow-sm border border-[#3a3a3a]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-[#e5e5e5]">Trips per Month</h2>
                            <p className="text-xs text-[#a0a0a0]">Distribution of trips over the last 6 months</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={stats?.tripsPerMonth || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3a3a3a" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a0a0a0' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a0a0a0' }}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px' }} />
                                <Bar dataKey="trips" fill="#b8935e" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-8 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-900/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-[#e5e5e5] uppercase tracking-wide">Critical Alerts</h2>
                </div>

                <div className="space-y-4">
                    {(!stats?.alerts?.maintenanceRooms?.length && !stats?.alerts?.lossMakingTrips?.length) ? (
                        <div className="flex items-center gap-4 p-4 bg-green-900/10 border border-green-900/20 rounded-2xl">
                            <div className="w-8 h-8 bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm font-bold text-green-500 uppercase tracking-widest">No critical alerts detected. Systems operational.</p>
                        </div>
                    ) : (
                        <>
                            {stats?.alerts?.maintenanceRooms?.map((room) => (
                                <div key={room.id} className="flex items-center justify-between p-4 bg-red-900/10 border border-red-900/20 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-red-900/20 rounded-lg flex items-center justify-center">
                                            <Hotel className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#e5e5e5]">Room {room.number} - Maintenance</p>
                                            <p className="text-xs text-red-400 font-medium">{room.description || 'Routine check required'}</p>
                                        </div>
                                    </div>
                                    <Link to="/rooms" className="text-xs font-black text-[#e5e5e5] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Resolve</Link>
                                </div>
                            ))}

                            {stats?.alerts?.lossMakingTrips?.map((trip) => (
                                <div key={trip.id} className="flex items-center justify-between p-4 bg-orange-900/10 border border-orange-900/20 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-orange-900/20 rounded-lg flex items-center justify-center">
                                            <ArrowDownRight className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#e5e5e5]">{trip.name} - Financial Loss</p>
                                            <p className="text-xs text-orange-400 font-medium">Net Loss: -${trip.loss.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <Link to={`/trips/${trip.id}`} className="text-xs font-black text-[#e5e5e5] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Details</Link>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default DashboardOverview;
