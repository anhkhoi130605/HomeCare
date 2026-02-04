using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE.Models;

public class Schedule
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    [ForeignKey("PatientId")]
    public Patient Patient { get; set; } = null!;

    public int CaregiverId { get; set; }

    [ForeignKey("CaregiverId")]
    public Caregiver Caregiver { get; set; } = null!;

    public int? ContractId { get; set; }

    [ForeignKey("ContractId")]
    public Contract? Contract { get; set; }

    public DateTime Date { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public ScheduleStatus Status { get; set; } = ScheduleStatus.Scheduled;

    public DateTime? CheckInTime { get; set; }

    public DateTime? CheckOutTime { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
