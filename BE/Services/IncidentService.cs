using BE.Data;
using BE.Models;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services;

public class IncidentService : IIncidentService
{
    private readonly ApplicationDbContext _context;

    public IncidentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<IncidentDto>> GetAllAsync()
    {
        var incidents = await _context.Incidents
            .Include(i => i.Caregiver)
            .Include(i => i.Patient)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync();

        return incidents.Select(i => MapToDto(i)).ToList();
    }

    public async Task<List<IncidentDto>> GetByCaregiverAsync(int caregiverId)
    {
        var incidents = await _context.Incidents
            .Where(i => i.CaregiverId == caregiverId)
            .Include(i => i.Caregiver)
            .Include(i => i.Patient)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync();

        return incidents.Select(i => MapToDto(i)).ToList();
    }

    public async Task<List<IncidentDto>> GetByPatientAsync(int patientId)
    {
        var incidents = await _context.Incidents
            .Where(i => i.PatientId == patientId)
            .Include(i => i.Caregiver)
            .Include(i => i.Patient)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync();

        return incidents.Select(i => MapToDto(i)).ToList();
    }

    public async Task<IncidentDto?> GetByIdAsync(int id)
    {
        var incident = await _context.Incidents
            .Include(i => i.Caregiver)
            .Include(i => i.Patient)
            .FirstOrDefaultAsync(i => i.Id == id);

        return incident != null ? MapToDto(incident) : null;
    }

    public async Task<IncidentDto> CreateAsync(int caregiverId, CreateIncidentDto dto)
    {
        var incident = new Incident
        {
            ScheduleId = dto.ScheduleId,
            CaregiverId = caregiverId,
            PatientId = dto.PatientId,
            Title = dto.Title,
            Description = dto.Description,
            Severity = dto.Severity,
            Status = IncidentStatus.Open,
            ActionTaken = dto.ActionTaken,
            OccurredAt = dto.OccurredAt,
            ReportedAt = DateTime.UtcNow
        };

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync();

        await _context.Entry(incident).Reference(i => i.Caregiver).LoadAsync();
        await _context.Entry(incident).Reference(i => i.Patient).LoadAsync();

        return MapToDto(incident);
    }

    public async Task<IncidentDto?> UpdateStatusAsync(int id, UpdateIncidentStatusDto dto)
    {
        var incident = await _context.Incidents
            .Include(i => i.Caregiver)
            .Include(i => i.Patient)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident == null) return null;

        incident.Status = dto.Status;
        if (dto.Resolution != null) incident.Resolution = dto.Resolution;
        
        if (dto.Status == IncidentStatus.Resolved)
        {
            incident.ResolvedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return MapToDto(incident);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var incident = await _context.Incidents.FindAsync(id);
        if (incident == null) return false;

        _context.Incidents.Remove(incident);
        await _context.SaveChangesAsync();
        return true;
    }

    private static IncidentDto MapToDto(Incident i)
    {
        return new IncidentDto
        {
            Id = i.Id,
            ScheduleId = i.ScheduleId,
            CaregiverId = i.CaregiverId,
            CaregiverName = i.Caregiver?.FullName ?? "",
            PatientId = i.PatientId,
            PatientName = i.Patient?.FullName ?? "",
            Title = i.Title,
            Description = i.Description,
            Severity = i.Severity.ToString(),
            Status = i.Status.ToString(),
            ActionTaken = i.ActionTaken,
            Resolution = i.Resolution,
            OccurredAt = i.OccurredAt,
            ReportedAt = i.ReportedAt,
            ResolvedAt = i.ResolvedAt
        };
    }
}
