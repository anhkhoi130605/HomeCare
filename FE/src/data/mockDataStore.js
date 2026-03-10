// This acts as a runtime "database" to demonstrate the flow between Caregiver and Family
// In a real app, this would be replaced by API calls to a backend

export const STATIC_CAREGIVER = {
    id: "cg-1",
    name: "Sarah Jenkins",
    role: "Certified Nursing Assistant",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe28WHyO9uNC9249sIJlRbtn1rchJfUUnwMnpRtlUgwsHzON8cBlhXLilmMIGRpf1xDnX980DVub-GLz0qbY0seLRO0FCXshaR7WOK6qJqF2hOT4U35GubxklqawPlAB5kLq6SoFLkmsqzg1ogdLfu1AqZGXer2brhExgBXOlZc0MfwtvV-ctd8KxUbhDmo-vlV0OVDaPPwvv7fNxcDxV6GOjmqxl_pzAULoENZFqE-W8JeXhaIg_m2O4qIb0J4jcVGydA9uRwpR8a"
};

let careLogs = [
    {
        id: "log-initial-1",
        date: "Oct 24, 2023",
        timeRange: "08:00 AM - 04:00 PM",
        duration: "08h 00m",
        caregiver: STATIC_CAREGIVER,
        vitals: {
            heartRate: "72",
            temperature: "98.6",
            bloodPressure: "118/78"
        },
        medications: [
            { name: "Lisinopril", desc: "10mg - Once daily (AM)", time: "09:00 AM" },
            { name: "Metformin", desc: "500mg - Twice daily", time: "12:30 PM" }
        ],
        nutrition: {
            meal: "Oatmeal with berries for breakfast. Grilled chicken salad for lunch.",
            hydration: "1.8L"
        },
        notes: "John was very talkative today and enjoyed the short walk in the garden. Vitals are steady."
    },
    {
        id: "log-initial-2",
        date: "Oct 23, 2023",
        timeRange: "08:00 AM - 04:00 PM",
        duration: "08h 00m",
        caregiver: STATIC_CAREGIVER,
        vitals: {
            heartRate: "75",
            temperature: "98.4",
            bloodPressure: "120/80"
        },
        medications: [
            { name: "Lisinopril", desc: "10mg - Once daily (AM)", time: "09:00 AM" }
        ],
        nutrition: {
            meal: "Toast and eggs. Soup for lunch.",
            hydration: "1.5L"
        },
        notes: "Rested well in the afternoon. Mentioned he's looking forward to his family visit this weekend."
    }
];

export const getCareLogs = () => [...careLogs];

export const getCareLogById = (id) => {
    return careLogs.find(log => log.id.toString() === id.toString());
};

export const addCareLog = (newLog) => {
    // Generate a simple ID
    const logWithId = {
        ...newLog,
        id: `log-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        caregiver: STATIC_CAREGIVER // Force the current caregiver
    };
    careLogs = [logWithId, ...careLogs];
    return logWithId;
};
