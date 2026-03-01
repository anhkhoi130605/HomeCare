using System.ComponentModel.DataAnnotations;
using BE.Models;

namespace BE.DTOs.Contract;

public class ContractDto
{
    public int Id { get; set; }
    public int FamilyId { get; set; }
    public string FamilyName { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int? AssignedCaregiverId { get; set; }
    public string? CaregiverName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? WeeklySchedule { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateContractDto
{
    [Required]
    public int PatientId { get; set; }

    [Required]
    public int ServiceId { get; set; }

    public int? AssignedCaregiverId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public string? WeeklySchedule { get; set; }
    public string? Address { get; set; }
}

public class UpdateContractDto
{
    public ContractStatus? Status { get; set; }
}

public class WeeklyScheduleDto
{
    public List<string> Days { get; set; } = new();
    public string StartTime { get; set; } = "09:00";
    public string EndTime { get; set; } = "17:00";
}
