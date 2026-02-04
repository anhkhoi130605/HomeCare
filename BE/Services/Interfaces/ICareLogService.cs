using BE.DTOs.Caregiver;

namespace BE.Services.Interfaces;

public interface ICareLogService
{
    Task<List<CareLogDto>> GetAllAsync();
    Task<List<CareLogDto>> GetByScheduleAsync(int scheduleId);
    Task<List<CareLogDto>> GetByCaregiverAsync(int caregiverId, DateTime? from = null, DateTime? to = null);
    Task<List<CareLogDto>> GetByPatientAsync(int patientId, DateTime? from = null, DateTime? to = null);
    Task<CareLogDto?> GetByIdAsync(int id);
    Task<CareLogDto> CreateAsync(int caregiverId, CreateCareLogDto dto);
    Task<CareLogDto?> UpdateAsync(int id, UpdateCareLogDto dto);
    Task<bool> DeleteAsync(int id);
}

// DTOs
public class CareLogDto
{
    public int Id { get; set; }
    public int ScheduleId { get; set; }
    public int CaregiverId { get; set; }
    public string CaregiverName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string Activities { get; set; } = string.Empty;
    public string? MedicationsGiven { get; set; }
    public string? MealsProvided { get; set; }
    public string? VitalSigns { get; set; }
    public string? PatientMood { get; set; }
    public string? Notes { get; set; }
    public DateTime LoggedAt { get; set; }
    public string Status { get; set; } = "Submitted"; // Submitted or Draft
}

public class CreateCareLogDto
{
    public int ScheduleId { get; set; }
    public int PatientId { get; set; }
    public string Activities { get; set; } = string.Empty;
    public string? MedicationsGiven { get; set; }
    public string? MealsProvided { get; set; }
    public string? VitalSigns { get; set; }
    public string? PatientMood { get; set; }
    public string? Notes { get; set; }
    public bool IsDraft { get; set; } = false;
}

public class UpdateCareLogDto
{
    public string? Activities { get; set; }
    public string? MedicationsGiven { get; set; }
    public string? MealsProvided { get; set; }
    public string? VitalSigns { get; set; }
    public string? PatientMood { get; set; }
    public string? Notes { get; set; }
    public bool? IsDraft { get; set; }
}
