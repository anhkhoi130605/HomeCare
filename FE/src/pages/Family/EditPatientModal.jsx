import React, { useState, useEffect } from 'react';
import { familyApi } from '@/lib/api';
import { toast } from 'sonner';

const EditPatientModal = ({ isOpen, onClose, patient, onPatientUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalHistory: ''
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                fullName: patient.fullName || '',
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
                gender: patient.gender || '',
                address: patient.address || '',
                emergencyContact: patient.emergencyContact || '',
                emergencyPhone: patient.emergencyPhone || '',
                medicalHistory: patient.medicalHistory || ''
            });
        }
    }, [patient, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.dateOfBirth) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await familyApi.updatePatient(patient.id, {
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender || undefined,
                address: formData.address || undefined,
                emergencyContact: formData.emergencyContact || undefined,
                emergencyPhone: formData.emergencyPhone || undefined,
                medicalHistory: formData.medicalHistory || undefined
            });

            toast.success('Profile updated successfully!');

            if (onPatientUpdated) {
                onPatientUpdated();
            }
            onClose();
        } catch (error) {
            console.error('Failed to update patient:', error);
            toast.error(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0d4e5c]/40 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-[#B2EBF2] flex flex-col overflow-hidden max-h-[95vh]">
                <div className="px-8 py-6 flex items-center justify-between border-b border-stone-50 bg-[#F0F8FF]/30">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">Edit Patient Profile</h2>
                        <p className="text-stone-500 font-medium text-sm">Update personal and care information.</p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="fullName">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium"
                                    id="fullName"
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
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium"
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="address">📍 Care Address</label>
                            <input
                                className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium"
                                id="address"
                                placeholder="Enter specific care location"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="emergencyContact">📞 Emergency Contact</label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium"
                                    id="emergencyContact"
                                    type="text"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="emergencyPhone">Emergency Phone</label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium"
                                    id="emergencyPhone"
                                    type="tel"
                                    value={formData.emergencyPhone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="medicalHistory">Medical Summary</label>
                            <textarea
                                className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-3xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all resize-none outline-none font-medium"
                                id="medicalHistory"
                                rows="4"
                                value={formData.medicalHistory}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 pb-2">
                            <button
                                className="w-full bg-[#5fa5ba] text-white py-4 rounded-full font-bold text-lg hover:bg-[#4d8ca0] transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPatientModal;
