import React, { useState } from 'react';
import { familyApi } from '@/lib/api';
import { toast } from 'sonner';

const AddMemberModal = ({ isOpen, onClose, onPatientAdded }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        relation: '',
        gender: '',
        healthNotes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.dateOfBirth) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setLoading(true);
            await familyApi.addPatient({
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth,
                relation: formData.relation || undefined,
                gender: formData.gender || undefined,
                healthNotes: formData.healthNotes || undefined
            });

            toast.success('Patient added successfully!');
            setFormData({
                fullName: '',
                dateOfBirth: '',
                relation: '',
                gender: '',
                healthNotes: ''
            });

            if (onPatientAdded) {
                onPatientAdded();
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Failed to add patient:', error);
            toast.error(error.message || 'Failed to add patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0d4e5c]/40 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-[#99C5D3]/20 border border-[#B2EBF2] flex flex-col overflow-hidden max-h-[95vh]">
                <div className="px-8 py-6 flex items-center justify-between border-b border-stone-50 bg-[#F0F8FF]/30">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900 font-display">Add New Patient</h2>
                        <p className="text-stone-500 font-medium text-sm">Create a care profile for your loved one.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-stone-100 text-stone-400 hover:text-[#5fa5ba] hover:border-[#5fa5ba] transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2rem] bg-[#5fa5ba] flex flex-col items-center justify-center text-white text-4xl font-bold">
                                    {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="fullName">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all outline-none font-medium"
                                    id="fullName"
                                    placeholder="Enter patient's name"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="dateOfBirth">
                                    Date of Birth <span className="text-red-400">*</span>
                                </label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium text-stone-500"
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="relation">Relationship</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium appearance-none"
                                        id="relation"
                                        value={formData.relation}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Child">Child</option>
                                        <option value="Grandparent">Grandparent</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="gender">Gender</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium appearance-none"
                                        id="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="healthNotes">Health Notes</label>
                            <textarea
                                className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-3xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all resize-none outline-none font-medium"
                                id="healthNotes"
                                placeholder="Briefly describe any chronic conditions, allergies, or regular medications..."
                                rows="4"
                                value={formData.healthNotes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 pb-2">
                            <button
                                className="w-full bg-[#5fa5ba] text-white py-4 rounded-full font-bold text-lg hover:bg-[#4d8ca0] transition-all shadow-xl shadow-[#5fa5ba]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Profile</span>
                                        <span className="material-symbols-outlined">how_to_reg</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full mt-4 text-stone-400 font-bold text-sm hover:text-stone-600 transition-colors uppercase tracking-widest"
                                type="button"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;
