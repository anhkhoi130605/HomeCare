import React from 'react';
import { useNavigate } from 'react-router-dom';
import { welcomeData } from '../../data/Family/welcome';
import { Button } from "@/components/ui/button";
import ScrollAnimation from "@/components/ui/scroll-animation";

const Welcome = () => {
    const navigate = useNavigate();
    return (
        <div className="font-['Public_Sans'] bg-white text-stone-900 min-h-screen relative overflow-x-hidden pb-12 animate-fade-in-up">

            {/* 1. Hero Section */}
            <section className="relative px-6 pt-6 pb-4 max-w-[1440px] mx-auto">
                <ScrollAnimation animation="fade-in" duration={0.8}>
                    <div className="relative">
                        {/* Main Hero Visual - Reduced Height (Panoramic) */}
                        <div className="relative h-[250px] lg:h-[300px] w-full rounded-[2.5rem] overflow-hidden shadow-sm z-10 transition-all duration-500">
                            {/* Background Image / Gradient */}
                            <div className="absolute inset-0 bg-stone-200">
                                <img
                                    src="/images/how.jpg"
                                    alt="Hero"
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-stone-900/5 to-transparent"></div>
                            </div>

                            {/* Header INSIDE the Image */}
                            <header className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-start z-20">
                                {/* Logo */}
                                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer ring-1 ring-white/50 group">
                                    <span className="material-symbols-outlined text-[#5fa5ba] text-lg group-hover:scale-110 transition-transform">health_and_safety</span>
                                    <span className="font-bold text-xs tracking-wide text-stone-900">HomeCare</span>
                                </div>

                                {/* Top Center Toggle */}
                                <div className="hidden md:flex bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-1 absolute left-1/2 -translate-x-1/2 top-6">
                                    <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Top Right Info */}
                                <div className="flex items-center gap-3">
                                    <span className="hidden md:block text-[10px] font-bold text-white/90 drop-shadow-sm tracking-wide">New York, USA 3:47 PM</span>
                                    <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-transform hover:bg-white shadow-sm">
                                        <span className="material-symbols-outlined text-[16px] text-stone-900">question_mark</span>
                                    </button>
                                    <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-transform hover:bg-white shadow-sm">
                                        <span className="material-symbols-outlined text-[16px] text-stone-900">menu</span>
                                    </button>
                                </div>
                            </header>


                        </div>
                    </div>
                </ScrollAnimation>

                {/* Grid Layout for Lower Content */}
                <div className="mt-16 grid grid-cols-12 gap-4 relative">

                    {/* Left Sidebar Actions - Vertical Strip */}
                    <div className="col-span-1 hidden xl:flex flex-col gap-2 items-center pt-4">
                        {["call", "grid_view", "language", "opacity", "close"].map((icon, idx) => (
                            <ScrollAnimation key={idx} animation="slide-left" delay={0.2 + idx * 0.1}>
                                <button className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all ${icon === 'close' ? 'bg-black text-white hover:text-white mt-1 shadow-md' : 'bg-white border border-stone-100 text-stone-400 hover:text-stone-900'}`}>
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                </button>
                            </ScrollAnimation>
                        ))}
                    </div>

                    {/* Middle Content */}
                    <div className="col-span-12 xl:col-span-8 relative">
                        {/* Floating "Innovative Solutions" Badge */}
                        <div className="absolute -top-6 left-10 z-0 hidden md:block">
                            <ScrollAnimation animation="fade-up" delay={0.4}>
                                <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-stone-100 inline-block w-40 hover:-translate-y-1 transition-transform cursor-pointer">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-[10px] text-stone-800 leading-tight w-24">Innovative health solutions</p>
                                        <span className="text-[8px] font-bold text-stone-300 transform rotate-90 origin-center">01</span>
                                    </div>
                                    <div className="flex justify-center mt-2">
                                        <div className="w-4 h-4 rounded-full border border-stone-800 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-stone-800 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </div>

                        <div className="mt-20 md:pl-10">
                            <ScrollAnimation animation="fade-in" delay={0.3}>
                                <h1 className="text-4xl md:text-[3.5rem] font-medium tracking-tight text-stone-900 leading-[1.1] mb-8">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-stone-200 align-middle mr-3 bg-stone-50 border-dashed">
                                        <span className="material-symbols-outlined text-xl text-stone-900">control_camera</span>
                                    </span>
                                    Compassionate <br className="hidden md:block" />
                                    home care you can trust
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-stone-200 align-middle ml-3 bg-stone-50">
                                        <span className="w-1.5 h-1.5 bg-stone-300 rounded-full mr-1"></span>
                                        <span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span>
                                        <span className="w-1.5 h-1.5 bg-stone-300 rounded-full ml-1"></span>
                                    </span>
                                </h1>
                            </ScrollAnimation>

                            <ScrollAnimation animation="slide-right" delay={0.5}>
                                <div className="flex flex-col sm:flex-row items-center gap-5">
                                    <button
                                        onClick={() => navigate('/family/services')}
                                        className="bg-[#5fa5ba] text-white pl-6 pr-1.5 py-1.5 rounded-full font-bold text-xs hover:bg-[#4d8ca0] transition-colors flex items-center gap-4 group shadow-lg shadow-[#5fa5ba]/20"
                                    >
                                        Explore our services
                                        <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                            <span className="material-symbols-outlined text-[14px] text-white">bubble_chart</span>
                                        </span>
                                    </button>
                                    <p className="text-stone-400 text-xs max-w-xs font-medium leading-relaxed">
                                        We provide compassionate, reliable home care services to help families care for their loved ones with confidence.
                                    </p>
                                </div>
                            </ScrollAnimation>
                        </div>
                    </div>

                    {/* Right Side Cards */}
                    <div className="col-span-12 xl:col-span-3 flex flex-col gap-4 items-end -mt-20 relative z-20 px-4 xl:px-0">
                        {/* Contact Card */}
                        <ScrollAnimation animation="slide-left" delay={0.6}>
                            <div className="bg-white p-3 rounded-[1.5rem] shadow-xl w-44 border border-stone-100 hover:scale-105 transition-transform duration-300">
                                <div className="rounded-[1.2rem] overflow-hidden mb-3 aspect-square relative group cursor-pointer bg-stone-50">
                                    <img src="/images/contact.jpg" className="w-full h-full object-cover" alt="Contact" />
                                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                                        <span className="bg-white/90 px-3 py-1 rounded-full text-[8px] font-bold shadow-sm backdrop-blur text-stone-600">Contact us</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] text-stone-500 font-bold leading-tight w-20">We are always glad to collaborate</p>
                                    <button className="w-6 h-6 bg-stone-50 rounded-full flex items-center justify-center hover:bg-stone-100 border border-stone-100">
                                        <span className="material-symbols-outlined text-[12px] text-stone-400">arrow_outward</span>
                                    </button>
                                </div>
                            </div>
                        </ScrollAnimation>

                        {/* Subscribe Card */}
                        <ScrollAnimation animation="slide-left" delay={0.7}>
                            <div className="bg-[#85c2d3] p-5 rounded-[1.8rem] w-44 relative overflow-hidden group hover:shadow-lg transition-shadow text-white">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                    <div className="bg-white p-3 rounded-t-[1rem] rounded-bl-[1rem] w-32 shadow-sm text-stone-800 mb-2">
                                        <p className="font-bold text-[10px] leading-tight">Subscribe to our news & updates</p>
                                    </div>
                                    <div>
                                        <button className="bg-white text-[#5fa5ba] text-[10px] font-bold px-5 py-2.5 rounded-full shadow-sm hover:bg-stone-50 transition-colors">Subscribe</button>
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute bottom-3 right-3 flex gap-1">
                                    <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                                    <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                                    <span className="material-symbols-outlined text-[10px] text-white/50 absolute bottom-0 right-0">pill</span>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>

                </div>
            </section>

            {/* 2. Stats/Tags Strip */}
            <section className="px-6 mb-20 hidden md:block">
                <ScrollAnimation animation="fade-up" delay={0.2} viewport={{ once: true }}>
                    <div className="flex flex-wrap justify-between items-center gap-4 py-8 border-t border-b border-stone-100 max-w-[1400px] mx-auto">
                        <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-stone-200 bg-stone-50/50">
                            <span className="font-bold text-stone-900 text-sm">98+</span>
                            <span className="text-stone-500 text-sm">Care Visits Completed</span>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-stone-200 bg-stone-50/50">
                                <span className="material-symbols-outlined text-sm">person</span>
                                <span className="text-stone-500 text-sm">Certified & Background-Checked Caregivers</span>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-stone-200 bg-stone-50/50">
                                <span className="material-symbols-outlined text-sm">science</span>
                                <span className="text-stone-500 text-sm">Medical-grade Home Care</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-stone-200 bg-stone-50/50">
                            <span className="font-bold text-stone-900 text-sm">1.500k+</span>
                            <span className="text-stone-500 text-sm">Families Supported</span>
                        </div>
                    </div>
                </ScrollAnimation>
            </section>

            {/* 3. Explore Bento Grid */}
            <section className="px-6 mb-24 max-w-[1200px] mx-auto">
                <div className="text-center mb-12">
                    <ScrollAnimation animation="fade-up">
                        <h2 className="text-4xl font-medium text-stone-900 mb-6">Explore our care <br />services and expertise</h2>
                        <button
                            onClick={() => navigate('/family/services')}
                            className="px-8 py-2.5 rounded-full border border-[#5fa5ba] text-sm font-bold text-[#5fa5ba] hover:bg-[#5fa5ba] hover:text-white transition-colors"
                        >
                            Explore now
                        </button>
                    </ScrollAnimation>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
                    {/* Item 1 */}
                    <div className="md:col-span-1">
                        <ScrollAnimation animation="fade-up" delay={0.1} className="h-full">
                            <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-[#E0F2F1] hover:shadow-xl transition-all border border-transparent hover:border-[#B2EBF2] group cursor-pointer h-full">
                                <span className="material-symbols-outlined text-4xl text-stone-400 group-hover:text-[#5fa5ba] mb-4 transition-colors">ecg_heart</span>
                                <span className="font-bold text-stone-600 group-hover:text-[#00695C]">Caregivers</span>
                            </div>
                        </ScrollAnimation>
                    </div>
                    {/* Item 2 - Large */}
                    <div className="md:col-span-2">
                        <ScrollAnimation animation="fade-up" delay={0.2} className="h-full">
                            <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-stone-100 group cursor-pointer relative overflow-hidden h-full">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-stone-100/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="material-symbols-outlined text-6xl text-stone-900 mb-4 rotate-45 group-hover:rotate-0 transition-transform duration-500">pill</span>
                                <span className="text-2xl font-medium text-stone-900">Home Medical Support</span>
                            </div>
                        </ScrollAnimation>
                    </div>
                    {/* Item 3 */}
                    <div className="md:col-span-1">
                        <ScrollAnimation animation="fade-up" delay={0.3} className="h-full">
                            <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-stone-100 group cursor-pointer h-full">
                                <span className="material-symbols-outlined text-4xl text-stone-400 group-hover:text-primary mb-4 transition-colors">stethoscope</span>
                                <span className="font-bold text-stone-600 group-hover:text-stone-900">Medical Equipment at Home</span>
                            </div>
                        </ScrollAnimation>
                    </div>
                    {/* Item 4 */}
                    <div className="md:col-span-1">
                        <ScrollAnimation animation="fade-up" delay={0.4} className="h-full">
                            <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-stone-100 group cursor-pointer h-full">
                                <span className="material-symbols-outlined text-4xl text-stone-400 group-hover:text-primary mb-4 transition-colors animate-spin-slow">settings</span>
                                <span className="font-bold text-stone-600 mt-2 text-xs uppercase tracking-widest">In-Home Health Support</span>
                            </div>
                        </ScrollAnimation>
                    </div>
                    {/* Item 5 - Description */}
                    <div className="md:col-span-1 flex items-center justify-center p-4">
                        <ScrollAnimation animation="fade-in" delay={0.5}>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                                <p className="text-[10px] text-stone-400 leading-tight w-24">
                                    HomeCare provides trusted home care services that support families in maintaining health and well-being.
                                </p>
                            </div>
                        </ScrollAnimation>
                    </div>
                    {/* Item 6 */}
                    <div className="md:col-span-2">
                        <ScrollAnimation animation="fade-up" delay={0.6} className="h-full">
                            <div className="bg-stone-50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-stone-100 group cursor-pointer h-full">
                                <span className="material-symbols-outlined text-4xl text-stone-400 group-hover:text-primary mb-4 transition-colors">vaccines</span>
                                <span className="font-bold text-stone-600 group-hover:text-stone-900">Vaccination Support at Home</span>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* 4. Awards & Recognition */}
            <section className="px-6 mb-20 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="md:w-1/2">
                        <ScrollAnimation animation="slide-right">
                            <h2 className="text-3xl font-medium text-stone-900">Trusted by Families &<br /> Recognized for Care Excellence</h2>
                        </ScrollAnimation>
                    </div>
                    <div className="md:w-1/2 flex justify-end">
                        <ScrollAnimation animation="slide-left" delay={0.2}>
                            <p className="text-sm text-stone-500 max-w-xs text-right mt-4 md:mt-0">
                                We are proud to be recognized for delivering compassionate, reliable, and high-quality care directly in the comfort of patients’ homes.
                            </p>
                        </ScrollAnimation>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Left */}
                    <ScrollAnimation animation="scale-up" duration={0.8}>
                        <div className="rounded-[3rem] overflow-hidden h-[300px] md:h-[400px] relative">
                            <img src="/images/homecare.jpg" alt="Awards" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute top-6 right-6 flex gap-2">
                                <span className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm">call</span>
                                </span>
                                <span className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm">add</span>
                                </span>
                            </div>
                            <button className="absolute bottom-6 left-6 px-6 py-2 bg-white rounded-full text-stone-900 text-sm font-bold flex items-center gap-2 hover:bg-stone-100">
                                Learn More
                                <span className="flex">
                                    <span className="w-2 h-2 border border-stone-400 rounded-full"></span>
                                    <span className="w-2 h-2 border border-stone-400 rounded-full ml-[-3px]"></span>
                                </span>
                            </button>
                        </div>
                    </ScrollAnimation>

                    {/* List Right */}
                    <div className="flex flex-col gap-4 justify-center">
                        {[
                            { title: "Trusted by 1,000+ Families", subtitle: "Families rely on us for safe, compassionate, and professional home care." },
                            { title: "Certified & Background-Checked Caregivers", subtitle: null },
                            { title: "Awarded Best Home Care Service 2025", subtitle: "Recognized for our commitment to quality, reliability, and patient-centered care." }
                        ].map((award, i) => (
                            <ScrollAnimation key={i} animation="slide-left" delay={0.3 + i * 0.1}>
                                <div className="group p-6 rounded-[2rem] border border-stone-200 bg-stone-50/30 hover:bg-white hover:shadow-lg transition-all cursor-pointer flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-stone-900 text-lg group-hover:text-primary transition-colors">{award.title}</h3>
                                        {award.subtitle && <p className="text-sm text-stone-500 mt-2 max-w-sm">{award.subtitle}</p>}
                                    </div>
                                    <span className="material-symbols-outlined text-stone-400 group-hover:text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">arrow_outward</span>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Welcome;
