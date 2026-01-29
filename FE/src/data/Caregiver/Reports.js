// Thêm vào file data.js
export const REPORTS_METRICS = {
    weeklyActivity: [
        { day: 'Mon', hours: 7.5, target: 8 },
        { day: 'Tue', hours: 6.2, target: 8 },
        { day: 'Wed', hours: 8.4, target: 8 },
        { day: 'Thu', hours: 3.5, target: 8 },
        { day: 'Fri', hours: 7.0, target: 8 },
        { day: 'Sat', hours: 1.2, target: 0 },
        { day: 'Sun', hours: 0.8, target: 0 }
    ],
    stats: [
        { label: 'Total Hours Worked', val: '164.5', unit: 'hrs', pct: '+12%', color: 'text-primary-600', bg: 'bg-primary-50', icon: 'schedule' },
        { label: 'On-time Check-in Rate', val: '98.2', unit: '%', pct: '+3%', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'timer' },
        { label: 'Patient Satisfaction', val: '4.9', unit: '/ 5.0', pct: 'No change', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'star' }
    ],
    testimonials: [
        { quote: "Sarah is always on time and very attentive to my father's needs.", from: "Family of Arthur M.", rating: 5, primary: true },
        { quote: "Very skilled with the medication administration.", from: "James W.", rating: 5, primary: false },
        { quote: "Compassionate and always has a smile.", from: "Mrs. Thompson", rating: 4, primary: false }
    ]
};