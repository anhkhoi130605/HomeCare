import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '@/lib/api';
// import ServiceBookingModal from './ServiceBookingModal';
import ScrollAnimation from "@/components/ui/scroll-animation";

const categories = ['Daily Care', 'Specialized Medical', 'Companionship'];

const BookingService = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Daily Care');
    // const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    // const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const data = await serviceApi.getAll();
                // Map API response to component format
                const mappedServices = data && data.length > 0 ? data.map(s => ({
                    id: s.id,
                    name: s.name,
                    category: s.category || (s.type === 'Specialized' ? 'Specialized Medical' : 'Daily Care'),
                    price: s.pricePerHour || s.price || 15,
                    unit: '/ hour',
                    features: s.features || (s.description ? [s.description] : []),
                    image: s.image || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400',
                    skillLevel: s.skillLevel || (s.pricePerHour > 40 ? 'Expert' : s.pricePerHour > 20 ? 'Intermediate' : 'Basic'),
                    durationAllowed: s.durationAllowed || (s.type === 'Specialized' ? '4h / 12h' : '2h / 4h')
                })) : [
                    // Mock data if API is empty
                    { id: 1, name: 'Basic Home Care', category: 'Daily Care', price: 15, unit: '/ hour', skillLevel: 'Basic', durationAllowed: '2h / 4h', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400', features: [] },
                    { id: 2, name: 'Premium Home Care', category: 'Daily Care', price: 25, unit: '/ hour', skillLevel: 'Intermediate', durationAllowed: '4h / 8h', image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400', features: [], recommended: true },
                    { id: 3, name: 'Post-Surgery Recovery', category: 'Specialized Medical', price: 45, unit: '/ hour', skillLevel: 'Expert', durationAllowed: '8h / 24h', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400', features: [] },
                    { id: 4, name: 'Dementia Care', category: 'Specialized Medical', price: 50, unit: '/ hour', skillLevel: 'Expert', durationAllowed: '4h / 12h', image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ae596d?w=400', features: [] },
                    { id: 5, name: 'Social Enrichment', category: 'Companionship', price: 20, unit: '/ hour', skillLevel: 'Basic', durationAllowed: '2h / 6h', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400', features: [] }
                ];
                setServices(mappedServices);
            } catch (err) {
                console.error('Failed to fetch services:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleBookService = (service) => {
        navigate(`/family/requests/create?service_id=${service.id}`);
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse pb-12 pt-4 font-['Public_Sans']">
                <div className="bg-stone-200 rounded-2xl h-24"></div>
                <div className="bg-stone-200 rounded-[2rem] h-[400px]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
                <p className="text-red-600 font-medium">Failed to load services</p>
                <p className="text-stone-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="font-['Public_Sans'] space-y-8 pb-12 pt-4 bg-transparent animate-fade-in-up">

            {/* 1. Header & Search - Clean Split */}
            <div className="flex flex-col xl:flex-row justify-between items-end gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">medical_services</span>
                        <h1 className="text-3xl font-medium text-stone-900 tracking-tight">Service Marketplace</h1>
                    </div>
                    <p className="text-stone-500 font-medium max-w-lg">Browse and book professional care services for your family members.</p>
                </div>

                {/* Search Bar */}
                <div className="w-full xl:w-auto min-w-[300px] 2xl:min-w-[400px]">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#5fa5ba] transition-colors">search</span>
                        <input
                            className="w-full bg-white border border-stone-200 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#99C5D3] focus:border-transparent outline-none text-stone-800 placeholder:text-stone-400 transition-all shadow-sm"
                            placeholder="Find a service..."
                            type="text"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Main Content Surface */}
            <ScrollAnimation animation="fade-up">
                <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm relative min-h-[600px] flex flex-col md:flex-row items-start">

                    {/* Left Sidebar: Categories */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-100 bg-stone-50/50 p-6 flex flex-col gap-2 md:sticky md:top-24 rounded-t-[2rem] md:rounded-tr-none md:rounded-l-[2rem]">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-2">Categories</h3>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === cat ? 'bg-[#5fa5ba] text-white shadow-md' : 'text-stone-600 hover:bg-stone-100'}`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {cat === 'Daily Care' ? 'wb_sunny' : cat === 'Specialized Medical' ? 'stethoscope' : 'diversity_1'}
                                </span>
                                {cat}
                            </button>
                        ))}

                        <div className="mt-8 p-4 bg-[#E0F2F1] rounded-2xl border border-[#B2EBF2] hidden md:block">
                            <div className="flex items-center gap-2 mb-2 text-[#00695C]">
                                <span className="material-symbols-outlined">verified_user</span>
                                <span className="font-bold text-xs uppercase tracking-wide">Guarantee</span>
                            </div>
                            <p className="text-[11px] text-[#004D40] leading-relaxed font-medium">
                                All our caregivers are certified and background-checked for your peace of mind.
                            </p>
                        </div>
                    </div>

                    {/* Right Content: Services List */}
                    <div className="flex-1 p-0">
                        {/* List Header */}
                        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-stone-900">{activeTab} Services</h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
                                <span>Sort by:</span>
                                <button className="flex items-center gap-1 text-stone-600 hover:text-[#5fa5ba]">
                                    Recommended <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                        </div>

                        {/* Services List Items */}
                        <div className="divide-y divide-story-100">
                            {services.filter(service => service.category === activeTab).map((service, index) => (
                                <div key={service.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-stone-50 transition-colors group relative">
                                    {/* Thumbnail - Compact */}
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-stone-200 shrink-0 overflow-hidden relative shadow-inner">
                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        {service.recommended && (
                                            <div className="absolute top-0 right-0 bg-[#5fa5ba] w-6 h-6 flex items-center justify-center rounded-bl-xl">
                                                <span className="material-symbols-outlined text-white text-[14px]">star</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#5fa5ba] transition-colors">{service.name}</h3>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-stone-400 font-medium whitespace-nowrap">Skill Level:</span>
                                                        <span className="text-sm text-stone-500 font-bold opacity-60">{service.skillLevel}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-stone-400 font-medium whitespace-nowrap">Duration:</span>
                                                        <span className="text-sm text-stone-600 font-bold">{service.durationAllowed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right md:hidden">
                                                <p className="text-2xl font-black text-stone-900">${service.price}<span className="text-sm font-medium text-stone-400"> / hour</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action - Right Side */}
                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 pl-0 md:pl-8 md:border-l border-stone-100">
                                        <div className="hidden md:block text-right min-w-[120px]">
                                            <p className="text-3xl font-black text-stone-900 tracking-tight">${service.price}</p>
                                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">/ Hour</p>
                                        </div>

                                        <button
                                            onClick={() => handleBookService(service)}
                                            className="h-12 w-12 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-400 hover:border-[#5fa5ba] hover:bg-[#5fa5ba] hover:text-white transition-all group/btn shadow-sm"
                                        >
                                            <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Floating Review Cart */}
            <ScrollAnimation animation="scale-up" className="fixed bottom-8 right-8 z-50">
                <div className="relative">
                    <button className="flex items-center gap-4 bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group border-2 border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined">shopping_bag</span>
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-stone-900"></span>
                            </div>
                            <span className="font-bold tracking-wide text-sm">Review (2)</span>
                        </div>
                    </button>
                </div>
            </ScrollAnimation>

            {/* 
            <ServiceBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                service={selectedService}
            /> 
            */}
        </div>
    );
};

export default BookingService;
