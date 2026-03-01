import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careRequestApi, paymentApi } from '@/lib/api';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { toast } from 'sonner';

const PaymentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('MoMo');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await careRequestApi.getById(id);
                setRequest(data);
            } catch (error) {
                console.error("Failed to fetch request:", error);
                toast.error("Failed to load request details");
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [id]);

    const handlePayment = async () => {
        try {
            setProcessing(true);

            // In a real app, logic for payment gateway (VNPay/MoMo) goes here.
            // Simplified Step 6: Backend updates status to "Paid"
            // We call updateStatus to simulate/trigger this update.
            await careRequestApi.updateStatus(id, { status: "Paid" });

            toast.success(`Payment Successful! Your request is now Paid.`);

            // Step 7: Redirect to Request list
            setTimeout(() => {
                navigate('/family/requests');
            }, 1500);
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-[60vh] text-stone-400 font-bold">Loading payment details...</div>;
    if (!request) return <div className="flex items-center justify-center h-[60vh] text-red-400 font-bold">Request not found.</div>;

    const amount = request.totalAmount || request.total_amount || 0;
    const sName = request.serviceName || request.service?.name || "Care Service";
    const pName = request.patientName || request.patient?.fullName || "Family Member";
    const rDate = request.requestedDate || request.date;
    const sTime = request.startTime || request.start_time;
    const durationArr = request.duration || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-4 font-['Public_Sans'] animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate('/family/services')} className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#5fa5ba] transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <ScrollAnimation animation="fade-up">
                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-8">
                            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full bg-[#5fa5ba]/10 text-[#5fa5ba] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">description</span>
                                </span>
                                Request Summary
                            </h2>

                            <div className="grid grid-cols-2 gap-y-8 gap-x-6 pt-2">
                                <div>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-2">Service Package</p>
                                    <p className="font-bold text-lg text-stone-800">{sName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-2">Patient</p>
                                    <p className="font-bold text-lg text-stone-800">{pName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-2">Date & Start Time</p>
                                    <p className="font-bold text-lg text-stone-800">
                                        {rDate ? new Date(rDate).toLocaleDateString('vi-VN') : 'N/A'} at {sTime || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-2">Duration</p>
                                    <p className="font-bold text-lg text-stone-800">{durationArr} Hours</p>
                                </div>
                            </div>

                            {request.notes || request.special_note ? (
                                <div className="pt-8 border-t border-stone-50">
                                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-3">Special Instructions</p>
                                    <div className="bg-stone-50 p-6 rounded-2xl text-stone-600 font-medium italic border border-stone-100">
                                        "{request.notes || request.special_note}"
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation animation="fade-up" delay={0.1}>
                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 space-y-6">
                            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#5fa5ba]">payments</span>
                                Payment Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden peer"
                                        checked={paymentMethod === 'MoMo'}
                                        onChange={() => setPaymentMethod('MoMo')}
                                    />
                                    <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent bg-stone-50 peer-checked:border-[#A50064] peer-checked:bg-[#A50064]/5 transition-all hover:bg-stone-100">
                                        <div className="size-10 rounded-xl bg-[#A50064] flex items-center justify-center shrink-0 shadow-sm">
                                            <span className="material-symbols-outlined text-white">wallet</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold text-stone-800 group-peer-checked:text-[#A50064]">MoMo E-Wallet</span>
                                            <span className="text-xs text-stone-400 font-bold">Fast & Secure</span>
                                        </div>
                                    </div>
                                </label>

                                <label className="cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden peer"
                                        checked={paymentMethod === 'BankQR'}
                                        onChange={() => setPaymentMethod('BankQR')}
                                    />
                                    <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-transparent bg-stone-50 peer-checked:border-[#5fa5ba] peer-checked:bg-[#5fa5ba]/5 transition-all hover:bg-stone-100">
                                        <div className="size-10 rounded-xl bg-[#5fa5ba]/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[#5fa5ba]">qr_code_2</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold text-stone-800 group-peer-checked:text-[#5fa5ba]">Bank QR</span>
                                            <span className="text-xs text-stone-400 font-bold">Scan to Pay</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Right: Payment Sidebar */}
                <div className="lg:col-span-1">
                    <ScrollAnimation animation="fade-left">
                        <div className="bg-stone-900 rounded-[2rem] p-8 text-white sticky top-24 shadow-2xl">
                            <h3 className="text-lg font-bold mb-8 text-white/90">Order Summary</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-white/60 font-medium">
                                    <span>Base Rate</span>
                                    <span>{amount && durationArr ? `$${Math.round(amount / durationArr)} / hr` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-white/60 font-medium">
                                    <span>Duration</span>
                                    <span>{durationArr} hrs</span>
                                </div>
                                <div className="h-px bg-white/10 my-4"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold uppercase tracking-widest text-[#5fa5ba]">Total Amount</span>
                                    <span className="text-4xl font-black text-white">${amount}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-[#5fa5ba] hover:bg-[#4d8ca0] text-white font-black py-4 rounded-full shadow-xl shadow-[#5fa5ba]/20 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70"
                            >
                                {processing ? (
                                    <>
                                        <span className="animate-spin size-5 border-2 border-white/20 border-t-white rounded-full"></span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Pay Now</span>
                                        <span className="material-symbols-outlined">lock</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-center text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                Secure & Encrypted Payment
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;
