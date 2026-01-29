// Thêm vào file data.js
export const SCHEDULE_DATA = {
    currentMonth: "May 2024",
    selectedDate: "Friday, May 24",
    shifts: [
        { day: 2, title: "09:00 - Thompson", type: "standard" },
        { day: 6, title: "08:30 - Morgan", type: "standard" },
        {
            day: 24,
            events: [
                { time: "09:00", patient: "Thompson", type: "active" },
                { time: "14:30", patient: "Wilson", type: "standard" }
            ]
        }
    ]
};