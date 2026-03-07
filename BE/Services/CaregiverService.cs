using BE.Data;
using BE.DTOs.Caregiver;
using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public interface ICaregiverService
{
    Task<List<CaregiverDto>> GetAllCaregiversAsync(bool? available = null);
    Task<CaregiverDto?> GetCaregiverAsync(int caregiverId);
    Task<CaregiverProfileDto?> GetProfileAsync(int userId);
    Task<CaregiverProfileDto> UpdateProfileAsync(int userId, UpdateCaregiverDto dto);
    Task<List<ScheduleDto>> GetSchedulesAsync(int caregiverId, DateTime? from = null, DateTime? to = null);
    Task<ScheduleDto?> CheckInAsync(int caregiverId, int scheduleId);
    Task<ScheduleDto?> CheckOutAsync(int caregiverId, int scheduleId);
    Task<CaregiverPatientDto?> GetPatientAsync(int patientId);
}

public class CaregiverService : ICaregiverService
{
    private readonly ApplicationDbContext _context;

    public CaregiverService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CaregiverDto>> GetAllCaregiversAsync(bool? available = null)
    {
        var query = _context.Caregivers
            .AsNoTracking()
            .Include(c => c.User)
            .AsQueryable();

        if (available.HasValue)
        {
            query = query.Where(c => c.IsAvailable == available.Value);
        }

        return await query.Select(c => new CaregiverDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Email = c.User.Email,
            Phone = c.User.Phone,
            FullName = c.FullName,
            Specialization = c.Specialization,
            ExperienceYears = c.ExperienceYears,
            Bio = c.Bio,
            ImageUrl = c.ImageUrl,
            IsAvailable = c.IsAvailable,
            HourlyRate = c.HourlyRate
        }).ToListAsync();
    }

    public async Task<CaregiverDto?> GetCaregiverAsync(int caregiverId)
    {
        var c = await _context.Caregivers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == caregiverId);

        if (c == null) return null;

        return new CaregiverDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Email = c.User.Email,
            Phone = c.User.Phone,
            FullName = c.FullName,
            Specialization = c.Specialization,
            ExperienceYears = c.ExperienceYears,
            Bio = c.Bio,
            ImageUrl = c.ImageUrl,
            IsAvailable = c.IsAvailable,
            HourlyRate = c.HourlyRate
        };
    }

    public async Task<CaregiverProfileDto?> GetProfileAsync(int userId)
    {
        var caregiver = await _context.Caregivers
            .Include(c => c.User)
            .Include(c => c.Schedules)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (caregiver == null) return null;

        var upcomingSchedules = caregiver.Schedules?
            .Where(s => s.Date >= DateTime.Today && s.Status != ScheduleStatus.Completed)
            .Count() ?? 0;

        return new CaregiverProfileDto
        {
            Id = caregiver.Id,
            UserId = caregiver.UserId,
            Email = caregiver.User.Email,
            Phone = caregiver.User.Phone,
            FullName = caregiver.FullName,
            Specialization = caregiver.Specialization,
            ExperienceYears = caregiver.ExperienceYears,
            Bio = caregiver.Bio,
            ImageUrl = caregiver.ImageUrl,
            IsAvailable = caregiver.IsAvailable,
            HourlyRate = caregiver.HourlyRate,
            UpcomingSchedulesCount = upcomingSchedules,
            CreatedAt = caregiver.CreatedAt
        };
    }

    public async Task<CaregiverProfileDto> UpdateProfileAsync(int userId, UpdateCaregiverDto dto)
    {
        var caregiver = await _context.Caregivers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (caregiver == null)
            throw new KeyNotFoundException("Caregiver profile not found");

        caregiver.FullName = dto.FullName ?? caregiver.FullName;
        caregiver.Specialization = dto.Specialization ?? caregiver.Specialization;
        caregiver.Bio = dto.Bio ?? caregiver.Bio;
        caregiver.ImageUrl = dto.ImageUrl ?? caregiver.ImageUrl;
        caregiver.IsAvailable = dto.IsAvailable ?? caregiver.IsAvailable;

        if (!string.IsNullOrEmpty(dto.Phone))
        {
            caregiver.User.Phone = dto.Phone;
        }

        await _context.SaveChangesAsync();

        return (await GetProfileAsync(userId))!;
    }

    public async Task<List<ScheduleDto>> GetSchedulesAsync(int caregiverId, DateTime? from = null, DateTime? to = null)
    {
        var query = _context.Schedules
            .Include(s => s.Patient)
            .Include(s => s.Contract).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest).ThenInclude(r => r.Service)
            .Where(s => s.CaregiverId == caregiverId);

        if (from.HasValue)
            query = query.Where(s => s.Date >= from.Value);

        if (to.HasValue)
            query = query.Where(s => s.Date <= to.Value);

        var schedules = await query.OrderBy(s => s.Date).ThenBy(s => s.StartTime).ToListAsync();

        return schedules.Select(s => new ScheduleDto
        {
            Id = s.Id,
            PatientId = s.PatientId,
            PatientName = s.Patient.FullName,
            PatientAddress = s.Patient.Address,
            CaregiverId = s.CaregiverId,
            ContractId = s.ContractId,
            CareRequestId = s.CareRequestId,
            ServiceName = s.CareRequest?.Service?.Name ?? s.Contract?.Service?.Name,
            Date = s.Date,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Status = s.Status.ToString(),
            CheckInTime = s.CheckInTime,
            CheckOutTime = s.CheckOutTime,
            Notes = s.Notes
        }).ToList();
    }

    public async Task<ScheduleDto?> CheckInAsync(int caregiverId, int scheduleId)
    {
        var schedule = await _context.Schedules
            .Include(s => s.Patient)
            .Include(s => s.Contract).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest).ThenInclude(r => r.Service)
            .FirstOrDefaultAsync(s => s.Id == scheduleId && s.CaregiverId == caregiverId);

        if (schedule == null) return null;

        schedule.Status = ScheduleStatus.InProgress;
        schedule.CheckInTime = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ScheduleDto
        {
            Id = schedule.Id,
            PatientId = schedule.PatientId,
            PatientName = schedule.Patient.FullName,
            PatientAddress = schedule.Patient.Address,
            CaregiverId = schedule.CaregiverId,
            ContractId = schedule.ContractId,
            CareRequestId = schedule.CareRequestId,
            ServiceName = schedule.CareRequest?.Service?.Name ?? schedule.Contract?.Service?.Name,
            Date = schedule.Date,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Status = schedule.Status.ToString(),
            CheckInTime = schedule.CheckInTime,
            CheckOutTime = schedule.CheckOutTime,
            Notes = schedule.Notes
        };
    }

    public async Task<ScheduleDto?> CheckOutAsync(int caregiverId, int scheduleId)
    {
        var schedule = await _context.Schedules
            .Include(s => s.Patient)
            .Include(s => s.Contract).ThenInclude(c => c.Service)
            .Include(s => s.CareRequest).ThenInclude(r => r.Service)
            .FirstOrDefaultAsync(s => s.Id == scheduleId && s.CaregiverId == caregiverId);

        if (schedule == null) return null;

        schedule.Status = ScheduleStatus.Completed;
        schedule.CheckOutTime = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ScheduleDto
        {
            Id = schedule.Id,
            PatientId = schedule.PatientId,
            PatientName = schedule.Patient.FullName,
            PatientAddress = schedule.Patient.Address,
            CaregiverId = schedule.CaregiverId,
            ContractId = schedule.ContractId,
            CareRequestId = schedule.CareRequestId,
            ServiceName = schedule.CareRequest?.Service?.Name ?? schedule.Contract?.Service?.Name,
            Date = schedule.Date,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Status = schedule.Status.ToString(),
            CheckInTime = schedule.CheckInTime,
            CheckOutTime = schedule.CheckOutTime,
            Notes = schedule.Notes
        };
    }
    public async Task<CaregiverPatientDto?> GetPatientAsync(int patientId)
    {
        var patient = await _context.Patients
            .Include(p => p.Family)
            .ThenInclude(f => f.User)
            .FirstOrDefaultAsync(p => p.Id == patientId);

        if (patient == null) return null;

        return new CaregiverPatientDto
        {
            Id = patient.Id,
            FamilyId = patient.FamilyId,
            FullName = patient.FullName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            MedicalHistory = patient.MedicalHistory,
            Allergies = patient.Allergies,
            CurrentCondition = patient.CurrentCondition,
            Address = patient.Address,
            CreatedAt = patient.CreatedAt,
            EmergencyContactName = patient.Family.EmergencyContact ?? patient.Family.FullName,
            EmergencyContactPhone = patient.Family.User.Phone
        };
    }
}
