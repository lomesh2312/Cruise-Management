import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

const StaffManagement = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleRemove = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/staff/${id}`);
            fetchStaff();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Staff Management</h1>
                    <p className="text-gray-400 font-medium">Manage team members, roles, salaries, and assignments.</p>
                </div>
                <button className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
                    <Plus className="w-5 h-5" /> Add Staff Member
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Name & Role</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Salary</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Current Assignment</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black">{member.name}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{member.role} STAFF</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-black">Active</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-black text-black">${member.salary.toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    {member.cruise ? (
                                        <p className="font-medium text-black underline decoration-black/10 underline-offset-4">{member.cruise.name}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">Unassigned</p>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm">
                                            <ShieldCheck className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(member.id)}
                                            className="p-3 text-gray-400 hover:text-black hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staff.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Users className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold">No staff members listed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffManagement;
