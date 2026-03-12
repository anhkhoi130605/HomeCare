using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class HealthReportService : IHealthReportService
{
    private readonly ApplicationDbContext _context;

    public HealthReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HealthReportDto>> GetAllAsync()
    {
        var reports = await _context.HealthReports
            .Include(h => h.Patient)
            .Include(h => h.Caregiver)
            .OrderByDescending(h => h.ReportDate)
            .Take(100)
            .ToListAsync();

        return reports.Select(MapToDto).ToList();
    }

    public async Task<List<HealthReportDto>> GetByPatientAsync(int patientId)
    {
        var reports = await _context.HealthReports
            .Where(h => h.PatientId == patientId)
            .Include(h => h.Patient)
            .Include(h => h.Caregiver)
            .OrderByDescending(h => h.ReportDate)
            .ToListAsync();

        return reports.Select(MapToDto).ToList();
    }

    public async Task<List<HealthReportDto>> GetByFamilyAsync(int familyId)
    {
        // Get all patients belonging to this family
        var patientIds = await _context.Patients
            .Where(p => p.FamilyId == familyId)
            .Select(p => p.Id)
            .ToListAsync();

        var reports = await _context.HealthReports
            .Where(h => patientIds.Contains(h.PatientId))
            .Include(h => h.Patient)
            .Include(h => h.Caregiver)
            .OrderByDescending(h => h.ReportDate)
            .ToListAsync();

        return reports.Select(MapToDto).ToList();
    }

    public async Task<HealthReportDto?> GetByIdAsync(int id)
    {
        var report = await _context.HealthReports
            .Include(h => h.Patient)
            .Include(h => h.Caregiver)
            .FirstOrDefaultAsync(h => h.Id == id);

        return report != null ? MapToDto(report) : null;
    }

    public async Task<HealthReportDto> CreateAsync(CreateHealthReportDto dto)
    {
        var report = new HealthReport
        {
            PatientId = dto.PatientId,
            CaregiverId = dto.CaregiverId,
            ReportType = dto.ReportType,
            Period = dto.Period,
            Status = dto.Status,
            HealthScore = dto.HealthScore,
            VitalsData = dto.VitalsData,
            Notes = dto.Notes,
            ReportDate = dto.ReportDate ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.HealthReports.Add(report);
        await _context.SaveChangesAsync();

        await _context.Entry(report).Reference(h => h.Patient).LoadAsync();
        if (report.CaregiverId.HasValue)
            await _context.Entry(report).Reference(h => h.Caregiver).LoadAsync();

        return MapToDto(report);
    }

    public async Task<HealthReportDto?> UpdateAsync(int id, UpdateHealthReportDto dto)
    {
        var report = await _context.HealthReports
            .Include(h => h.Patient)
            .Include(h => h.Caregiver)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (report == null) return null;

        if (dto.ReportType != null) report.ReportType = dto.ReportType;
        if (dto.Period != null) report.Period = dto.Period;
        if (dto.Status != null) report.Status = dto.Status;
        if (dto.HealthScore.HasValue) report.HealthScore = dto.HealthScore.Value;
        if (dto.VitalsData != null) report.VitalsData = dto.VitalsData;
        if (dto.Notes != null) report.Notes = dto.Notes;

        await _context.SaveChangesAsync();
        return MapToDto(report);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var report = await _context.HealthReports.FindAsync(id);
        if (report == null) return false;

        _context.HealthReports.Remove(report);
        await _context.SaveChangesAsync();
        return true;
    }

    private static HealthReportDto MapToDto(HealthReport h)
    {
        return new HealthReportDto
        {
            Id = h.Id,
            PatientId = h.PatientId,
            PatientName = h.Patient?.FullName ?? "",
            CaregiverId = h.CaregiverId,
            CaregiverName = h.Caregiver?.FullName,
            ReportType = h.ReportType,
            Period = h.Period,
            Status = h.Status,
            HealthScore = h.HealthScore,
            VitalsData = h.VitalsData,
            Notes = h.Notes,
            ReportDate = h.ReportDate,
            CreatedAt = h.CreatedAt
        };
    }
}
