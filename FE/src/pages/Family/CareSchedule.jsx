import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scheduleApi, familyApi } from '@/lib/api';
import { formatTimeSpan, cn } from '@/lib/utils';
import ScrollAnimation from "@/components/ui/scroll-animation";

const CareSchedule = () => {
  const [view, setView] = useState('Monthly');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        // Get all patients first
        const patients = await familyApi.getPatients();

        // Fetch schedules for all patients
        const allSchedules = [];
        for (const patient of patients) {
          try {
            const patientSchedules = await scheduleApi.getByPatient(patient.id);
            allSchedules.push(...patientSchedules.map(s => ({
              ...s,
              patientName: patient.fullName
            })));
          } catch (e) {
            console.warn(`Failed to fetch schedules for patient ${patient.id}`);
          }
        }

        setSchedules(allSchedules);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const upcomingVisits = schedules
    .filter(s => s.status !== 'Completed' && new Date(s.date) >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextVisit = upcomingVisits[0];

  // Convert API schedules to calendar events
  const getEventsForDay = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const checkDate = new Date(year, month, day);

    return schedules.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    }).map(s => ({
      id: s.id,
      day: day,
      name: s.serviceName || s.service?.name || 'Care Visit',
      type: (s.serviceName || "").toLowerCase().includes('premium') ? 'PREMIUM' : 'BASIC',
      time: s.startTime ? formatTimeSpan(s.startTime) : '09:00 AM',
      patient: s.patientName || s.patient?.name,
      isDone: s.status === 'Completed',
      isToday: checkDate.toDateString() === new Date().toDateString()
    }));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const prevDays = Array.from({ length: firstDayOfMonth }, (_, i) => prevMonthDays - firstDayOfMonth + i + 1);

  const goToPrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse pb-12 pt-4 font-['Public_Sans']">
        <div className="bg-stone-200 rounded-2xl h-24"></div>
        <div className="bg-stone-200 rounded-[2rem] h-[600px]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-4">error</span>
        <p className="text-red-600 font-medium">Failed to load schedule</p>
        <p className="text-stone-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="font-['Public_Sans'] space-y-8 pb-12 pt-4 bg-transparent animate-fade-in-up">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#5fa5ba] text-2xl">calendar_month</span>
            <h1 className="text-3xl font-medium text-stone-900 tracking-tight">Care Schedule</h1>
          </div>
          <p className="text-stone-500 font-medium max-w-lg">Manage medical appointments, caregiver shifts, and family visits in one unified view.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-stone-200 rounded-full p-1 flex shadow-sm">
            {['Monthly', 'Weekly', 'List'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  view === v ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Link to="/family/booking" className="w-11 h-11 rounded-full bg-[#5fa5ba] text-white flex items-center justify-center shadow-lg hover:bg-[#4d8ca0] transition-transform hover:scale-105">
            <span className="material-symbols-outlined">add</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Surface */}
      <ScrollAnimation animation="fade-up">
        <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5fa5ba] to-teal-400"></div>

          {/* Nav Controls */}
          <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-stone-800">{monthNames[month]} {year}</h2>
              <div className="flex gap-1">
                <button onClick={goToPrevMonth} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-[#5fa5ba] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onClick={goToNextMonth} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 text-stone-500 hover:text-[#5fa5ba] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#5fa5ba]"></span> Medical
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Personal
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-stone-300"></span> Off
              </div>
            </div>
          </div>

          {/* Conditional Views */}
          {view === 'Monthly' && (
            <>
              <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80">
                {weekDays.map(d => (
                  <div key={d} className="py-3 text-center text-[10px] font-black text-stone-400 tracking-[0.2em]">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 bg-stone-200 gap-px border-b border-stone-200">
                {prevDays.map(day => (
                  <div key={`prev-${day}`} className="bg-white/50 min-h-[140px] p-3 relative text-stone-200">
                    <span className="text-sm font-bold">{day}</span>
                  </div>
                ))}

                {days.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                  return (
                    <div key={day} className={cn(
                      "bg-white min-h-[140px] p-3 transition-colors hover:bg-stone-50 group relative flex flex-col gap-2",
                      isToday ? 'bg-[#5fa5ba]/5' : ''
                    )}>
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all",
                          isToday ? 'bg-[#5fa5ba] text-white shadow-lg shadow-teal-100' : 'text-stone-700'
                        )}>{day}</span>
                        {isToday && <span className="text-[9px] font-black text-[#5fa5ba] bg-[#5fa5ba]/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Today</span>}
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[90px] custom-scrollbar px-0.5">
                        {dayEvents.map(event => (
                          <Link key={event.id} to={`/family/schedule/detail/${event.id}`}
                            className={cn(
                              "p-1.5 rounded-xl border transition-all hover:shadow-md",
                              event.isDone ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 opacity-60' :
                                event.type === 'PREMIUM' ? 'bg-[#5fa5ba]/5 border-[#5fa5ba]/20 text-[#00695C]' :
                                  'bg-orange-50/50 border-orange-100 text-orange-700'
                            )}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">{event.time}</span>
                              {event.isDone && <span className="material-symbols-outlined text-[12px] font-bold">check_circle</span>}
                            </div>
                            <p className="text-[10px] font-bold leading-none truncate">{event.name}</p>
                          </Link>
                        ))}
                      </div>

                      <Link to="/family/booking" className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#5fa5ba] hover:text-white shadow-sm z-20">
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === 'Weekly' && (
            <div className="p-8 space-y-6">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                const events = schedules.filter(s => new Date(s.date).toDateString() === date.toDateString());

                return (
                  <div key={i} className={cn(
                    "flex gap-6 p-6 rounded-[24px] border transition-all",
                    isToday ? "bg-[#5fa5ba]/5 border-[#5fa5ba]/20 shadow-sm" : "bg-white border-stone-100 hover:border-stone-200"
                  )}>
                    <div className="flex flex-col items-center justify-center w-20 shrink-0">
                      <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black", isToday ? "bg-[#5fa5ba] text-white shadow-lg shadow-teal-100" : "bg-stone-50 text-stone-900 border border-stone-100")}>{date.getDate()}</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {events.length > 0 ? (
                        events.map(e => (
                          <Link key={e.id} to={`/family/schedule/detail/${e.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-100 hover:border-[#5fa5ba]/40 transition-all hover:shadow-md group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#5fa5ba]/10 flex items-center justify-center text-[#5fa5ba]"><span className="material-symbols-outlined">schedule</span></div>
                              <div>
                                <h4 className="font-bold text-stone-900 tracking-tight">{e.serviceName}</h4>
                                <p className="text-xs text-stone-400 font-medium">With {e.caregiverName || 'Assigned Caregiver'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-sm font-black text-stone-900 leading-none">{formatTimeSpan(e.startTime)}</p>
                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Start Time</p>
                              </div>
                              <span className="material-symbols-outlined text-stone-300 group-hover:text-[#5fa5ba] transition-colors">chevron_right</span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="h-full flex items-center text-stone-300 text-sm font-medium italic py-2">No visits scheduled for this day</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'List' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 tracking-widest uppercase">Service & Patient</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 tracking-widest uppercase">Date & Time</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 tracking-widest uppercase">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-stone-400 tracking-widest uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {schedules.sort((a, b) => new Date(a.date) - new Date(b.date)).map(s => (
                    <tr key={s.id} className="hover:bg-stone-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><span className="material-symbols-outlined">description</span></div>
                          <div>
                            <p className="font-bold text-stone-900 mb-0.5 leading-none">{s.serviceName || "Care Visit"}</p>
                            <p className="text-xs text-stone-400 font-medium mt-1">Patient: {s.patientName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-stone-900 text-sm">{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <div className="text-xs text-stone-400 font-bold mt-1 tracking-tight">{formatTimeSpan(s.startTime)}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                          s.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-[#5fa5ba]"
                        )}>{s.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link to={`/family/schedule/detail/${s.id}`} className="inline-flex w-10 h-10 items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:text-[#5fa5ba] hover:border-[#5fa5ba]/30 transition-all shadow-sm">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollAnimation>

      {/* 3. Agenda & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScrollAnimation animation="fade-up" delay={0.2} className="md:col-span-2">
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            {nextVisit ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#E0F2F1] rounded-2xl flex items-center justify-center text-[#00695C] shrink-0">
                    <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 leading-tight">Upcoming Visit</h3>
                    <p className="text-sm text-stone-500 mt-1">
                      {new Date(nextVisit.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at <span className="font-bold text-stone-700">{nextVisit.startTime.substring(0, 5)}</span>
                    </p>
                  </div>
                </div>
                <Link to={`/family/schedule/detail/${nextVisit.id}`} className="px-8 py-3 bg-stone-900 text-white rounded-full text-sm font-bold shadow-lg shadow-stone-900/10 hover:scale-[1.02] transition-all">
                  View Details
                </Link>
              </>
            ) : (
              <p className="text-stone-400 font-medium py-2">No upcoming visits scheduled.</p>
            )}
          </div>
        </ScrollAnimation>

        <ScrollAnimation animation="fade-up" delay={0.3}>
          <div className="bg-[#5fa5ba] rounded-[2rem] p-6 text-white text-center relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2">download</span>
              <h3 className="font-bold text-lg">Export Schedule</h3>
              <button className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-[#5fa5ba] transition-all border border-white/20">
                Download PDF
              </button>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default CareSchedule;