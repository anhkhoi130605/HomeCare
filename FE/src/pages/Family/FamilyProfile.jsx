import React, { useState, useRef, useEffect } from 'react';

import { familyApi, authApi } from '@/lib/api';
import { toast } from 'sonner';
import AddMemberModal from './AddMemberModal';
import { useOutletContext, useNavigate } from 'react-router-dom';
const FamilyProfile = () => {
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [patients, setPatients] = useState([]);
    const fileInputRef = useRef(null);

    const context = useOutletContext();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = context || useState(null);
    const user = authApi.getCurrentUser();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileData, patientsData] = await Promise.all([
                familyApi.getProfile(),
                familyApi.getPatients()
            ]);
            setProfile(profileData);
            setPatients(patientsData || []);
            setFormData({
                fullName: profileData?.fullName || user?.email?.split('@')[0] || '',
                email: user?.email || '',
                phone: profileData?.phone || '',
                address: profileData?.address || ''
            });
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await familyApi.updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                address: formData.address
            });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePatientAdded = () => {
        fetchData();
        setIsAddMemberModalOpen(false);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-col max-w-[960px] w-full gap-8 mx-auto font-['Manrope'] pb-12 animate-fade-in-up">

            {/* Profile Header */}
            <div className="flex p-8 bg-white rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5fa5ba]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex w-full flex-col gap-6 items-center relative z-10">
                    <div className="flex gap-6 flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            {profileImage ? (
                                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 ring-4 ring-[#5fa5ba]/20 shadow-xl transition-all group-hover:ring-[#5fa5ba]/40" style={{ backgroundImage: `url("${profileImage}")` }}></div>
                            ) : (
                                <div className="rounded-full min-h-32 w-32 ring-4 ring-[#5fa5ba]/20 shadow-xl bg-[#5fa5ba] flex items-center justify-center text-white text-3xl font-bold">
                                    {getInitials(formData.fullName)}
                                </div>
                            )}
                            <button className="absolute bottom-1 right-1 bg-[#5fa5ba] text-white p-2.5 rounded-full shadow-lg hover:scale-110 hover:bg-[#4d8ca0] transition-all">
                                <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-center text-stone-900">
                                {loading ? '...' : formData.fullName || 'Your Profile'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-[#E0F2F1] text-[#00695C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#B2EBF2]">Family Manager</span>
                                <span className="text-stone-500 text-sm font-medium">• Managing {patients.length} patient{patients.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Linked Members Section */}
            <section>
                <div className="flex items-center justify-between px-2 mb-4">
                    <h2 className="text-[22px] font-bold text-stone-900">Linked Patients</h2>
                    <button
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="text-[#5fa5ba] text-sm font-bold flex items-center gap-2 hover:bg-[#E0F2F1] px-3 py-1.5 rounded-full transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span> Add Patient
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {patients.length === 0 ? (
                        <div className="min-w-[300px] bg-stone-50 p-5 rounded-[1.5rem] border border-dashed border-stone-200 flex items-center gap-4">
                            <div className="size-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                                <span className="material-symbols-outlined text-2xl">person_add</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg text-stone-400">No patients yet</p>
                                <p className="text-xs text-stone-400">Click "Add Patient" to get started</p>
                            </div>
                        </div>
                    ) : (
                        patients.map((patient, idx) => (
                            <div key={patient.id} className="min-w-[300px] bg-white p-5 rounded-[1.5rem] border border-stone-100 flex items-center gap-4 hover:shadow-lg hover:border-[#B2EBF2] transition-all group cursor-pointer">
                                <div className="size-16 rounded-2xl bg-[#5fa5ba] flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                    {patient.fullName?.charAt(0) || 'P'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-stone-900 group-hover:text-[#5fa5ba] transition-colors">{patient.fullName}</p>
                                    <p className="text-xs font-bold text-[#00695C] bg-[#E0F2F1] px-2 py-0.5 rounded-md inline-block mt-1">
                                        {patient.relation || 'Patient'}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Information Form Section */}
            <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
                <h2 className="text-[22px] font-bold px-2 pb-8 text-stone-900 border-b border-stone-100 mb-8">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <input
                                className="w-full bg-stone-50 border-2 border-transparent hover:border-stone-200 rounded-2xl p-4 font-bold text-stone-800 focus:bg-white focus:border-[#5fa5ba] focus:ring-4 focus:ring-[#E0F2F1] outline-none transition-all placeholder:font-medium"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Your full name"
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">person</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <input
                                className="w-full bg-stone-100 border-2 border-transparent rounded-2xl p-4 font-bold text-stone-500 cursor-not-allowed"
                                type="email"
                                value={formData.email}
                                disabled
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">mail</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Primary Phone</label>
                        <div className="relative">
                            <input
                                className="w-full bg-stone-50 border-2 border-transparent hover:border-stone-200 rounded-2xl p-4 font-bold text-stone-800 focus:bg-white focus:border-[#5fa5ba] focus:ring-4 focus:ring-[#E0F2F1] outline-none transition-all placeholder:font-medium"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+84 xxx xxx xxxx"
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">phone</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Home Address</label>
                        <div className="relative">
                            <input
                                className="w-full bg-stone-50 border-2 border-transparent hover:border-stone-200 rounded-2xl p-4 font-bold text-stone-800 focus:bg-white focus:border-[#5fa5ba] focus:ring-4 focus:ring-[#E0F2F1] outline-none transition-all placeholder:font-medium"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Your home address"
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">location_on</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
                <h2 className="text-[22px] font-bold px-2 pb-8 text-stone-900 border-b border-stone-100 mb-8">Security & Privacy</h2>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between p-5 bg-stone-50 rounded-[1.5rem] border border-stone-100 hover:border-[#B2EBF2] transition-colors group">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-white rounded-2xl text-[#5fa5ba] shadow-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <div>
                                <p className="font-bold text-stone-900 text-lg">Password</p>
                                <p className="text-xs font-bold text-stone-400 mt-0.5">Manage your account password</p>
                            </div>
                        </div>
                       <button
    type="button"
    onClick={() => navigate("/family/change-password")}
    className="bg-white border-2 border-stone-200 text-stone-600 px-6 py-2.5 rounded-full font-bold text-sm hover:border-[#5fa5ba] hover:text-[#5fa5ba] transition-all shadow-sm"
>
    Change
</button>
                    </div>
                </div>
            </section>

            {/* Action Footer */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => fetchData()}
                    className="px-8 py-4 rounded-full border-2 border-stone-200 text-stone-400 font-bold hover:border-stone-800 hover:text-stone-800 transition-all uppercase tracking-wider text-sm"
                >
                    Discard
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-10 py-4 rounded-full bg-[#5fa5ba] text-white font-bold hover:bg-[#4d8ca0] hover:shadow-lg hover:shadow-[#5fa5ba]/20 hover:-translate-y-1 transition-all uppercase tracking-wider text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                onPatientAdded={handlePatientAdded}
            />
        </div>
    );
};

export default FamilyProfile;
