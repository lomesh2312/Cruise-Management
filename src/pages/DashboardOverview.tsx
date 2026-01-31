import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    AlertTriangle, Hammer, Loader2, TrendingUp, BookOpen,
    DollarSign, ArrowUpRight, MoreHorizontal, ArrowRight, Share2,
    Calendar, UserCheck, Activity
} from 'lucide-react';
import api from '../services/api';

const DashboardOverview = () => {
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/monthly-revenue')
        ]).then(([statsRes, revenueRes]) => {
            setStats(statsRes.data);
            setRevenueData(revenueRes.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
    );

    const cards = [
        {
            title: 'Cruises Last Month',
            subtitle: 'vs last month',
            value: stats?.tripsLastMonth || 18,
            trend: '50%',
            icon: BookOpen,
            sparkline: [30, 45, 35, 60, 50, 70, 65]
        },
        {
            title: 'Cruises This Month',
            subtitle: 'vs last month',
            value: stats?.tripsThisMonth || 14,
            trend: '+23%',
            icon: TrendingUp,
            sparkline: [40, 30, 55, 45, 80, 70, 90]
        },
        {
            title: 'Revenue from Past Trips',
            subtitle: 'vs last month',
            value: `$${(stats?.totalRevenue / 1000).toFixed(1)}K`,
            trend: '+23%',
            icon: DollarSign,
            sparkline: [20, 50, 40, 80, 60, 90, 100]
        },
        {
            title: 'Estimated Revenue',
            subtitle: 'vs last month',
            value: '$1,720,800',
            trend: '23%',
            icon: DollarSign,
            sparkline: [50, 40, 70, 50, 90, 80, 95]
        },
        {
            title: 'Cabin Availability',
            subtitle: 'vs last month',
            value: '78%',
            trend: '68%',
            icon: Share2,
            stats: 'Used for rendering',
            sparkline: [60, 70, 65, 80, 75, 90, 85]
        },
    ];

    const pieData = [
        { name: 'Cabins', value: 52 },
        { name: 'Food & Beverages', value: 18 },
        { name: 'Events', value: 16 },
        { name: 'Celebrities', value: 14 },
    ];

    const recentActivities = [
        {
            icon: Calendar,
            title: 'New Cruise Created',
            desc: 'Caribbean Delight 2024 added to schedule',
            time: '2 hours ago'
        },
        {
            icon: DollarSign,
            title: 'Room Price Updated',
            desc: 'Deluxe Suite pricing adjusted for peak season',
            time: '4 hours ago'
        },
        {
            icon: UserCheck,
            title: 'Staff Assigned',
            desc: 'Sarah Johnson assigned to Royal Deck',
            time: '5 hours ago'
        },
        {
            icon: Activity,
            title: 'Activity Added',
            desc: 'Midnight Jazz Club event programmed',
            time: 'Yesterday'
        }
    ];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Dashboard Overview</h1>
                <p className="text-gray-400 font-medium text-sm mt-1">Welcome back, Admin! Here's the latest analysis from your cruise operations.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div className="space-y-1">
                                <p className="text-[12px] font-bold text-gray-400 leading-tight pr-4">
                                    {card.title}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                <card.icon className="w-5 h-5 text-gray-900" />
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{card.value}</p>
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center text-green-600 font-bold text-[10px]">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {card.trend}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{card.subtitle}</span>
                                </div>
                            </div>
                            {card.stats && (
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">256 Cabins</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Available</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Distribution Chart (2/3 width) */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-lg font-bold text-gray-900">Trips Overview</h2>
                            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100/50">
                                <button className="px-5 py-1.5 text-[11px] font-bold bg-white text-black rounded-lg shadow-sm">Trips</button>
                                <button className="px-5 py-1.5 text-[11px] font-bold text-gray-400 hover:text-black rounded-lg transition-colors">Revenue</button>
                                <button className="p-1.5 text-gray-400 hover:text-black">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                        tickFormatter={(val) => `$${val / 1000}K`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#000"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorMain)"
                                        animationDuration={1500}
                                    />
                                    <Bar dataKey="trips" fill="#cbd5e1" radius={[2, 2, 0, 0]} barSize={24} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview (1/3 width) - Replaces Alerts */}
                <div className="xl:col-span-1">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h2>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <XAxis dataKey="month" hide />
                                    <YAxis dataKey="trips" hide />
                                    <Bar dataKey="trips" fill="#000" radius={[4, 4, 0, 0]} barSize={20} opacity={0.8}>
                                        <Cell fill="#e2e8f0" />
                                        <Cell fill="#cbd5e1" />
                                        <Cell fill="#94a3b8" />
                                        <Cell fill="#64748b" />
                                        <Cell fill="#334155" />
                                        <Cell fill="#1e293b" />
                                        <Cell fill="#0f172a" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-6 border-t border-gray-50 flex justify-between items-end">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight mt-1">$1.2M</p>
                            </div>
                            <div className="flex items-center text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                +12.5%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Panel (Bottom) */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <p className="text-sm text-gray-400 mt-1">Latest updates from your cruise management system</p>
                        </div>
                        <button className="text-sm font-bold text-gray-900 flex items-center gap-2 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentActivities.map((activity, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                    <activity.icon className="w-5 h-5 text-gray-900" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{activity.title}</p>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{activity.desc}</p>
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-2">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
