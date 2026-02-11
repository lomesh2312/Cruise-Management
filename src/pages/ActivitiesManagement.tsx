import { useEffect, useState } from 'react';
import {
    Music, Plus, Trash2, User, Phone, Edit2, Image as ImageIcon,
    X, Users, UserCheck, Star, Loader2, Info
} from 'lucide-react';
import api from '../services/api';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Activity {
    id: string;
    name: string;
    description: string;
    type: 'Solo' | 'Duo' | 'Group';
    performerName?: string;
    managerName: string;
    managerContact: string;
    cost: number;
    images: string[];
}

const ActivitiesManagement = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Solo',
        performerName: '',
        managerName: '',
        managerContact: '',
        cost: 0,
        images: [] as string[]
    });

    const [newImageUrl, setNewImageUrl] = useState('');

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setFormData({
            name: '',
            description: '',
            type: 'Solo',
            performerName: '',
            managerName: '',
            managerContact: '',
            cost: 0,
            images: []
        });
        setFormError(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setFormData({
            name: activity.name,
            description: activity.description,
            type: activity.type,
            performerName: activity.performerName || '',
            managerName: activity.managerName,
            managerContact: activity.managerContact,
            cost: activity.cost,
            images: activity.images || []
        });
        setFormError(null);
        setIsEditModalOpen(true);
    };

    const handleImageManageClick = (activity: Activity) => {
        setSelectedActivity(activity);
        setFormData({
            ...formData,
            images: activity.images || []
        });
        setIsImageModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                cost: Number(formData.cost)
            };

            if (isAddModalOpen) {
                await api.post('/activities', payload);
            } else if (isEditModalOpen && selectedActivity) {
                await api.put(`/activities/${selectedActivity.id}`, payload);
            }
            fetchActivities();
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setActivityToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!activityToDelete) return;
        try {
            await api.delete(`/activities/${activityToDelete}`);
            fetchActivities();
            setDeleteModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to delete activity');
        }
    };

    const addImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl.trim()]
        }));
        setNewImageUrl('');
    };

    const removeImageUrl = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const updateImages = async () => {
        if (!selectedActivity) return;
        setIsSubmitting(true);
        try {
            await api.put(`/activities/${selectedActivity.id}`, { images: formData.images });
            fetchActivities();
            setIsImageModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update images');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Solo': return <UserCheck className="w-4 h-4" />;
            case 'Duo': return <Users className="w-4 h-4" />;
            case 'Group': return <Star className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5]" />
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#e5e5e5] border-l-4 border-[#b8935e] pl-4">Activities Management</h1>
                    <p className="text-[#a0a0a0] font-medium text-sm mt-1 ml-5">Define entertainment options, manage performers, and track event costs.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-[#b8935e] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] active:translate-y-0 transition-all text-sm uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> Add New Activity
                </button>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activities.map((activity) => (
                    <div key={activity.id} className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[40px] shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all relative overflow-hidden group/card flex flex-col md:flex-row h-full min-h-[320px]">


                        <div className="w-full md:w-2/5 relative h-48 md:h-auto overflow-hidden bg-[#333333]">
                            {activity.images && activity.images.length > 0 ? (
                                <img
                                    src={activity.images[0]}
                                    alt={activity.name}
                                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Music className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                <button
                                    onClick={() => handleImageManageClick(activity)}
                                    className="bg-[#2a2a2a]/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2a2a2a] hover:text-[#e5e5e5] transition-all"
                                >
                                    Manage Gallery ({activity.images?.length || 0})
                                </button>
                            </div>


                            <div className="absolute top-4 left-4 bg-[#2a2a2a]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                                <span className="text-[#e5e5e5]">{getTypeIcon(activity.type)}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#e5e5e5]">{activity.type}</span>
                            </div>
                        </div>


                        <div className="flex-1 p-8 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#e5e5e5] group-hover/card:text-blue-600 transition-colors uppercase tracking-tight">{activity.name}</h3>
                                        {activity.performerName && (
                                            <p className="text-sm font-bold text-[#a0a0a0] mt-1 italic">Performer: {activity.performerName}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(activity)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-[#a0a0a0] hover:text-[#e5e5e5] transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(activity.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-[#a0a0a0] hover:text-red-600 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed line-clamp-3">{activity.description}</p>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0]">Manager</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-gray-600" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 truncate">{activity.managerName}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0]">Contact</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Phone className="w-3 h-3 text-gray-600" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 truncate">{activity.managerContact}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] mb-1">Standard Cost</p>
                                        <p className="text-2xl font-black text-[#e5e5e5]">${activity.cost.toLocaleString()}</p>
                                    </div>
                                    <button
                                        className="h-12 px-6 bg-[#333333] hover:bg-[#b8935e] hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        onClick={() => handleImageManageClick(activity)}
                                    >
                                        View Gallery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {activities.length === 0 && (
                <div className="h-96 flex flex-col items-center justify-center bg-[#333333] rounded-[40px] border-2 border-dashed border-[#3a3a3a]">
                    <Music className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-[#a0a0a0] font-bold uppercase tracking-widest text-sm">No activities defined yet</p>
                    <button onClick={handleAddClick} className="mt-4 text-[#e5e5e5] font-black text-xs underline uppercase tracking-widest">Create Activity</button>
                </div>
            )}


            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-[#b8935e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#2a2a2a] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-[#3a3a3a] flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-[#e5e5e5] uppercase tracking-tight">{isAddModalOpen ? 'Add New Activity' : 'Edit Activity'}</h2>
                                <p className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest mt-1">Provide activity specifics and costs</p>
                            </div>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-3 hover:bg-gray-100 rounded-full text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {formError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <p className="text-sm font-bold text-red-600">{formError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Activity Name</label>
                                        <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="e.g. Moonlight Jazz" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Activity Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5 appearance-none">
                                            <option value="Solo">Solo Performance</option>
                                            <option value="Duo">Duo Performance</option>
                                            <option value="Group">Group Performance</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Performer / Group Name</label>
                                    <input name="performerName" value={formData.performerName} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="e.g. The Midnight Trio" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Activity Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5 h-32 resize-none" placeholder="Describe the entertainment style and requirements..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Manager Name</label>
                                        <input required name="managerName" value={formData.managerName} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="Manager full name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Manager Contact</label>
                                        <input required name="managerContact" value={formData.managerContact} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="Phone number" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Standard Cost ($)</label>
                                    <input required type="number" min="0" name="cost" value={formData.cost} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-black text-2xl text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="0" />
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                        className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-12 py-4 bg-[#b8935e] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/30 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (isAddModalOpen ? 'Creating...' : 'Saving...') : (isAddModalOpen ? 'Add Activity' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isImageModalOpen && selectedActivity && (
                <div className="fixed inset-0 bg-[#b8935e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#2a2a2a] w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in scale-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-[#3a3a3a] flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-[#e5e5e5] uppercase tracking-tight">Gallery Control</h2>
                                <p className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest mt-1">Manage image links for {selectedActivity.name}</p>
                            </div>
                            <button onClick={() => setIsImageModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Paste New Image URL</label>
                                <div className="flex gap-4">
                                    <input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addImageUrl()}
                                        className="flex-1 px-6 py-4 bg-[#333333] rounded-2xl font-bold text-sm text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        onClick={addImageUrl}
                                        disabled={!newImageUrl.trim()}
                                        className="px-6 py-4 bg-[#b8935e] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-30"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="group relative aspect-video rounded-3xl overflow-hidden shadow-sm border border-[#3a3a3a] p-2 bg-[#2a2a2a]">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-2xl" />
                                        <div className="absolute inset-2 bg-[#b8935e]/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => removeImageUrl(index)}
                                                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all scale-75 group-hover:scale-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {formData.images.length === 0 && (
                                    <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center bg-[#333333] rounded-3xl border-2 border-dashed border-[#3a3a3a]">
                                        <ImageIcon className="w-10 h-10 text-gray-200 mb-2" />
                                        <p className="text-[10px] font-black text-[#a0a0a0] uppercase tracking-widest">No images added</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-[#3a3a3a] flex justify-end gap-4">
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={updateImages}
                                disabled={isSubmitting}
                                className="px-12 py-3 bg-[#b8935e] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Save Gallery'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Destroy Activity?"
                message="This will permanently remove this activity and its associated data. This action is irreversible."
            />
        </div>
    );
};

export default ActivitiesManagement;

