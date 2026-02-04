import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScrollAnimation from "@/components/ui/scroll-animation";
import { paymentApi } from '@/lib/api';
import { toast } from 'sonner';

const FamilyPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await paymentApi.getMyPayments();
                setPayments(data || []);
            } catch (error) {
                console.error("Failed to fetch payments:", error);
                toast.error("Failed to load payment history");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();

        // Check for return status from VNPay
        const status = searchParams.get('status');
        const paymentId = searchParams.get('paymentId');

        if (status) {
            if (status === 'completed' || status === 'active') { // 'active' might be contract status, 'completed' is payment
                toast.success("Payment Successful! Contract is now Active.");
            } else if (status === 'failed' || status === 'error') {
                toast.error("Payment Failed or Cancelled.");
            } else {
                toast.info(`Payment Status: ${status}`);
            }

            // Clean up URL params without reloading
            setSearchParams({});
        }
    }, []);

    // Helper for Total Spent
    const totalSpent = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + p.amount, 0);

    const filteredPayments = payments.filter(p => {
        if (filter === 'All') return true;
        if (filter === 'Completed') return p.status === 'Completed';
        if (filter === 'Pending') return p.status === 'Pending';
        return true;
    });

    return (
        <div className="space-y-10 animate-fade-in-up pb-12 font-['Public_Sans']">
            {/* Blue Header Banner */}
            <ScrollAnimation animation="fade-in">
                <div className="bg-[#99C5D3] rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-[#99C5D3]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 relative z-10 w-full">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-widest text-white/90">Billing Center</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Payment History</h1>
                            <p className="text-white/80 font-medium text-lg">Manage invoices and track your expenses.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 flex gap-8 shadow-sm">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Total Spent</p>
                                <p className="text-3xl font-black text-white">${totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Pending</p>
                                <p className="text-3xl font-black text-[#5fa5ba] bg-white px-3 rounded-lg shadow-sm">${pendingAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimation>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-4">
                {['All', 'Completed', 'Pending'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all border ${filter === tab ? 'bg-[#5fa5ba] text-white border-[#5fa5ba] shadow-lg shadow-[#5fa5ba]/20' : 'bg-white text-stone-500 border-stone-200 hover:border-[#99C5D3] hover:text-[#5fa5ba]'}`}
                    >
                        {tab === 'All' ? 'All Transactions' : tab}
                    </button>
                ))}

                <div className="ml-auto relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">search</span>
                    <input className="pl-12 pr-6 py-3 bg-white border border-stone-200 rounded-full text-sm font-bold focus:ring-2 focus:ring-[#99C5D3] outline-none" placeholder="Search ID..." />
                </div>
            </div>

            {/* Transactions List */}
            {loading ? (
                <div className="text-center py-10 text-stone-400">Loading payments...</div>
            ) : filteredPayments.length === 0 ? (
                <div className="text-center py-10 text-stone-400 bg-white rounded-[2rem] border border-stone-100">No payment records found.</div>
            ) : (
                <div className="space-y-4">
                    {filteredPayments.map((item, idx) => {
                        const status = item.status; // 'Completed', 'Pending', 'Failed'

                        return (
                            <ScrollAnimation animation="fade-up" delay={idx * 0.05} key={item.id}>
                                <div className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6 group hover:-translate-y-0.5 ${status === 'Failed' ? 'border-red-100 ring-1 ring-red-50' : 'border-stone-100 hover:border-stone-300'
                                    }`}>
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-sm ${status === 'Completed' ? 'bg-[#E0F2F1] text-[#00695C]' :
                                            status === 'Failed' ? 'bg-red-50 text-red-600' :
                                                'bg-orange-50 text-orange-600'
                                        }`}>
                                        <span className="material-symbols-outlined font-bold">
                                            {status === 'Completed' ? 'check_circle' : status === 'Failed' ? 'error' : 'pending'}
                                        </span>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className={`font-black text-lg group-hover:text-stone-600 transition-colors ${status === 'Failed' ? 'text-red-700' : 'text-stone-900'}`}>
                                            {item.description || `Payment #${item.id}`}
                                        </h4>
                                        <div className="flex items-center justify-center md:justify-start gap-4 mt-1 text-sm font-medium text-stone-500">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                            <span>Method: <span className="font-bold text-stone-700">{item.method}</span></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start px-4 md:px-0">
                                        <div className="text-right">
                                            <p className="font-black text-xl text-stone-900">${item.amount.toLocaleString()}</p>
                                            <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${status === 'Completed' ? 'bg-white text-[#00695C] border-[#B2EBF2]' :
                                                    status === 'Failed' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' :
                                                        'bg-white text-orange-600 border-orange-200'
                                                }`}>
                                                {status}
                                            </span>
                                        </div>
                                        <button className="w-12 h-12 rounded-full border-2 border-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-900 hover:bg-stone-50 transition-all">
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FamilyPayment;
