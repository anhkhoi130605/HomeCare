namespace BE.DTOs.Caregiver;

public class CaregiverDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string FullName { get; set; } = null!;
    public string? Specialization { get; set; }
    public int ExperienceYears { get; set; }
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
    public decimal HourlyRate { get; set; }
}

public class CaregiverProfileDto : CaregiverDto
{
    public int UpcomingSchedulesCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateCaregiverDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public string? Bio { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsAvailable { get; set; }
}

public class ScheduleDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = null!;
    public string? PatientAddress { get; set; }
    public int CaregiverId { get; set; }
    public string? CaregiverName { get; set; }
    public int? ContractId { get; set; }
    public int? CareRequestId { get; set; }
    public string? ServiceName { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public string? Notes { get; set; }
}

public class AssignScheduleDto
{
    public int RequestId { get; set; }
    public int CaregiverId { get; set; }
}

public class CaregiverPatientDto : BE.DTOs.Family.PatientDto
{
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
}

