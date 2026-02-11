import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Edit2, Loader2, UtensilsCrossed, Sparkles, X, Music } from 'lucide-react';
import api from '../services/api';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

interface Staff {
    id: string;
    name: string;
    role: 'FOOD' | 'CLEANING' | 'EVENT';
    designation: string;
    salary: number;
    cruiseId?: string;
    cruise?: { name: string };
}

const StaffManagement = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'FOOD' | 'CLEANING' | 'EVENT'>('FOOD');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        role: 'FOOD' as 'FOOD' | 'CLEANING' | 'EVENT',
        designation: '',
        salary: 0
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setFormData({
            name: '',
            role: activeTab,
            designation: '',
            salary: 0
        });
        setFormError(null);
        setIsAddModalOpen(true);
    };

    const handleEditClick = (member: Staff) => {
        setSelectedStaff(member);
        setFormData({
            name: member.name,
            role: member.role,
            designation: member.designation,
            salary: member.salary
        });
        setFormError(null);
        setIsEditModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                salary: Number(formData.salary)
            };

            if (isAddModalOpen) {
                await api.post('/staff', payload);
            } else if (isEditModalOpen && selectedStaff) {
                await api.put(`/staff/${selectedStaff.id}`, payload);
            }
            fetchStaff();
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setStaffToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;
        try {
            await api.delete(`/staff/${staffToDelete}`);
            fetchStaff();
            setDeleteModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to remove staff member');
        }
    };

    const filteredStaff = staff.filter(s => s.role === activeTab);

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e5e5e5]" />
        </div>
    );

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#e5e5e5] border-l-4 border-[#b8935e] pl-4">Staff Management</h1>
                    <p className="text-[#a0a0a0] font-medium text-sm mt-1 ml-5">Manage team members across Food and Cleaning departments.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-[#b8935e] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] active:translate-y-0 transition-all text-sm uppercase tracking-widest"
                >
                    <Plus className="w-5 h-5" /> Add Staff Member
                </button>
            </div>

            
            <div className="flex gap-2 bg-[#333333] p-2 rounded-3xl w-fit">
                <button
                    onClick={() => setActiveTab('FOOD')}
                    className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'FOOD'
                        ? 'bg-[#b8935e] text-white shadow-lg'
                        : 'text-[#a0a0a0] hover:text-[#e5e5e5]'
                        }`}
                >
                    <UtensilsCrossed className="w-4 h-4" />
                    Food Staff ({staff.filter(s => s.role === 'FOOD').length})
                </button>
                <button
                    onClick={() => setActiveTab('CLEANING')}
                    className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'CLEANING'
                        ? 'bg-[#b8935e] text-white shadow-lg'
                        : 'text-[#a0a0a0] hover:text-[#e5e5e5]'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Cleaning ({staff.filter(s => s.role === 'CLEANING').length})
                </button>
                <button
                    onClick={() => setActiveTab('EVENT')}
                    className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'EVENT'
                        ? 'bg-[#b8935e] text-white shadow-lg'
                        : 'text-[#a0a0a0] hover:text-[#e5e5e5]'
                        }`}
                >
                    <Music className="w-4 h-4" />
                    Events ({staff.filter(s => s.role === 'EVENT').length})
                </button>
            </div>

            
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[40px] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#333333] border-b border-[#3a3a3a]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#a0a0a0]">Name & Designation</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#a0a0a0]">Department</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#a0a0a0]">Salary</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#a0a0a0] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredStaff.map((member) => (
                            <tr key={member.id} className="hover:bg-[#333333]/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-[#e5e5e5] text-base">{member.name}</p>
                                            <p className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest mt-0.5">{member.designation}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        {member.role === 'FOOD' ? (
                                            <div className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full flex items-center gap-2">
                                                <UtensilsCrossed className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Food</span>
                                            </div>
                                        ) : member.role === 'CLEANING' ? (
                                            <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-2">
                                                <Sparkles className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Cleaning</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full flex items-center gap-2">
                                                <Music className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Event</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-[#e5e5e5] text-lg">₹{member.salary.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest">per month</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            className="p-3 text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(member.id)}
                                            className="p-3 text-[#a0a0a0] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStaff.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-[#a0a0a0]">
                        <Users className="w-16 h-16 mb-4 text-gray-200" />
                        <p className="font-bold uppercase tracking-widest text-sm">No {activeTab.toLowerCase()} staff members listed.</p>
                        <button onClick={handleAddClick} className="mt-4 text-[#e5e5e5] font-black text-xs underline uppercase tracking-widest">Add Staff Member</button>
                    </div>
                )}
            </div>

            
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-[#b8935e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#2a2a2a] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-[#3a3a3a] flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-[#e5e5e5] uppercase tracking-tight">{isAddModalOpen ? 'Add Staff Member' : 'Edit Staff Member'}</h2>
                                <p className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest mt-1">Provide staff details and salary</p>
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Full Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="e.g. Rahul Verma" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Department</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5 appearance-none">
                                        <option value="FOOD">Food Department</option>
                                        <option value="CLEANING">Cleaning Department</option>
                                        <option value="EVENT">Event Department</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Designation / Role</label>
                                    <input required name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-bold text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="e.g. Head Chef, Housekeeping Manager" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a0a0a0] ml-1">Monthly Salary (₹)</label>
                                    <input required type="number" min="0" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full px-6 py-4 bg-[#333333] rounded-2xl font-black text-2xl text-[#e5e5e5] border-none focus:ring-4 focus:ring-black/5" placeholder="0" />
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
                                        {isSubmitting ? (isAddModalOpen ? 'Adding...' : 'Saving...') : (isAddModalOpen ? 'Add Staff' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Staff Member?"
                message="This will permanently remove this staff member from the system. This action is irreversible."
            />
        </div>
    );
};

export default StaffManagement;

