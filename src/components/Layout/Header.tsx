
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { admin, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState('https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handlePhotoChange = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setProfilePhoto(event.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    return (
        <header className="h-20 bg-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-40 border-b border-[#3a3a3a]">
            <div className="flex items-center gap-4">

            </div>

            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                <div
                    className="flex items-center gap-3 pl-3 ml-2 group cursor-pointer hover:bg-[#333333] rounded-xl px-4 py-2 transition-all"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#e5e5e5]">Admin</span>
                            <ChevronDown className={`w-4 h-4 text-[#a0a0a0] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        <p className="text-[11px] font-semibold text-[#a0a0a0] uppercase tracking-tighter">
                            {admin?.email?.split('@')[0] || 'Cruise Admin'}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-[#b8935e] shadow-md">
                            <img
                                src={profilePhoto}
                                alt="Admin Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#2a2a2a] rounded-full shadow-sm"></div>
                    </div>
                </div>


                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-2xl overflow-hidden">

                        <div className="p-4 border-b border-[#3a3a3a]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#b8935e]">
                                    <img
                                        src={profilePhoto}
                                        alt="Admin Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#e5e5e5]">Admin</p>
                                    <p className="text-xs text-[#a0a0a0]">{admin?.email || 'admin@cruise.com'}</p>
                                </div>
                            </div>
                        </div>


                        <div className="py-2">
                            <button
                                onClick={handlePhotoChange}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[#e5e5e5] hover:bg-[#333333] transition-colors text-left"
                            >
                                <User className="w-4 h-4 text-[#b8935e]" />
                                <span className="text-sm">Change Profile Photo</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[#e5e5e5] hover:bg-[#333333] transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4 text-[#b8935e]" />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
