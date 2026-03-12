import React, { useState, useRef, useEffect } from 'react';
import { familyApi } from '@/lib/api';
import { toast } from 'sonner';
import MapPicker from '@/components/shared/MapPicker';

const AddMemberModal = ({ isOpen, onClose, onPatientAdded }) => {
    const [loading, setLoading] = useState(false);
    
    // States cho tính năng gợi ý địa chỉ
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const searchTimeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        relation: '',
        gender: '',
        medicalHistory: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: ''
    });

    // Ẩn dropdown gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Hàm xử lý gõ tìm kiếm và CHỈ LỌC Đà Nẵng, Quảng Nam
    const handleAddressChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, address: value }));

        if (value.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingAddress(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=vn&limit=10`
                );
                const data = await response.json();
                
                // LỌC KẾT QUẢ: Chỉ lấy các địa chỉ thuộc Đà Nẵng và Quảng Nam (bất kể có dấu hay không dấu)
                const validLocations = data.filter(item => {
                    const addressLower = item.display_name.toLowerCase();
                    return addressLower.includes('đà nẵng') || 
                           addressLower.includes('da nang') || 
                           addressLower.includes('quảng nam') || 
                           addressLower.includes('quang nam');
                });

                setSuggestions(validLocations.slice(0, 5)); // Lấy tối đa 5 kết quả tốt nhất
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
            } finally {
                setIsSearchingAddress(false);
            }
        }, 500);
    };

    const handleSelectSuggestion = (suggestion) => {
        setFormData(prev => ({ ...prev, address: suggestion.display_name }));
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Hàm nhận địa chỉ từ bản đồ & KIỂM TRA KHU VỰC
    const handleMapSelect = (mapAddress) => {
        if (!mapAddress) return;
        
        const addressLower = mapAddress.toLowerCase();
        const isValidLocation = addressLower.includes('đà nẵng') || 
                                addressLower.includes('da nang') || 
                                addressLower.includes('quảng nam') || 
                                addressLower.includes('quang nam');

        if (isValidLocation) {
            setFormData(prev => ({ ...prev, address: mapAddress }));
            setShowSuggestions(false);
        } else {
            // Hiển thị thông báo nếu kéo bản đồ ra ngoài khu vực cho phép
            toast.error('Khu vực không hỗ trợ. Vui lòng chỉ chọn địa chỉ tại Đà Nẵng hoặc Quảng Nam!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.dateOfBirth) {
            toast.error('Please fill in required fields');
            return;
        }

        // Kiểm tra an toàn lần cuối trước khi submit
        const addressLower = formData.address.toLowerCase();
        const isValidLocation = addressLower === '' || // Cho phép rỗng nếu bạn không bắt buộc nhập địa chỉ
                                addressLower.includes('đà nẵng') || 
                                addressLower.includes('da nang') || 
                                addressLower.includes('quảng nam') || 
                                addressLower.includes('quang nam');

        if (!isValidLocation) {
            toast.error('Địa chỉ chăm sóc phải nằm trong khu vực Đà Nẵng hoặc Quảng Nam!');
            return;
        }

        try {
            setLoading(true);
            await familyApi.addPatient({
                fullName: formData.fullName,
                dateOfBirth: formData.dateOfBirth,
                relation: formData.relation || undefined,
                gender: formData.gender || undefined,
                medicalHistory: formData.medicalHistory || undefined,
                address: formData.address || undefined,
                emergencyContact: formData.emergencyContact || undefined,
                emergencyPhone: formData.emergencyPhone || undefined
            });

            toast.success('Patient added successfully!');
            setFormData({
                fullName: '', dateOfBirth: '', relation: '', gender: '', 
                medicalHistory: '', address: '', emergencyContact: '', emergencyPhone: ''
            });

            if (onPatientAdded) onPatientAdded();
            else onClose();
            
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
                                    id="fullName" placeholder="Enter patient's name" type="text"
                                    value={formData.fullName} onChange={handleChange} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="dateOfBirth">
                                    Date of Birth <span className="text-red-400">*</span>
                                </label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium text-stone-500"
                                    id="dateOfBirth" type="date"
                                    value={formData.dateOfBirth} onChange={handleChange} required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="relation">Relationship</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 transition-all outline-none font-medium appearance-none"
                                        id="relation" value={formData.relation} onChange={handleChange}
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
                                        id="gender" value={formData.gender} onChange={handleChange}
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

                        {/* --- KHU VỰC ĐỊA CHỈ: AUTOCOMPLETE & BẢN ĐỒ --- */}
                        <div className="space-y-2 relative" ref={wrapperRef}>
                            <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="address">
                                📍 Primary Care Address
                            </label>
                            
                            <div className="relative z-20">
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all outline-none font-medium mb-2"
                                    id="address"
                                    placeholder="Tìm địa chỉ tại Đà Nẵng, Quảng Nam..."
                                    type="text"
                                    value={formData.address}
                                    onChange={handleAddressChange}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowSuggestions(true);
                                    }}
                                    autoComplete="off"
                                />
                                
                                {isSearchingAddress && (
                                    <span className="material-symbols-outlined animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-[#5fa5ba]">
                                        progress_activity
                                    </span>
                                )}

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-[#99C5D3]/20 max-h-60 overflow-y-auto z-[70] py-2">
                                        {suggestions.map((item) => (
                                            <li
                                                key={item.place_id}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="px-6 py-3 hover:bg-[#F0F8FF] cursor-pointer text-sm text-stone-700 transition-colors flex items-start gap-3 border-b border-stone-50 last:border-0"
                                            >
                                                <span className="material-symbols-outlined text-stone-400 text-lg mt-0.5">location_on</span>
                                                <span className="leading-relaxed">{item.display_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="z-10 relative mt-2">
                                <MapPicker onAddressSelect={handleMapSelect} />
                            </div>
                        </div>
                        {/* --- KẾT THÚC KHU VỰC ĐỊA CHỈ --- */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="emergencyContact">Emergency Contact</label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all outline-none font-medium"
                                    id="emergencyContact" placeholder="Name of contact" type="text"
                                    value={formData.emergencyContact} onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="emergencyPhone">Emergency Phone</label>
                                <input
                                    className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-2xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all outline-none font-medium"
                                    id="emergencyPhone" placeholder="Phone number" type="tel"
                                    value={formData.emergencyPhone} onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 ml-1 uppercase tracking-wider" htmlFor="medicalHistory">Medical Summary & Notes</label>
                            <textarea
                                className="w-full px-6 py-4 bg-[#F8FAFC] border border-stone-100 rounded-3xl focus:ring-2 focus:ring-[#99C5D3] focus:border-[#5fa5ba] text-stone-800 placeholder:text-stone-300 transition-all resize-none outline-none font-medium"
                                id="medicalHistory" placeholder="Describe chronic conditions, allergies, or regular medications..."
                                rows="4" value={formData.medicalHistory} onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 pb-2">
                            <button
                                className="w-full bg-[#5fa5ba] text-white py-4 rounded-full font-bold text-lg hover:bg-[#4d8ca0] transition-all shadow-xl shadow-[#5fa5ba]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit" disabled={loading}
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
                                type="button" disabled={loading}
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