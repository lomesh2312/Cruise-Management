import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Anchor, Hotel, Music, Users, LogOut, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const mainItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Anchor, label: 'Trips', path: '/trips' },
        { icon: Hotel, label: 'Rooms', path: '/rooms' },
        { icon: Music, label: 'Activities', path: '/activities' },
        { icon: Users, label: 'Staff', path: '/staff' },
        { icon: Bell, label: 'Alerts', path: '/alerts' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
            {/* Logo Section */}
            <div className="px-6 h-20 flex items-center gap-3 border-b border-gray-800/50">
                <div className="flex gap-0.5">
                    <div className="w-1.5 h-6 bg-white rounded-full"></div>
                    <div className="w-1.5 h-4 bg-white/60 rounded-full my-auto"></div>
                    <div className="w-1.5 h-6 bg-white rounded-full"></div>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Cruise Management</span>
            </div>

            <div className="flex-1 px-4 py-6 custom-scrollbar overflow-y-auto">
                {/* Main Navigation */}
                <nav className="space-y-1">
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-white text-black shadow-lg shadow-white/5'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${item.label === 'Dashboard' ? 'stroke-[2.5px]' : ''}`} />
                                <span className="text-[14px] font-medium">{item.label}</span>
                            </div>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Logout Section */}
            <div className="p-4 border-t border-gray-800/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-white transition-colors" />
                    <span className="text-[14px] font-medium group-hover:text-white transition-colors">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
