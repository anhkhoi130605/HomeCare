import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, Search, GripVertical, Clock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, authApi, scheduleApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDateToYYYYMMDD } from "@/lib/utils";

const timeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "scheduled":
      return "bg-primary/10 border-l-4 border-l-primary";
    case "completed":
      return "bg-green-50 border-l-4 border-l-green-500";
    case "inprogress":
      return "bg-amber-50 border-l-4 border-l-amber-500";
    case "failed":
      return "bg-red-50 border-l-4 border-l-red-500";
    default:
      return "bg-muted";
  }
};

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const user = authApi.getCurrentUser();
  const canManage = user?.role === "OperationAdmin" || user?.role === "Admin";
  const getScheduleAddress = (s) => s.address || s.patientAddress || s.patient?.address || "";

  const [showNewShift, setShowNewShift] = useState(false);
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    caregiverId: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: ""
  });
  const [conflictMsg, setConflictMsg] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    const today = new Date();
    return {
      day: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i],
      date: date.getDate(),
      fullDate: date,
      isToday: date.toDateString() === today.toDateString()
    };
  });

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
        const data = await adminApi.getSchedules(
          formatDateToYYYYMMDD(currentWeekStart),
          formatDateToYYYYMMDD(endDate)
        );
        setSchedules(data || []);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [currentWeekStart]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const openNewShift = async () => {
    try {
      setCreating(false);
      setConflictMsg("");
      setForm({
        patientId: "",
        caregiverId: "",
        date: formatDateToYYYYMMDD(new Date()),
        startTime: "09:00",
        endTime: "11:00",
        notes: ""
      });
      const [p, c] = await Promise.all([adminApi.getPatients(), adminApi.getCaregivers()]);
      setPatients(Array.isArray(p) ? p : []);
      setCaregivers(Array.isArray(c) ? c : []);
      setShowNewShift(true);
    } catch (e) {
      console.error("Failed to load resources for new shift:", e);
    }
  };

  const submitNewShift = async () => {
    setConflictMsg("");
    // Basic validation
    if (!form.patientId || !form.caregiverId || !form.date || !form.startTime || !form.endTime) {
      setConflictMsg("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      setCreating(true);
      // Optional conflict check
      const check = await scheduleApi.checkConflict({
        caregiverId: parseInt(form.caregiverId, 10),
        date: form.date,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime
      });
      if (check?.hasConflict) {
        setConflictMsg("Ca mới trùng với lịch hiện có của caregiver này.");
        setCreating(false);
        return;
      }
      // Create
      await scheduleApi.create({
        patientId: parseInt(form.patientId, 10),
        caregiverId: parseInt(form.caregiverId, 10),
        date: form.date,
        startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
        endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
        notes: form.notes || ""
      });
      // Refresh list of schedules for current week
      const endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 6);
      const data = await adminApi.getSchedules(
        formatDateToYYYYMMDD(currentWeekStart),
        formatDateToYYYYMMDD(endDate)
      );
      setSchedules(data || []);
      setShowNewShift(false);
    } catch (e) {
      console.error("Failed to create schedule:", e);
      setConflictMsg(e?.message || "Không thể tạo ca mới, vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  // Map schedules to grid positions
  const getScheduleForSlot = (dayIndex, timeSlot) => {
    const targetDateStr = formatDateToYYYYMMDD(weekDays[dayIndex]?.fullDate);
    if (!targetDateStr) return [];

    const slotHour = parseInt(timeSlot.split(':')[0]);

    return schedules.filter(s => {
      // Use string splitting for date to avoid timezone shifts
      const scheduleDateStr = s.date?.split('T')[0];
      if (scheduleDateStr !== targetDateStr) return false;

      // Parse current shift's start hour
      if (!s.startTime) return false;
      let shiftHour = 0;
      const parts = s.startTime.split(':');
      if (parts.length >= 2) {
        const hourPart = parts[0];
        if (hourPart.includes('.')) {
          // It's "d.HH"
          shiftHour = parseInt(hourPart.split('.')[1]);
        } else {
          shiftHour = parseInt(hourPart);
        }
      }

      return shiftHour === slotHour;
    });
  };

  const getDisplayStatus = (schedule) => {
    if (!schedule) return '';
    const { status, date, startTime, endTime } = schedule;

    // Final statuses are permanent
    if (['Completed', 'Cancelled', 'Failed'].includes(status)) return status;

    const now = new Date();
    const scheduleDate = new Date(date);

    const parseTime = (timeStr) => {
      const parts = timeStr.split(':');
      const d = new Date(scheduleDate);
      d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      return d;
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    // Logic for Upcoming vs InProgress vs Not Completed
    if (now < new Date(start.getTime() - 30 * 60000)) {
      return 'Scheduled'; // Show as Upcoming
    }

    if (now > new Date(end.getTime() + 30 * 60000) && status !== 'Completed') {
      return 'Failed'; // Show as Not Completed
    }

    return status;
  };

  const unassignedSchedules = schedules.filter(s => !s.caregiverName || s.status === 'Pending');

  return (
    <div>
      <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <nav className="text-sm text-muted-foreground">
            <span>Admin</span>
            <span className="mx-2">›</span>
            <span className="text-foreground font-medium">CENTRAL CARE SCHEDULE</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[180px] text-center">{formatWeekRange()}</span>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">System Admin</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 p-6 flex flex-col min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-2 mb-4 shrink-0">
                <div className="w-20" />
                {weekDays.map((day) => (
                  <div
                    key={day.day}
                    className={`text-center py-2 rounded-lg ${day.isToday ? "bg-primary text-primary-foreground" : ""
                      }`}
                  >
                    <p className="text-xs font-medium">{day.day}</p>
                    <p className="text-2xl font-bold">{day.date}</p>
                  </div>
                ))}
              </div>

              {/* Time Grid - Scrollable */}
              <div className="relative overflow-y-auto flex-1 pr-2 custom-scrollbar-thin">
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className="grid grid-cols-8 gap-2 min-h-[80px]">
                    <div className="w-20 text-xs text-muted-foreground pt-2 text-right pr-4">
                      {time}
                    </div>
                    {weekDays.map((_, dayIndex) => {
                      const slotSchedules = getScheduleForSlot(dayIndex, time);
                      return (
                        <div
                          key={dayIndex}
                          className="border border-dashed border-border rounded-lg min-h-[80px] relative"
                        >
                          {slotSchedules.map((schedule, index) => {
                            const width = 100 / slotSchedules.length;
                            const left = index * width;
                            return (
                              <div
                                key={schedule.id}
                                className={`absolute p-1.5 rounded-lg border shadow-sm transition-all hover:z-50 ${getStatusColor(getDisplayStatus(schedule))}`}
                                style={{
                                  width: `calc(${width}% - 4px)`,
                                  left: `calc(${left}% + 2px)`,
                                  top: '4px',
                                  minHeight: '72px'
                                }}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <Badge variant="secondary" className="text-[9px] bg-transparent p-0 font-bold opacity-70">
                                    {getDisplayStatus(schedule)?.toLowerCase() === 'failed' ? 'NOT COMPLETED' : (getDisplayStatus(schedule)?.toLowerCase() === 'scheduled' ? 'UPCOMING' : getDisplayStatus(schedule)?.toUpperCase())}
                                  </Badge>
                                </div>
                                <p className="font-bold text-[11px] leading-tight truncate" title={schedule.patientName}>
                                  {schedule.patientName}
                                </p>
                                <div className="space-y-1 mt-1 opacity-90">
                                  <div className="flex items-center gap-1.5 text-[9px]">
                                    <Home className="w-2.5 h-2.5 shrink-0" />
                                    <p className="truncate" title={schedule.patientAddress}>
                                      {schedule.patientAddress || 'No address'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px]">
                                    <Clock className="w-2.5 h-2.5 shrink-0" />
                                    <p className="truncate">
                                      {schedule.startTime} - {schedule.endTime}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-black/5">
                                  <Avatar className="w-4 h-4">
                                    <AvatarImage src={schedule.caregiverImage} />
                                    <AvatarFallback className="text-[8px]">{schedule.caregiverName?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] truncate font-medium">{schedule.caregiverName?.split(' ')[0]}</span>
                                </div>
                              {getScheduleAddress(schedule) && (
                                <div className="mt-1.5 text-[10px] text-muted-foreground truncate">
                                  {getScheduleAddress(schedule)}
                                </div>
                              )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border p-6 bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">SCHEDULES</h3>
            <Badge variant="default" className="text-xs">{schedules.length} TOTAL</Badge>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Find schedule..." className="pl-10" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            {canManage && (
              <Button className="flex-1 gap-2" onClick={openNewShift}>
                <Plus className="w-4 h-4" />
                New Shift
              </Button>
            )}
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`text-[10px] ${getDisplayStatus(schedule) === 'Confirmed' || getDisplayStatus(schedule) === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      getDisplayStatus(schedule) === 'Completed' ? 'bg-green-100 text-green-700' :
                        getDisplayStatus(schedule) === 'Failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {getDisplayStatus(schedule) === 'Failed' ? 'Not Completed' : (getDisplayStatus(schedule) === 'Scheduled' ? 'Upcoming' : getDisplayStatus(schedule))}
                    </Badge>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>
                  <h4 className="font-semibold mb-2">{schedule.patientName}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Home className="w-3 h-3" />
                      <span className="truncate" title={schedule.patientAddress}>{schedule.patientAddress || 'No address'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{schedule.date?.split('T')[0]} • {schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{schedule.serviceName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Shift Status Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">SHIFT STATUS</p>
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Upcoming</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>In-Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Not Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showNewShift} onOpenChange={setShowNewShift}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Tạo Ca Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Bệnh nhân</label>
                <select
                  className="w-full border rounded-md h-9 px-2 mt-1"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Caregiver</label>
                <select
                  className="w-full border rounded-md h-9 px-2 mt-1"
                  value={form.caregiverId}
                  onChange={(e) => setForm({ ...form, caregiverId: e.target.value })}
                >
                  <option value="">Chọn caregiver</option>
                  {caregivers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Ngày</label>
                <Input type="date" className="mt-1" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Bắt đầu</label>
                <Input type="time" className="mt-1" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Kết thúc</label>
                <Input type="time" className="mt-1" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                className="w-full border rounded-md p-2 mt-1 min-h-[72px] text-sm"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Thông tin lưu ý cho ca trực..."
              />
            </div>
            {conflictMsg ? (
              <div className="text-sm text-red-600">{conflictMsg}</div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewShift(false)}>Hủy</Button>
            <Button onClick={submitNewShift} disabled={creating}>{creating ? "Đang tạo..." : "Tạo ca"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
