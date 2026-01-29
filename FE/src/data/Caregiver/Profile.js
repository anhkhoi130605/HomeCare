// Thêm vào file data.js
export const PROFILE_DATA = {
    personalInfo: [
        { label: 'Full Name', val: 'Sarah Miller' },
        { label: 'Email Address', val: 'sarah.miller@careflow.com' },
        { label: 'Phone Number', val: '(555) 123-4567' },
        { label: 'Home Address', val: '742 Evergreen Terrace, Springfield, IL' }
    ],
    certifications: [
        { title: 'Registered Nurse (RN)', id: '#RN-8829-10', exp: 'Expires: Dec 2025', icon: 'badge', color: 'emerald' },
        { title: 'BLS Certification', id: 'ID: BLS-10293-A', exp: 'Renewal Due: Sep 2024', icon: 'health_metrics', color: 'amber' }
    ],
    availability: [
        { day: 'Mon', time: '8am - 4pm', status: 'work' },
        { day: 'Tue', time: '8am - 4pm', status: 'work' },
        { day: 'Wed', time: '8am - 4pm', status: 'work' },
        { day: 'Thu', time: '8am - 4pm', status: 'work' },
        { day: 'Fri', time: '8am - 4pm', status: 'work' },
        { day: 'Sat', time: 'Off', status: 'off' },
        { day: 'Sun', time: 'Off', status: 'off' }
    ],
    serviceTypes: ['Post-Op Support', 'Dementia Care', 'Medication Admin'],
    travelDistance: 15
};