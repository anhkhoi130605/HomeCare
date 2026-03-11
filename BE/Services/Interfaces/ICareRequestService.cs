using BE.Models;

namespace BE.Services.Interfaces;

public interface ICareRequestService
{
    Task<List<CareRequestDto>> GetAllAsync();
    Task<List<CareRequestDto>> GetByFamilyAsync(int familyId);
    Task<CareRequestDto?> GetByIdAsync(int id);
    Task<CareRequestDto> CreateAsync(int familyId, CreateCareRequestDto dto);
    Task<CareRequestDto?> UpdateStatusAsync(int id, RequestStatus status, string? adminNotes = null);
    Task<CareRequestDto?> AssignCaregiverAsync(int id, int caregiverId);
    Task<CareRequestDto?> RefundAsync(int id, string? adminNotes = null);
    Task<bool> DeleteAsync(int id);
}

// DTOs
public class CareRequestDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int? AssignedCaregiverId { get; set; }
    public string? AssignedCaregiverName { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RequestedDate { get; set; } = null!;
    public string? StartTime { get; set; } = string.Empty;
    public string? EndTime { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Address { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Duration { get; set; }
    public decimal TotalAmount { get; set; }
}

public class CreateCareRequestDto
{
    public int PatientId { get; set; }
    public int ServiceId { get; set; }
    public RequestType Type { get; set; }
    public DateTime RequestedDate { get; set; }
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public int Duration { get; set; }
    public string? Notes { get; set; }
    public string? Address { get; set; }
}
