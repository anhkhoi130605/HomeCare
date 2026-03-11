using BE.Data;
using BE.DTOs.Caregiver;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface IScheduleService
{
    Task<List<ScheduleDto>> GetAllSchedulesAsync(DateTime? from = null, DateTime? to = null);
    Task<List<ScheduleDto>> GetSchedulesByCaregiverAsync(int caregiverId, DateTime? from = null, DateTime? to = null);
    Task<List<ScheduleDto>> GetSchedulesByPatientAsync(int patientId, DateTime? from = null, DateTime? to = null);
    Task<ScheduleDto?> GetScheduleByIdAsync(int id);
    Task<ScheduleDto> CreateScheduleAsync(CreateScheduleDto dto);
    Task<ScheduleDto?> UpdateScheduleAsync(int id, UpdateScheduleDto dto);
    Task<bool> DeleteScheduleAsync(int id);
    Task<bool> HasConflictAsync(int caregiverId, DateTime date, TimeSpan startTime, TimeSpan endTime, int? excludeScheduleId = null);
    Task<bool> HasRequestConflictAsync(int caregiverId, int requestId);
    Task<ScheduleGenerationResult> GenerateSchedulesFromContractAsync(int contractId);
    Task<ScheduleDto?> CheckInAsync(int scheduleId);
    Task<ScheduleDto?> CheckOutAsync(int scheduleId, string notes);
    Task<ScheduleDto> AssignFromRequestAsync(AssignScheduleDto dto);
}

public class ScheduleGenerationResult
{
    public List<ScheduleDto> GeneratedSchedules { get; set; } = new();
    public List<ConflictingSlot> Conflicts { get; set; } = new();
}

public class ConflictingSlot
{
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class CreateScheduleDto
{
    public int PatientId { get; set; }
    public int CaregiverId { get; set; }
    public int? ContractId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Notes { get; set; }
}

public class UpdateScheduleDto
{
    public DateTime? Date { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public ScheduleStatus? Status { get; set; }
    public string? Notes { get; set; }
}

public class ScheduleService : IScheduleService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public ScheduleService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<List<ScheduleDto>> GetAllSchedulesAsync(DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Schedules
            .Include(s => s.Patient).ThenInclude(p => p.Family)
            .Include(s => s.Caregiver)
            .Include(s => s.Contract!).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest!).ThenInclude(r => r.Service)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(s => s.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.Date <= to.Value);

        var schedules = await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync();
        return schedules.Select(MapToDto).ToList();
    }

    public async Task<List<ScheduleDto>> GetSchedulesByCaregiverAsync(int caregiverId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Schedules
            .Include(s => s.Patient).ThenInclude(p => p.Family)
            .Include(s => s.Caregiver)
            .Include(s => s.Contract!).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest!).ThenInclude(r => r.Service)
            .Where(s => s.CaregiverId == caregiverId);

        if (from.HasValue)
            query = query.Where(s => s.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.Date <= to.Value);

