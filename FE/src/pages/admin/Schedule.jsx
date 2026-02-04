import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, Search, GripVertical, Clock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, authApi } from "@/lib/api";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "scheduled":
      return "bg-primary/10 border-l-4 border-l-primary";
    case "completed":
      return "bg-green-50 border-l-4 border-l-green-500";
    case "inprogress":
      return "bg-amber-50 border-l-4 border-l-amber-500";
    default:
      return "bg-muted";
  }
};

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const user = authApi.getCurrentUser();

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
          currentWeekStart.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
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

  // Map schedules to grid positions
  const getScheduleForSlot = (dayIndex, timeSlot) => {
    const targetDate = weekDays[dayIndex]?.fullDate;
    if (!targetDate) return [];

    return schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate.toDateString() === targetDate.toDateString() &&
        s.startTime === timeSlot;
    });
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

      <div className="flex">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
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

              {/* Time Grid */}
              <div className="relative">
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
                                className={`absolute p-1.5 rounded-lg border shadow-sm transition-all hover:z-50 ${getStatusColor(schedule.status)}`}
                                style={{
                                  width: `calc(${width}% - 4px)`,
                                  left: `calc(${left}% + 2px)`,
                                  top: '4px',
                                  minHeight: '72px'
                                }}
                              >
                                <div className="flex items-center justify-between mb-0.5">
                                  <Badge variant="secondary" className="text-[9px] bg-transparent p-0 font-bold opacity-70">
                                    {schedule.status?.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="font-bold text-[11px] leading-tight truncate" title={schedule.patientName}>
                                  {schedule.patientName}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate opacity-80">
                                  {schedule.serviceName}
                                </p>
                                <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-black/5">
                                  <Avatar className="w-4 h-4">
                                    <AvatarImage src={schedule.caregiverImage} />
                                    <AvatarFallback className="text-[8px]">{schedule.caregiverName?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] truncate font-medium">{schedule.caregiverName?.split(' ')[0]}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
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
            <Button className="flex-1 gap-2">
              <Plus className="w-4 h-4" />
              New Shift
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {schedules.slice(0, 5).map((schedule) => (
              <Card key={schedule.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`text-[10px] ${schedule.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                      schedule.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {schedule.status}
                    </Badge>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>
                  <h4 className="font-semibold mb-2">{schedule.patientName}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Home className="w-3 h-3" />
                      <span>{schedule.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(schedule.date).toLocaleDateString()} • {schedule.startTime} - {schedule.endTime}</span>
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
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>In-Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;