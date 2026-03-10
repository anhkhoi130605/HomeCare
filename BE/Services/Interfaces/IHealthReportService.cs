namespace BE.Services.Interfaces;

public interface IHealthReportService
{
    Task<List<HealthReportDto>> GetAllAsync();
    Task<List<HealthReportDto>> GetByPatientAsync(int patientId);
    Task<List<HealthReportDto>> GetByFamilyAsync(int familyId);
    Task<HealthReportDto?> GetByIdAsync(int id);
    Task<HealthReportDto> CreateAsync(CreateHealthReportDto dto);
    Task<HealthReportDto?> UpdateAsync(int id, UpdateHealthReportDto dto);
    Task<bool> DeleteAsync(int id);
}

// DTOs
public class HealthReportDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int? CaregiverId { get; set; }
    public string? CaregiverName { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int HealthScore { get; set; }
    public string? VitalsData { get; set; }
    public string? Notes { get; set; }
    public DateTime ReportDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateHealthReportDto
{
    public int PatientId { get; set; }
    public int? CaregiverId { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Status { get; set; } = "Stable";
    public int HealthScore { get; set; } = 100;
    public string? VitalsData { get; set; }
    public string? Notes { get; set; }
    public DateTime? ReportDate { get; set; }
}

public class UpdateHealthReportDto
{
    public string? ReportType { get; set; }
    public string? Period { get; set; }
    public string? Status { get; set; }
    public int? HealthScore { get; set; }
    public string? VitalsData { get; set; }
    public string? Notes { get; set; }
}