        var schedules = await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync();
        return schedules.Select(MapToDto).ToList();
    }

    public async Task<List<ScheduleDto>> GetSchedulesByPatientAsync(int patientId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Schedules
            .Include(s => s.Patient).ThenInclude(p => p.Family)
            .Include(s => s.Caregiver)
            .Include(s => s.Contract!).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest!).ThenInclude(r => r.Service)
            .Where(s => s.PatientId == patientId);

        if (from.HasValue)
            query = query.Where(s => s.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.Date <= to.Value);

        var schedules = await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync();
        return schedules.Select(MapToDto).ToList();
    }

    public async Task<ScheduleDto?> GetScheduleByIdAsync(int id)
    {
        var schedule = await _context.Schedules
            .Include(s => s.Patient).ThenInclude(p => p.Family)
            .Include(s => s.Caregiver)
            .Include(s => s.Contract!).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest!).ThenInclude(r => r.Service)
            .FirstOrDefaultAsync(s => s.Id == id);

        return schedule == null ? null : MapToDto(schedule);
    }

    public async Task<ScheduleDto> CreateScheduleAsync(CreateScheduleDto dto)
    {
        // Check for conflicts
        var hasConflict = await HasConflictAsync(dto.CaregiverId, dto.Date, dto.StartTime, dto.EndTime);
        if (hasConflict)
            throw new InvalidOperationException("Schedule conflicts with existing schedule for this caregiver.");

        var schedule = new Schedule
        {
            PatientId = dto.PatientId,
            CaregiverId = dto.CaregiverId,
            ContractId = dto.ContractId,
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Notes = dto.Notes,
            Status = ScheduleStatus.Scheduled
        };

        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();

        // Reload with includes
        var created = await GetScheduleByIdAsync(schedule.Id);
        return created!;
    }

    public async Task<ScheduleDto?> UpdateScheduleAsync(int id, UpdateScheduleDto dto)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null) return null;

        // Check for conflicts if date/time changed
        var newDate = dto.Date ?? schedule.Date;
        var newStart = dto.StartTime ?? schedule.StartTime;
        var newEnd = dto.EndTime ?? schedule.EndTime;

        if (dto.Date.HasValue || dto.StartTime.HasValue || dto.EndTime.HasValue)
        {
            var hasConflict = await HasConflictAsync(schedule.CaregiverId, newDate, newStart, newEnd, id);
            if (hasConflict)
                throw new InvalidOperationException("Schedule conflicts with existing schedule for this caregiver.");
        }

        schedule.Date = newDate;
        schedule.StartTime = newStart;
        schedule.EndTime = newEnd;
        if (dto.Status.HasValue) schedule.Status = dto.Status.Value;
        if (dto.Notes != null) schedule.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return await GetScheduleByIdAsync(id);
    }

    public async Task<bool> DeleteScheduleAsync(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null) return false;

        _context.Schedules.Remove(schedule);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasConflictAsync(int caregiverId, DateTime date, TimeSpan startTime, TimeSpan endTime, int? excludeScheduleId = null)
    {
        var query = _context.Schedules
            .Where(s => s.CaregiverId == caregiverId)
            .Where(s => s.Date == date.Date)
            .Where(s => s.Status != ScheduleStatus.Cancelled);

        if (excludeScheduleId.HasValue)
            query = query.Where(s => s.Id != excludeScheduleId.Value);

        // Check for time overlap: (existingStart < newEnd) AND (existingEnd > newStart)
        // Only count Scheduled or InProgress shifts as conflicts
        var conflicting = await query
            .Where(s => s.Status == ScheduleStatus.Scheduled || s.Status == ScheduleStatus.InProgress)
            .Where(s => s.StartTime < endTime && s.EndTime > startTime)
            .AnyAsync();

        return conflicting;
    }

    public async Task<bool> HasRequestConflictAsync(int caregiverId, int requestId)
    {
        var request = await _context.CareRequests.FindAsync(requestId);
        if (request == null) return false;

        return await HasConflictAsync(caregiverId, request.RequestedDate, request.StartTime, request.EndTime);
    }

    public async Task<ScheduleGenerationResult> GenerateSchedulesFromContractAsync(int contractId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Service)
            .FirstOrDefaultAsync(c => c.Id == contractId);

        if (contract == null)
            throw new KeyNotFoundException("Contract not found");

        if (contract.AssignedCaregiverId == null)
            throw new InvalidOperationException("Contract has no assigned caregiver");

        if (string.IsNullOrEmpty(contract.WeeklySchedule))
            throw new InvalidOperationException("Contract has no weekly schedule defined");

        var result = new ScheduleGenerationResult();

        // Parse weekly schedule JSON
        try
        {
            // Map day strings to DayOfWeek
            var dayMapping = new Dictionary<string, DayOfWeek>(StringComparer.OrdinalIgnoreCase)
            {
                ["monday"] = DayOfWeek.Monday, ["tuesday"] = DayOfWeek.Tuesday, ["wednesday"] = DayOfWeek.Wednesday,
                ["thursday"] = DayOfWeek.Thursday, ["friday"] = DayOfWeek.Friday, ["saturday"] = DayOfWeek.Saturday, ["sunday"] = DayOfWeek.Sunday,
                ["mon"] = DayOfWeek.Monday, ["tue"] = DayOfWeek.Tuesday, ["wed"] = DayOfWeek.Wednesday,
                ["thu"] = DayOfWeek.Thursday, ["fri"] = DayOfWeek.Friday, ["sat"] = DayOfWeek.Saturday, ["sun"] = DayOfWeek.Sunday
            };

            var selectedDays = new List<DayOfWeek>();
            var startTime = TimeSpan.Zero;
            var endTime = TimeSpan.Zero;

            if (contract.WeeklySchedule.Trim().StartsWith("{"))
            {
                var weeklySchedule = System.Text.Json.JsonSerializer.Deserialize<WeeklyScheduleInfo>(contract.WeeklySchedule);
                if (weeklySchedule == null || weeklySchedule.Days == null || !weeklySchedule.Days.Any())
                    throw new InvalidOperationException("Invalid weekly schedule format");

                if (!TimeSpan.TryParse(weeklySchedule.StartTime, out startTime) ||
                    !TimeSpan.TryParse(weeklySchedule.EndTime, out endTime))
                    throw new InvalidOperationException("Invalid time format in weekly schedule");

                selectedDays = weeklySchedule.Days.Where(d => dayMapping.ContainsKey(d)).Select(d => dayMapping[d]).ToList();
            }
            else if (contract.WeeklySchedule.Contains("|"))
            {
                var parts = contract.WeeklySchedule.Split('|');
                if (parts.Length == 2)
                {
                    var days = parts[0].Split(',', StringSplitOptions.RemoveEmptyEntries);
                    selectedDays = days.Where(d => dayMapping.ContainsKey(d.Trim())).Select(d => dayMapping[d.Trim()]).ToList();
                    var times = parts[1].Split('-');
                    if (times.Length == 2 && TimeSpan.TryParse(times[0], out startTime) && TimeSpan.TryParse(times[1], out endTime)) { }
                    else throw new InvalidOperationException("Invalid time format in legacy weekly schedule");
                }
            }

            for (var date = contract.StartDate.Date; date <= contract.EndDate.Date; date = date.AddDays(1))
            {
                if (!selectedDays.Contains(date.DayOfWeek)) continue;

                if (await HasConflictAsync(contract.AssignedCaregiverId.Value, date, startTime, endTime))
                {
                    result.Conflicts.Add(new ConflictingSlot
                    {
                        Date = date,
                        StartTime = startTime,
                        EndTime = endTime,
                        Reason = "Caregiver has another shift at this time."
                    });
                    continue;
                }

                var schedule = new Schedule
                {
                    PatientId = contract.PatientId,
                    CaregiverId = contract.AssignedCaregiverId.Value,
                    ContractId = contractId,
                    Date = date,
                    StartTime = startTime,
                    EndTime = endTime,
                    Status = ScheduleStatus.Scheduled,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync();
                result.GeneratedSchedules.Add(MapToDto(schedule));
            }

            return result;
        }
        catch (System.Text.Json.JsonException)
        {
            throw new InvalidOperationException("Failed to parse weekly schedule JSON");
        }
    }

    public async Task<ScheduleDto?> CheckInAsync(int scheduleId)
    {
        var schedule = await _context.Schedules.FindAsync(scheduleId);
        if (schedule == null) return null;

        // Time guard: Only allow check-in within 30 minutes of start time
        var now = DateTime.Now;
        var shiftStart = schedule.Date.Date.Add(schedule.StartTime);
        if (now < shiftStart.AddMinutes(-30))
        {
            throw new InvalidOperationException("You can only check in up to 30 minutes before the shift starts.");
        }

        schedule.CheckInTime = DateTime.UtcNow;
        schedule.Status = ScheduleStatus.InProgress;

        await _context.SaveChangesAsync();

        return await GetScheduleByIdAsync(scheduleId);
    }

    public async Task<ScheduleDto?> CheckOutAsync(int scheduleId, string notes)
    {
        var schedule = await _context.Schedules.FindAsync(scheduleId);
        if (schedule == null) return null;

        schedule.CheckOutTime = DateTime.UtcNow;
        schedule.Status = ScheduleStatus.Completed;
        schedule.Notes = notes;

        await _context.SaveChangesAsync();

        return await GetScheduleByIdAsync(scheduleId);
    }

    public async Task<ScheduleDto> AssignFromRequestAsync(AssignScheduleDto dto)
    {
        var request = await _context.CareRequests
            .Include(r => r.Patient)
            .FirstOrDefaultAsync(r => r.Id == dto.RequestId);

        if (request == null)
            throw new KeyNotFoundException("Request not found");

        // Check for schedule conflicts before assigning
        var hasConflict = await HasConflictAsync(dto.CaregiverId, request.RequestedDate, request.StartTime, request.EndTime);
        if (hasConflict)
            throw new InvalidOperationException("Lịch bị trùng! Caregiver này đã có lịch làm việc trùng giờ trong ngày được yêu cầu.");

        var schedule = new Schedule
        {
            PatientId = request.PatientId,
            CaregiverId = dto.CaregiverId,
            CareRequestId = request.Id,
            Date = request.RequestedDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = ScheduleStatus.Scheduled
        };

        _context.Schedules.Add(schedule);
        
        // Update request status to Assigned
        request.Status = RequestStatus.Assigned;

        await _context.SaveChangesAsync();

        // Notify caregiver
        var caregiver = await _context.Caregivers.FindAsync(dto.CaregiverId);
        if (caregiver != null)
        {
            await _notificationService.CreateNotificationAsync(
                caregiver.UserId,
                "New Shift Assigned",
                $"You have been assigned a new shift for {request.Patient?.FullName} on {request.RequestedDate:MMM dd, yyyy}.",
                "Schedule",
                schedule.Id
            );
        }

        return (await GetScheduleByIdAsync(schedule.Id))!;
    }

    private static ScheduleDto MapToDto(Schedule s)
    {
        var status = s.Status;
        
        // Dynamic "Failed" status for display if shift is past its end time and not completed
        if (status == ScheduleStatus.Scheduled || status == ScheduleStatus.InProgress)
        {
            var now = DateTime.Now;
            var shiftStartDateTime = s.Date.Date.Add(s.StartTime);
            var shiftEndDateTime = s.Date.Date.Add(s.EndTime);
            
            // 1. Safety check for premature InProgress (from previous auto-checkin bugs)
            if (status == ScheduleStatus.InProgress && shiftStartDateTime > now.AddMinutes(30))
            {
                status = ScheduleStatus.Scheduled;
            }
            
            // 2. Dynamic "Failed" status if shift is past its end time and not completed
            if (shiftEndDateTime < now.AddMinutes(-30) && status != ScheduleStatus.Completed)
            {
                status = ScheduleStatus.Failed;
            }
        }

        return new ScheduleDto
        {
            Id = s.Id,
            PatientId = s.PatientId,
            PatientName = s.Patient?.FullName ?? "",
            PatientAddress = !string.IsNullOrWhiteSpace(s.Patient?.Address) ? s.Patient.Address 
                : (!string.IsNullOrWhiteSpace(s.CareRequest?.Address) ? s.CareRequest.Address
                : (!string.IsNullOrWhiteSpace(s.Contract?.Address) ? s.Contract.Address
                : (!string.IsNullOrWhiteSpace(s.Patient?.Family?.Address) ? s.Patient.Family.Address 
                : "No address provided"))),
            CaregiverId = s.CaregiverId,
            CaregiverName = s.Caregiver?.FullName,
            ContractId = s.ContractId,
            CareRequestId = s.CareRequestId,
            ServiceName = s.CareRequest?.Service?.Name ?? s.Contract?.Service?.Name,
            Date = s.Date.ToString("yyyy-MM-dd"),
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Status = status.ToString(),
            CheckInTime = s.CheckInTime,
            CheckOutTime = s.CheckOutTime,
            Notes = s.Notes
        };
    }

    private class WeeklyScheduleInfo
    {
        public List<string> Days { get; set; } = new();
        public string StartTime { get; set; } = "";
        public string EndTime { get; set; } = "";
    }
}
