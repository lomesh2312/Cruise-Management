import React from 'react';
import { Bell, Moon, LayoutGrid, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { admin } = useAuth();

    return (
        <header className="h-20 bg-transparent flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Space for dynamic breadcrumbs if needed */}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-50">
                    <button className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all">
                        <Moon className="w-5 h-5 flex-shrink-0" />
                    </button>
                    <button className="p-2.5 text-black bg-gray-50/80 rounded-xl transition-all shadow-inner">
                        <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all relative">
                        <Bell className="w-5 h-5 flex-shrink-0" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-3 ml-2 group cursor-pointer">
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">Admin</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tighter">
                            {admin?.email?.split('@')[0] || 'Cruise Admin'}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="Admin Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
