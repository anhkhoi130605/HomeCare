using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class CareLogService : ICareLogService
{
    private readonly ApplicationDbContext _context;

    public CareLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CareLogDto>> GetAllAsync()
    {
        var logs = await _context.CareLogs
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .OrderByDescending(cl => cl.LoggedAt)
            .Take(100) // Limit to recent 100 logs
            .ToListAsync();

        return logs.Select(cl => MapToDto(cl)).ToList();
    }

    public async Task<List<CareLogDto>> GetByScheduleAsync(int scheduleId)
    {
        var logs = await _context.CareLogs
            .Where(cl => cl.ScheduleId == scheduleId)
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .OrderByDescending(cl => cl.LoggedAt)
            .ToListAsync();

        return logs.Select(cl => MapToDto(cl)).ToList();
    }

    public async Task<List<CareLogDto>> GetByCaregiverAsync(int caregiverId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.CareLogs
            .Where(cl => cl.CaregiverId == caregiverId)
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(cl => cl.LoggedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(cl => cl.LoggedAt <= to.Value.AddDays(1));

        var logs = await query.OrderByDescending(cl => cl.LoggedAt).ToListAsync();
        return logs.Select(cl => MapToDto(cl)).ToList();
    }

    public async Task<List<CareLogDto>> GetByPatientAsync(int patientId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.CareLogs
            .Where(cl => cl.PatientId == patientId)
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(cl => cl.LoggedAt >= from.Value);
        if (to.HasValue)
            query = query.Where(cl => cl.LoggedAt <= to.Value.AddDays(1));

        var logs = await query.OrderByDescending(cl => cl.LoggedAt).ToListAsync();
        return logs.Select(cl => MapToDto(cl)).ToList();
    }

    public async Task<CareLogDto?> GetByIdAsync(int id)
    {
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

        // Update schedule status if not a draft
        if (!dto.IsDraft)
        {
            schedule.Status = ScheduleStatus.Completed;
        }

        await _context.SaveChangesAsync();

        // Reload with navigation properties
        await _context.Entry(careLog).Reference(c => c.Caregiver).LoadAsync();
        await _context.Entry(careLog).Reference(c => c.Patient).LoadAsync();

        return MapToDto(careLog, dto.IsDraft);
    }

    public async Task<CareLogDto?> UpdateAsync(int id, UpdateCareLogDto dto)
    {
        var careLog = await _context.CareLogs
            .Include(cl => cl.Caregiver)
            .Include(cl => cl.Patient)
            .FirstOrDefaultAsync(cl => cl.Id == id);

        if (careLog == null) return null;

        if (dto.Activities != null) careLog.Activities = dto.Activities;
        if (dto.MedicationsGiven != null) careLog.MedicationsGiven = dto.MedicationsGiven;
        if (dto.MealsProvided != null) careLog.MealsProvided = dto.MealsProvided;
        if (dto.VitalSigns != null) careLog.VitalSigns = dto.VitalSigns;
        if (dto.PatientMood != null) careLog.PatientMood = dto.PatientMood;
        if (dto.Notes != null) careLog.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        return MapToDto(careLog, dto.IsDraft ?? false);
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
            LoggedAt = cl.LoggedAt,
            Status = isDraft ? "Draft" : "Submitted"
        };
    }
}
