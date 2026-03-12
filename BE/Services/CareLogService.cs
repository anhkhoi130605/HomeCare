using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class CareLogService : ICareLogService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IHealthReportService _healthReportService;

    public CareLogService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IHealthReportService healthReportService)
    {
        _context = context;
        _notificationService = notificationService;
        _healthReportService = healthReportService;
    }

    public async Task<List<CareLogDto>> GetAllAsync()
    {
        var logs = await _context.CareLogs
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .ToListAsync();

        var dtos = logs.Select(MapToDto).ToList();
        var loggedScheduleIds = logs.Select(l => l.ScheduleId).ToHashSet();

        var extraSchedules = await _context.Schedules
            .Where(s => s.Status == ScheduleStatus.Completed && !loggedScheduleIds.Contains(s.Id))
            .Include(s => s.Caregiver)
            .Include(s => s.Patient)
            .OrderByDescending(s => s.Date)
            .Take(100)
            .ToListAsync();

        foreach (var s in extraSchedules)
        {
            dtos.Add(new CareLogDto
            {
                Id = -s.Id,
                ScheduleId = s.Id,
                CaregiverId = s.CaregiverId,
                CaregiverName = s.Caregiver?.FullName ?? "",
                PatientId = s.PatientId,
                PatientName = s.Patient?.FullName ?? "",
                Activities = s.Notes ?? "Completed shift log (Auto-generated entry)",
                LoggedAt = s.CheckOutTime.HasValue
                    ? new DateTimeOffset(DateTime.SpecifyKind(s.CheckOutTime.Value, DateTimeKind.Utc))
                    : new DateTimeOffset(DateTime.SpecifyKind(s.Date.Date.Add(s.EndTime), DateTimeKind.Utc)),
                Status = "Submitted"
            });
        }

        return dtos.OrderByDescending(d => d.LoggedAt).Take(100).ToList();
    }

    public async Task<List<CareLogDto>> GetByScheduleAsync(int scheduleId)
    {
        var logs = await _context.CareLogs
            .Where(cl => cl.ScheduleId == scheduleId)
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .OrderByDescending(cl => cl.LoggedAt)
            .ToListAsync();

        return logs.Select(MapToDto).ToList();
    }

    public async Task<CareLogDto?> GetByIdAsync(int id)
    {
        if (id < 0)
        {
            int scheduleId = -id;

            var s = await _context.Schedules
                .Include(s => s.Caregiver)
                .Include(s => s.Patient)
                .FirstOrDefaultAsync(s => s.Id == scheduleId);

            if (s == null) return null;

            return new CareLogDto
            {
                Id = id,
                ScheduleId = s.Id,
                CaregiverId = s.CaregiverId,
                CaregiverName = s.Caregiver?.FullName ?? "",
                PatientId = s.PatientId,
                PatientName = s.Patient?.FullName ?? "",
                Activities = s.Notes ?? "Completed shift log",
                LoggedAt = s.CheckOutTime.HasValue
                    ? new DateTimeOffset(DateTime.SpecifyKind(s.CheckOutTime.Value, DateTimeKind.Utc))
                    : new DateTimeOffset(DateTime.SpecifyKind(s.Date.Date.Add(s.EndTime), DateTimeKind.Utc)),
                Status = "Submitted"
            };
        }

        var careLog = await _context.CareLogs
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .FirstOrDefaultAsync(cl => cl.Id == id);

        return careLog != null ? MapToDto(careLog) : null;
    }

    public async Task<CareLogDto> CreateAsync(int caregiverId, CreateCareLogDto dto)
    {
        var schedule = await _context.Schedules.FindAsync(dto.ScheduleId);
        if (schedule == null)
            throw new ArgumentException("Schedule not found");

        if (dto.PatientId != schedule.PatientId)
            throw new ArgumentException("Patient ID does not match the schedule.");

        var careLog = new CareLog
        {
            ScheduleId = dto.ScheduleId,
            CaregiverId = caregiverId,
            PatientId = dto.PatientId,
            Activities = dto.Activities,
            MedicationsGiven = dto.MedicationsGiven,
            MealsProvided = dto.MealsProvided,
            VitalSigns = dto.VitalSigns,
            PatientMood = dto.PatientMood,
            Notes = dto.Notes,
            LoggedAt = DateTime.UtcNow
        };

        _context.CareLogs.Add(careLog);

        if (!dto.IsDraft)
        {
            schedule.Status = ScheduleStatus.Completed;
        }

        await _context.SaveChangesAsync();

        var patient = await _context.Patients
            .Include(p => p.Family)
            .FirstOrDefaultAsync(p => p.Id == careLog.PatientId);

        await _context.Entry(careLog).Reference(c => c.Caregiver).LoadAsync();
        careLog.Patient = patient!;

        return MapToDto(careLog, dto.IsDraft);
    }

    private async Task CreateHealthReportAndNotify(CareLog careLog, int familyUserId)
    {
        await _notificationService.CreateNotificationAsync(
            familyUserId,
            "New Care Log Submitted",
            $"Caregiver {careLog.Caregiver?.FullName ?? "Someone"} submitted a care log for {careLog.Patient?.FullName ?? "your patient"}",
            "CareLog",
            careLog.Id
        );

        await _healthReportService.CreateAsync(new CreateHealthReportDto
        {
            PatientId = careLog.PatientId,
            CaregiverId = careLog.CaregiverId,
            ReportType = "Daily Shift Summary",
            Period = "Today",
            Status = "Stable",
            HealthScore = 100,
            VitalsData = careLog.VitalSigns,
            Notes = careLog.Activities,
            ReportDate = careLog.LoggedAt
        });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var careLog = await _context.CareLogs.FindAsync(id);
        if (careLog == null) return false;

        _context.CareLogs.Remove(careLog);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CareLogDto MapToDto(CareLog cl, bool isDraft = false)
    {
        return new CareLogDto
        {
            Id = cl.Id,
            ScheduleId = cl.ScheduleId,
            CaregiverId = cl.CaregiverId,
            CaregiverName = cl.Caregiver?.FullName ?? "",
            PatientId = cl.PatientId,
            PatientName = cl.Patient?.FullName ?? "",
            Activities = cl.Activities,
            MedicationsGiven = cl.MedicationsGiven,
            MealsProvided = cl.MealsProvided,
            VitalSigns = cl.VitalSigns,
            PatientMood = cl.PatientMood,
            Notes = cl.Notes,
            LoggedAt = new DateTimeOffset(DateTime.SpecifyKind(cl.LoggedAt, DateTimeKind.Utc)),
            Status = isDraft ? "Draft" : "Submitted"
        };
    }
}