// ThĂªm vĂ o file data.js
export const SCHEDULE_DATA = {
    currentMonth: "May 2024",
    selectedDate: "Friday, May 24",
    shifts: [
        { day: 2, title: "09:00 - Thompson", type: "completed" },
        { day: 6, title: "08:30 - Morgan", type: "completed" },
        {
            day: 24,
            events: [
                { time: "09:00", patient: "Martha Wilson", type: "active" },
                { time: "14:30", patient: "David Wilson", type: "standard" }
            ]
        }
    ]
};
