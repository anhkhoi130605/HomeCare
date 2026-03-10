import { FAMILY_MEMBERS } from '../Family/patients';

export const CAREGIVER_INFO = {
    name: "Sarah Jenkins",
    role: "Senior Caregiver",
    profileImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe28WHyO9uNC9249sIJlRbtn1rchJfUUnwMnpRtlUgwsHzON8cBlhXLilmMIGRpf1xDnX980DVub-GLz0qbY0seLRO0FCXshaR7WOK6qJqF2hOT4U35GubxklqawPlAB5kLq6SoFLkmsqzg1ogdLfu1AqZGXer2brhExgBXOlZc0MfwtvV-ctd8KxUbhDmo-vlV0OVDaPPwvv7fNxcDxV6GOjmqxl_pzAULoENZFqE-W8JeXhaIg_m2O4qIb0J4jcVGydA9uRwpR8a"
};

export const CARE_LOGS_HISTORY = [
    {
        id: 1,
        date: 'May 24, 2024',
        patientName: FAMILY_MEMBERS[2].name,
        patientImage: FAMILY_MEMBERS[2].image,
        time: '09:00 AM - 01:00 PM',
        status: 'Submitted',
        initials: 'ET',
        color: 'bg-teal-100 text-teal-600'
    },
    {
        id: 2,
        date: 'May 23, 2024',
        patientName: FAMILY_MEMBERS[1].name,
        patientImage: FAMILY_MEMBERS[1].image,
        time: '02:30 PM - 05:30 PM',
        status: 'Submitted',
        initials: 'JW',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 3,
        date: 'May 23, 2024',
        patientName: 'Arthur Morgan',
        patientImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3000&auto=format&fit=crop',
        time: '09:30 AM - 12:30 PM',
        status: 'Submitted',
        initials: 'AM',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 4,
        date: 'May 22, 2024',
        patientName: 'Maria Rodriguez',
        patientImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3088&auto=format&fit=crop',
        time: '05:00 PM - 09:00 PM',
        status: 'Draft',
        initials: 'MR',
        color: 'bg-rose-100 text-rose-600'
    },
    {
        id: 5,
        date: 'May 21, 2024',
        patientName: 'Samuel L. Jackson',
        patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3387&auto=format&fit=crop',
        time: '10:15 AM - 02:15 PM',
        status: 'Submitted',
        initials: 'SJ',
        color: 'bg-slate-100 text-slate-600'
    }
];

// Deprecated: Use FAMILY_MEMBERS directly in components
export const PATIENT_DATA = FAMILY_MEMBERS[2]; // Default to Eleanor for backward compat

export const MEDICATION_LIST = [
    { name: "Lisinopril", dosage: "10mg - Take with food", time: "09:00 AM", opacity: "" },
    { name: "Metformin", dosage: "500mg - With breakfast", time: "09:00 AM", opacity: "opacity-60" },
    { name: "Atorvastatin", dosage: "20mg - Before bed", time: "09:00 PM", opacity: "opacity-60" },
    { name: "Vitamin D", dosage: "1000 IU - Any time", time: "12:00 PM", opacity: "" }
];

export const CARE_PLAN_TASKS = [
    { id: 1, title: "Morning Hygiene Assistance", desc: "Help with brushing teeth and face wash", time: "09:30 AM" },
    { id: 2, title: "Physical Therapy Exercises", desc: "Leg stretches and short walk", time: "11:00 AM" },
    { id: 3, title: "Prepare Lunch", desc: "Low sodium meal preparation", time: "12:30 PM" }
];

export const EMERGENCY_CONTACT = {
    name: "Robert Thompson",
    role: "Son",
    phone: "(555) 123-4567",
    allergies: "Penicillin, Peanuts"
};
