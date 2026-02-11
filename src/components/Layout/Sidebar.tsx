
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Anchor, Hotel, Music, Users, LogOut, Calculator
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const mainItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calculator, label: 'Generate Trip', path: '/generate-trip' },
        { icon: Anchor, label: 'Trip History', path: '/trips' },
        { icon: Hotel, label: 'Rooms', path: '/rooms' },
        { icon: Music, label: 'Activities', path: '/activities' },
        { icon: Users, label: 'Staff', path: '/staff' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="w-64 bg-[#2a2a2a] border-r border-[#3a3a3a] flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
            
            <div className="px-6 h-20 flex items-center gap-3 border-b border-[#3a3a3a]">
                <div className="flex gap-0.5">
                    <div className="w-1.5 h-6 bg-[#b8935e] rounded-full"></div>
                    <div className="w-1.5 h-4 bg-[#b8935e]/60 rounded-full my-auto"></div>
                    <div className="w-1.5 h-6 bg-[#b8935e] rounded-full"></div>
                </div>
                <span className="text-lg font-bold tracking-tight text-[#e5e5e5]">Cruise Management</span>
            </div>

            <div className="flex-1 px-4 py-6 custom-scrollbar overflow-y-auto">
                
                <nav className="space-y-1">
                    {mainItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#b8935e] text-[#1a1a1a] shadow-lg shadow-[#b8935e]/20'
                                    : 'text-[#a0a0a0] hover:bg-[#333333] hover:text-[#e5e5e5]'
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

            
            <div className="p-4 border-t border-[#3a3a3a]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#a0a0a0] hover:bg-[#333333] hover:text-[#e5e5e5] transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-[#e5e5e5] transition-colors" />
                    <span className="text-[14px] font-medium group-hover:text-[#e5e5e5] transition-colors">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
