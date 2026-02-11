import { useEffect, useState } from 'react';
import {
    Users, Hotel, Info, Check, Loader2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Room {
    id: string;
    type: string;
    price: number;
}

interface Staff {
    id: string;
    name: string;
    role: string;
}

const CreateCruise = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        maxCapacity: 100,
        selectedRooms: [] as string[],
        selectedStaff: [] as string[],
        selectedActivities: [] as { activityId: string, day: number }[]
    });

    useEffect(() => {
        Promise.all([
            api.get('/rooms'),
            api.get('/staff')
        ]).then(([roomsRes, staffRes]) => {
            setRooms(roomsRes.data);
            setStaff(staffRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/cruises', {
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                maxCapacity: formData.maxCapacity,
                rooms: formData.selectedRooms,
                staff: formData.selectedStaff,
                activities: formData.selectedActivities
            });
            navigate('/trips');
        } catch (err) {
            console.error(err);
        }
    };

    const toggleRoom = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedRooms: prev.selectedRooms.includes(id)
                ? prev.selectedRooms.filter(r => r !== id)
                : [...prev.selectedRooms, id]
        }));
    };

    const toggleStaff = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedStaff: prev.selectedStaff.includes(id)
                ? prev.selectedStaff.filter(s => s !== id)
                : [...prev.selectedStaff, id]
        }));
    };



    if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5]" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Plan New Voyage</h1>
                <p className="text-[#a0a0a0] font-medium text-lg">Set the course for a new cruise adventure. Select rooms, staff, and entertainment schedule.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                
                <section className="bg-[#2a2a2a] border border-[#3a3a3a] p-10 rounded-[2.5rem] shadow-sm space-y-8">
                    <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Info className="w-5 h-5" /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 col-span-full">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cruise Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#333333] border border-[#3a3a3a] rounded-xl py-4 px-6 outline-none focus:bg-[#2a2a2a] focus:border-[#b8935e] transition-all text-lg font-black"
                                placeholder="E.g. Atlantic Star Gala"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Departure Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full bg-[#333333] border border-[#3a3a3a] rounded-xl py-4 px-6 outline-none focus:bg-[#2a2a2a] focus:border-[#b8935e] transition-all font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Return Date</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-[#333333] border border-[#3a3a3a] rounded-xl py-4 px-6 outline-none focus:bg-[#2a2a2a] focus:border-[#b8935e] transition-all font-bold"
                                required
                            />
                        </div>
                    </div>
                </section>

                
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Hotel className="w-5 h-5" /> Cabin Selection
                        </h2>
                        <span className="text-xs font-bold text-[#a0a0a0] capitalize">{formData.selectedRooms.length} Selected</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {rooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => toggleRoom(room.id)}
                                className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${formData.selectedRooms.includes(room.id)
                                    ? 'bg-[#b8935e] border-[#b8935e] text-white shadow-xl translate-y-[-4px]'
                                    : 'bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#b8935e]/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <Hotel className={`w-6 h-6 ${formData.selectedRooms.includes(room.id) ? 'text-white' : 'text-gray-300'}`} />
                                    {formData.selectedRooms.includes(room.id) && <Check className="w-5 h-5" />}
                                </div>
                                <h3 className="font-black text-lg">{room.type} Cabin</h3>
                                <div className={`mt-2 text-xs font-bold uppercase tracking-widest ${formData.selectedRooms.includes(room.id) ? 'text-white/60' : 'text-[#a0a0a0]'}`}>
                                    Rate: ${room.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                
                <section className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Users className="w-5 h-5" /> Crew Assignment
                        </h2>
                        <span className="text-xs font-bold text-[#a0a0a0] capitalize">{formData.selectedStaff.length} Assigned</span>
                    </div>
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-gray-50">
                            {staff.map(member => (
                                <div
                                    key={member.id}
                                    onClick={() => toggleStaff(member.id)}
                                    className={`flex items-center gap-4 p-6 cursor-pointer hover:bg-[#333333] transition-colors ${formData.selectedStaff.includes(member.id) ? 'bg-[#b8935e]/5' : ''
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.selectedStaff.includes(member.id) ? 'bg-[#b8935e] border-[#b8935e] text-white' : 'border-gray-200 bg-[#2a2a2a]'
                                        }`}>
                                        {formData.selectedStaff.includes(member.id) && <Check className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{member.name}</p>
                                        <p className="text-[10px] font-black text-[#a0a0a0] uppercase tracking-widest">{member.role} TEAM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                
                <div className="pt-10 flex justify-end">
                    <button
                        type="submit"
                        className="bg-[#b8935e] text-white px-12 py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center gap-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:translate-y-[-4px] transition-all"
                    >
                        Confirm Trip Schedule <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCruise;
