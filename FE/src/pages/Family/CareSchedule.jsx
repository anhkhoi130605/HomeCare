import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { scheduleApi, familyApi } from "@/lib/api";
import { formatTimeSpan } from "@/lib/utils";
import ScrollAnimation from "@/components/ui/scroll-animation";

const CareSchedule = () => {
  const [view, setView] = useState("Monthly");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);

        const patients = await familyApi.getPatients();

        const allSchedules = [];

        for (const patient of patients) {
          try {
            const patientSchedules = await scheduleApi.getByPatient(
              patient.id
            );

            allSchedules.push(
              ...patientSchedules.map((s) => ({
                ...s,
                patientName: patient.fullName,
              }))
            );
          } catch {
            console.warn(`Failed to fetch schedules for patient ${patient.id}`);
          }
        }

        setSchedules(allSchedules);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const upcomingVisits = schedules
    .filter(
      (s) =>
        s.status !== "Completed" &&
        new Date(s.date) >= new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextVisit = upcomingVisits[0];

  const getEventsForDay = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return schedules
      .filter((s) => {
        const d = new Date(s.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day
        );
      })
      .map((s) => ({
        id: s.id,
        name: s.serviceName || "Care Visit",
        time: s.startTime ? formatTimeSpan(s.startTime) : "09:00 AM",
        patient: s.patientName,
        status: s.status,
      }));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevDays = Array.from(
    { length: firstDay },
    (_, i) => prevMonthDays - firstDay + i + 1
  );

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const goPrev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goNext = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (loading)
    return (
      <div className="p-10 text-center text-stone-500">Loading schedule...</div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500">Error: {error}</div>
    );

  return (
    <div className="space-y-8 pb-12 pt-4 font-['Public_Sans']">

      {/* HEADER */}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Care Schedule</h1>
          <p className="text-stone-500 text-sm">
            Manage appointments and caregiver visits.
          </p>
        </div>

        <div className="flex gap-2">
          {["Monthly", "Weekly", "List"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-full text-xs font-bold ${
                view === v
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR */}

      <ScrollAnimation animation="fade-up">
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">

          {/* Month header */}

          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              {monthNames[month]} {year}
            </h2>

            <div className="flex gap-2">
              <button onClick={goPrev}>◀</button>
              <button onClick={goNext}>▶</button>
            </div>
          </div>

          {/* week days */}

          <div className="grid grid-cols-7 bg-stone-50 border-b">
            {weekDays.map((d) => (
              <div
                key={d}
                className="py-3 text-center text-xs font-bold text-stone-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Monthly */}

          {view === "Monthly" && (
            <div className="grid grid-cols-7 gap-px bg-stone-200">

              {prevDays.map((d) => (
                <div key={"p" + d} className="bg-stone-50 h-32" />
              ))}

              {days.map((day) => {
                const events = getEventsForDay(day);

                return (
                  <div
                    key={day}
                    className="bg-white min-h-[120px] p-2 flex flex-col gap-1"
                  >
                    <div className="font-bold text-sm">{day}</div>

                    {events.map((e) => (
                      <Link
                        key={e.id}
                        to={`/family/schedule/detail/${e.id}`}
                        className="text-xs bg-blue-50 border border-blue-200 rounded p-1"
                      >
                        {e.time} • {e.name}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Weekly */}

          {view === "Weekly" && (
            <div className="p-6 space-y-4">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i);

                const events = schedules.filter(
                  (s) =>
                    new Date(s.date).toDateString() === date.toDateString()
                );

                return (
                  <div key={i} className="border rounded-xl p-4">
                    <div className="font-bold">
                      {date.toLocaleDateString()}
                    </div>

                    {events.map((e) => (
                      <Link
                        key={e.id}
                        to={`/family/schedule/detail/${e.id}`}
                        className="block text-sm text-blue-600"
                      >
                        {e.serviceName}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* List */}

          {view === "List" && (
            <div className="p-6 divide-y">
              {schedules
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((s) => (
                  <Link
                    key={s.id}
                    to={`/family/schedule/detail/${s.id}`}
                    className="flex justify-between py-4"
                  >
                    <div>
                      <div className="font-bold">
                        {s.serviceName || "Care Visit"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {s.patientName}
                      </div>
                    </div>

                    <div className="text-sm text-stone-500">
                      {new Date(s.date).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </ScrollAnimation>

      {/* Upcoming */}

      {nextVisit && (
        <div className="bg-white border rounded-2xl p-6 flex justify-between">
          <div>
            <div className="font-bold">Upcoming Visit</div>
            <div className="text-sm text-stone-500">
              {new Date(nextVisit.date).toLocaleDateString()} •{" "}
              {nextVisit.startTime}
            </div>
          </div>

          <Link
            to={`/family/schedule/detail/${nextVisit.id}`}
            className="px-4 py-2 bg-stone-900 text-white rounded-full text-sm"
          >
            View
          </Link>
        </div>
      )}
    </div>
  );
};

export default CareSchedule;