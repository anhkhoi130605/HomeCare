using BE.Models;

namespace BE.Services.Interfaces;

public interface IIncidentService
{
    Task<List<IncidentDto>> GetAllAsync();
    Task<List<IncidentDto>> GetByCaregiverAsync(int caregiverId);
    Task<List<IncidentDto>> GetByPatientAsync(int patientId);
    Task<IncidentDto?> GetByIdAsync(int id);
    Task<IncidentDto> CreateAsync(int caregiverId, CreateIncidentDto dto);
    Task<IncidentDto?> UpdateStatusAsync(int id, UpdateIncidentStatusDto dto);
    Task<bool> DeleteAsync(int id);
}

// DTOs
public class IncidentDto
{
    public int Id { get; set; }
    public int ScheduleId { get; set; }
    public int CaregiverId { get; set; }
    public string CaregiverName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ActionTaken { get; set; }
    public string? Resolution { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime ReportedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}

public class CreateIncidentDto
{
    public int ScheduleId { get; set; }
    public int PatientId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentSeverity Severity { get; set; }
    public DateTime OccurredAt { get; set; }
    public string? ActionTaken { get; set; }
}

public class UpdateIncidentStatusDto
{
    public IncidentStatus Status { get; set; }
    public string? Resolution { get; set; }
}
