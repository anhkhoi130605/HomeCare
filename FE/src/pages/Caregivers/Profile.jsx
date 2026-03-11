import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { caregiverApi, authApi } from '@/lib/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await caregiverApi.getProfile();
            setProfile(data);
            setEditForm({
                fullName: data.fullName || '',
                phone: data.phone || '',
                specialization: data.specialization || '',
                bio: data.bio || '',
                isAvailable: data.isAvailable
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await caregiverApi.updateProfile(editForm);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile: ' + err.message);
        }
    };

    const handleLogout = () => {
        authApi.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#5fa5ba] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-stone-500 dark:text-stone-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-stone-950">
                <div className="text-center text-red-500">
                    <p>Error loading profile: {error}</p>
                    <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-stone-950 custom-scrollbar font-manrope">
            <ScrollAnimation animation="fade-down" delay={0.1}>
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-stone-800 dark:text-white tracking-tight">Personal Profile</h1>
                        <p className="text-sm font-medium text-stone-400 mt-1">Manage your credentials and preferences</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="w-11 h-11 flex items-center justify-center text-stone-400 hover:text-[#5fa5ba] hover:bg-[#5fa5ba]/10 rounded-full transition-all relative">
                            <span className="material-symbols-outlined text-2xl">notifications</span>
                        </button>
                        <div className="flex items-center gap-4 pl-6 border-l border-stone-100 dark:border-stone-800 group">
                            <img
                                alt="Caregiver profile"
                                className="w-12 h-12 rounded-2xl object-cover shadow-lg ring-2 ring-white dark:ring-stone-800 group-hover:ring-[#5fa5ba] transition-all cursor-pointer"
                                src={profile?.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"}
                            />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                            title="Sign Out"
                        >
                            <span className="material-symbols-outlined text-2xl">logout</span>
                        </button>
                    </div>
                </header>
            </ScrollAnimation>

            <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
                {/* Personal Information Section */}
                <ScrollAnimation animation="fade-right" delay={0.2}>
                    <section className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden group">
                        <div className="px-10 py-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
                            <h2 className="font-bold text-xl flex items-center gap-3 text-stone-800 dark:text-white">
                                <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 flex items-center justify-center text-[#5fa5ba]">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                Personal Information
                            </h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 text-xs font-black text-[#5fa5ba] hover:bg-[#5fa5ba]/10 px-5 py-2.5 rounded-xl transition-all border border-transparent uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-lg">{isEditing ? 'close' : 'edit'}</span>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        <div className="p-10 flex flex-col md:flex-row gap-12 items-start">
                            <div className="relative group/avatar">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-[#5fa5ba] to-teal-400 rounded-[2.5rem] opacity-0 group-hover/avatar:opacity-20 blur-xl transition-all duration-500"></div>
                                <img
                                    alt="Caregiver large"
                                    className="w-48 h-48 rounded-[2rem] object-cover shadow-2xl relative z-10 border-4 border-white dark:border-stone-800"
                                    src={profile?.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"}
                                />
                                <button className="absolute -bottom-4 -right-4 bg-white dark:bg-stone-800 p-3.5 rounded-2xl shadow-xl border-2 border-stone-100 dark:border-stone-700 text-[#5fa5ba] hover:scale-110 transition-transform active:scale-95 z-20 hover:text-[#4d8ca0]">
                                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                                </button>
                            </div>

                            {isEditing ? (
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                            className="w-full mt-2 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Phone</label>
                                        <input
                                            type="text"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full mt-2 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Specialization</label>
                                        <input
                                            type="text"
                                            value={editForm.specialization}
                                            onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                                            className="w-full mt-2 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Bio</label>
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            rows={3}
                                            className="w-full mt-2 px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-white focus:ring-2 focus:ring-[#5fa5ba] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isAvailable}
                                            onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
                                            className="w-5 h-5 rounded border-stone-300 text-[#5fa5ba] focus:ring-[#5fa5ba]"
                                        />
                                        <label className="text-sm font-bold text-stone-600 dark:text-stone-300">Available for new assignments</label>
                                    </div>
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="w-full py-4 bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white font-bold rounded-xl transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 flex-1">
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Full Name</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">{profile?.fullName}</p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Email</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">{profile?.email}</p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Phone</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">{profile?.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Specialization</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">{profile?.specialization || 'General Care'}</p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Experience</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">{profile?.experienceYears} years</p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Hourly Rate</p>
                                        <p className="font-bold text-stone-800 dark:text-stone-200 text-lg leading-tight">
                                            {profile?.hourlyRate?.toLocaleString('vi-VN')} VND
                                        </p>
                                    </div>
                                    <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3 col-span-2">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</p>
                                        <p className={`font-bold text-lg leading-tight ${profile?.isAvailable ? 'text-green-500' : 'text-amber-500'}`}>
                                            {profile?.isAvailable ? 'âœ“ Available for assignments' : 'â¸ Currently unavailable'}
                                        </p>
                                    </div>
                                    {profile?.bio && (
                                        <div className="space-y-2 border-b border-stone-50 dark:border-stone-800 pb-3 col-span-2">
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Bio</p>
                                            <p className="font-medium text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{profile.bio}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </ScrollAnimation>

                {/* Stats Section */}
                <ScrollAnimation animation="fade-left" delay={0.3}>
                    <section className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden p-10">
                        <h2 className="font-bold text-xl flex items-center gap-3 text-stone-800 dark:text-white mb-8">
                            <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 flex items-center justify-center text-[#5fa5ba]">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            Quick Stats
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-2xl text-center">
                                <p className="text-4xl font-black text-[#5fa5ba]">{profile?.upcomingSchedulesCount || 0}</p>
                                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-2">Upcoming Shifts</p>
                            </div>
                            <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-2xl text-center">
                                <p className="text-4xl font-black text-emerald-500">{profile?.experienceYears || 0}</p>
                                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-2">Years Experience</p>
                            </div>
                            <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-2xl text-center">
                                <p className="text-4xl font-black text-amber-500">
                                    {profile?.isAvailable ? 'Yes' : 'No'}
                                </p>
                                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-2">Available</p>
                            </div>
                        </div>
                    </section>
                </ScrollAnimation>
            </div>
            <footer className="p-8 text-center text-stone-400 text-xs font-bold mt-auto mb-4">
                Â© 2024 HomeCare Systems Inc. All Rights Reserved. â€¢ <a href="#" className="hover:text-[#5fa5ba] underline transition-colors">Privacy Policy</a>
            </footer>
        </div>
    );
};

export default Profile;
