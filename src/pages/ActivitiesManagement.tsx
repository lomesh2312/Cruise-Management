import React, { useEffect, useState } from 'react';
import { Music, Plus, Trash2, User, Phone, Info, Loader2 } from 'lucide-react';
import api from '../services/api';

const ActivitiesManagement = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await api.get('/activities');
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this activity?')) return;
        try {
            await api.delete(`/activities/${id}`);
            fetchActivities();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Activities Management</h1>
                    <p className="text-gray-400 font-medium">Define entertainment options and assign managers.</p>
                </div>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" /> Add New Activity
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activities.map((activity) => (
                    <div key={activity.id} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] flex items-center justify-center -mr-8 -mt-8 grayscale opacity-20 group-hover:opacity-40 transition-opacity">
                            <Music className="w-12 h-12 text-black" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black mb-2">{activity.name}</h3>
                                <p className="text-gray-400 font-medium line-clamp-2">{activity.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Manager</p>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-black" />
                                        <span className="text-sm font-bold">{activity.managerName}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Contact</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-black" />
                                        <span className="text-sm font-bold">{activity.managerContact}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cost per event</p>
                                    <p className="text-2xl font-black">${activity.cost.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-4 bg-white border border-gray-100 rounded-xl hover:border-black transition-colors shadow-sm">
                                        <Info className="w-5 h-5 text-black" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="p-4 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm group/del"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivitiesManagement;
